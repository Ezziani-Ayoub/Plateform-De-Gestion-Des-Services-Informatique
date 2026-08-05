package com.pgsi.service;

import com.pgsi.dto.CreateEquipmentRequest;
import com.pgsi.dto.EquipmentDto;
import com.pgsi.dto.UpdateEquipmentRequest;
import com.pgsi.entity.Equipment;
import com.pgsi.entity.EquipmentStatus;
import com.pgsi.entity.User;
import com.pgsi.exception.BadRequestException;
import com.pgsi.exception.ResourceNotFoundException;
import com.pgsi.repository.EquipmentRepository;
import com.pgsi.repository.EquipmentSpecification;
import com.pgsi.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public EquipmentServiceImpl(EquipmentRepository equipmentRepository, UserRepository userRepository) {
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EquipmentDto> getEquipments(String search, String category, String status, Pageable pageable) {
        EquipmentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = EquipmentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // unknown status value — treat as no filter
            }
        }
        return equipmentRepository.findAll(
                EquipmentSpecification.withFilters(search, category, statusEnum), pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentDto getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        return mapToDto(equipment);
    }

    @Override
    @Transactional
    public EquipmentDto createEquipment(CreateEquipmentRequest request) {
        if (equipmentRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new BadRequestException("Un équipement avec ce numéro de série existe déjà");
        }

        User assignedUser = null;
        if (request.getAssignedToId() != null) {
            assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
        }

        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .serialNumber(request.getSerialNumber())
                .category(request.getCategory())
                .status(request.getStatus())
                .location(request.getLocation())
                .purchaseDate(request.getPurchaseDate())
                .description(request.getDescription())
                .assignedTo(assignedUser)
                .build();

        Equipment savedEquipment = equipmentRepository.save(equipment);
        return mapToDto(savedEquipment);
    }

    @Override
    @Transactional
    public EquipmentDto updateEquipment(Long id, UpdateEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));

        if (request.getName() != null) equipment.setName(request.getName());
        if (request.getCategory() != null) equipment.setCategory(request.getCategory());
        if (request.getStatus() != null) equipment.setStatus(request.getStatus());
        if (request.getLocation() != null) equipment.setLocation(request.getLocation());
        if (request.getPurchaseDate() != null) equipment.setPurchaseDate(request.getPurchaseDate());
        if (request.getDescription() != null) equipment.setDescription(request.getDescription());

        if (request.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
            equipment.setAssignedTo(assignedUser);
        }

        Equipment updatedEquipment = equipmentRepository.save(equipment);
        return mapToDto(updatedEquipment);
    }

    @Override
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        equipmentRepository.delete(equipment);
    }

    @Override
    @Transactional
    public EquipmentDto assignEquipmentToUser(Long equipmentId, Long userId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            equipment.setAssignedTo(user);
            equipment.setStatus(EquipmentStatus.IN_USE);
        } else {
            equipment.setAssignedTo(null);
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }

        Equipment updatedEquipment = equipmentRepository.save(equipment);
        return mapToDto(updatedEquipment);
    }

    private EquipmentDto mapToDto(Equipment equipment) {
        return EquipmentDto.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .serialNumber(equipment.getSerialNumber())
                .category(equipment.getCategory())
                .status(equipment.getStatus())
                .location(equipment.getLocation())
                .purchaseDate(equipment.getPurchaseDate())
                .description(equipment.getDescription())
                .assignedToId(equipment.getAssignedTo() != null ? equipment.getAssignedTo().getId() : null)
                .assignedToUsername(equipment.getAssignedTo() != null ? equipment.getAssignedTo().getUsername() : null)
                .assignedToFullName(equipment.getAssignedTo() != null ? equipment.getAssignedTo().getFullName() : null)
                .createdAt(equipment.getCreatedAt())
                .updatedAt(equipment.getUpdatedAt())
                .build();
    }
}
