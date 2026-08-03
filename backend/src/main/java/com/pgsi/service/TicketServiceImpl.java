package com.pgsi.service;

import com.pgsi.dto.CreateTicketRequest;
import com.pgsi.dto.TicketDto;
import com.pgsi.dto.UpdateTicketStatusRequest;
import com.pgsi.entity.Equipment;
import com.pgsi.entity.Ticket;
import com.pgsi.entity.TicketPriority;
import com.pgsi.entity.TicketStatus;
import com.pgsi.entity.User;
import com.pgsi.exception.ResourceNotFoundException;
import com.pgsi.repository.EquipmentRepository;
import com.pgsi.repository.TicketRepository;
import com.pgsi.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository, EquipmentRepository equipmentRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    @Transactional
    public TicketDto createTicket(CreateTicketRequest request, String currentUsername) {
        User creator = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        Equipment equipment = null;
        if (request.getEquipmentId() != null) {
            equipment = equipmentRepository.findById(request.getEquipmentId())
                    .orElse(null);
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .createdBy(creator)
                .equipment(equipment)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToDto(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDto> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDto> getMyTickets(String username) {
        return ticketRepository.findByCreatedBy_UsernameOrderByCreatedAtDesc(username).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDto getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        return mapToDto(ticket);
    }

    @Override
    @Transactional
    public TicketDto updateTicketStatus(Long id, UpdateTicketStatusRequest request, String currentUsername) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
        }

        if (request.getAssignedToId() != null) {
            User assignedTech = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
            ticket.setAssignedTo(assignedTech);
        } else if (ticket.getAssignedTo() == null) {
            userRepository.findByUsername(currentUsername).ifPresent(ticket::setAssignedTo);
        }

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToDto(updatedTicket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        ticketRepository.delete(ticket);
    }

    private TicketDto mapToDto(Ticket ticket) {
        return TicketDto.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdById(ticket.getCreatedBy().getId())
                .createdByUsername(ticket.getCreatedBy().getUsername())
                .createdByFullName(ticket.getCreatedBy().getFullName())
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToUsername(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getUsername() : null)
                .assignedToFullName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : null)
                .equipmentId(ticket.getEquipment() != null ? ticket.getEquipment().getId() : null)
                .equipmentName(ticket.getEquipment() != null ? ticket.getEquipment().getName() : null)
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
