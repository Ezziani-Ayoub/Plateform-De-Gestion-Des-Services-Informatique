package com.pgsi.service;

import com.pgsi.dto.CreateEquipmentRequest;
import com.pgsi.dto.EquipmentDto;
import com.pgsi.dto.UpdateEquipmentRequest;
import com.pgsi.entity.Equipment;
import com.pgsi.entity.User;
import com.pgsi.exception.BadRequestException;
import com.pgsi.exception.ResourceNotFoundException;
import com.pgsi.repository.EquipmentRepository;
import com.pgsi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<EquipmentDto> getEquipments(String search, String category, String status, Pageable pageable) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String categoryParam = (category != null && !category.trim().isEmpty()) ? category.trim() : null;
        String statusParam = (status != null && !status.trim().isEmpty()) ? status.trim() : null;

        return equipmentRepository.filterEquipments(searchParam, categoryParam, statusParam, pageable)
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
            throw new BadRequestException("Equipment with serial number '" + request.getSerialNumber() + "' already exists");
        }

        User assignedUser = null;
        if (request.getAssignedToUserId() != null) {
            assignedUser = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToUserId()));
        }

        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .serialNumber(request.getSerialNumber())
                .category(request.getCategory().toUpperCase())
                .status(request.getStatus())
                .location(request.getLocation())
                .purchaseDate(request.getPurchaseDate())
                .description(request.getDescription())
                .assignedTo(assignedUser)
                .build();

        Equipment saved = equipmentRepository.save(equipment);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public EquipmentDto updateEquipment(Long id, UpdateEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));

        // If serial number changed, check uniqueness
        if (!equipment.getSerialNumber().equalsIgnoreCase(request.getSerialNumber()) &&
                equipmentRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new BadRequestException("Equipment with serial number '" + request.getSerialNumber() + "' already exists");
        }

        User assignedUser = null;
        if (request.getAssignedToUserId() != null) {
            assignedUser = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToUserId()));
        }

        equipment.setName(request.getName());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setCategory(request.getCategory().toUpperCase());
        equipment.setStatus(request.getStatus());
        equipment.setLocation(request.getLocation());
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setDescription(request.getDescription());
        equipment.setAssignedTo(assignedUser);

        Equipment updated = equipmentRepository.save(equipment);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        equipmentRepository.delete(equipment);
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
                .assignedToUserId(equipment.getAssignedTo() != null ? equipment.getAssignedTo().getId() : null)
                .assignedToUserName(equipment.getAssignedTo() != null ? equipment.getAssignedTo().getFullName() : null)
                .createdAt(equipment.getCreatedAt())
                .updatedAt(equipment.getUpdatedAt())
                .build();
    }
}
