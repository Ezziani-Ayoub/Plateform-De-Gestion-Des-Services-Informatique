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
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public TicketServiceImpl(TicketRepository ticketRepository,
                             UserRepository userRepository,
                             EquipmentRepository equipmentRepository,
                             @Lazy NotificationService notificationService,
                             EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public TicketDto createTicket(CreateTicketRequest request, String currentUsername) {
        User creator = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        Equipment equipment = null;
        if (request.getEquipmentId() != null) {
            equipment = equipmentRepository.findById(request.getEquipmentId()).orElse(null);
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

        // ── In-app + email notifications ─────────────────────────────────
        // Notify all admins and technicians about the new ticket
        userRepository.findAll().stream()
                .filter(u -> hasRole(u, "ROLE_ADMIN") || hasRole(u, "ROLE_TECHNICIAN"))
                .forEach(tech -> {
                    notificationService.createNotification(
                            tech.getId(),
                            "TICKET_CREATED",
                            "Nouveau ticket ouvert",
                            String.format("L'employé %s a ouvert le ticket : « %s ».",
                                    creator.getFullName() != null ? creator.getFullName() : creator.getUsername(),
                                    savedTicket.getTitle()),
                            savedTicket.getId()
                    );
                    emailService.sendTicketNotification(
                            tech.getEmail(),
                            tech.getFullName() != null ? tech.getFullName() : tech.getUsername(),
                            "Nouveau ticket ouvert",
                            String.format("L'employé <strong>%s</strong> a ouvert un nouveau ticket : « %s ».",
                                    creator.getFullName() != null ? creator.getFullName() : creator.getUsername(),
                                    savedTicket.getTitle()),
                            savedTicket.getId(),
                            savedTicket.getTitle()
                    );
                });

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

        TicketStatus previousStatus = ticket.getStatus();

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
        }

        boolean newAssignment = false;
        if (request.getAssignedToId() != null) {
            if (ticket.getAssignedTo() == null ||
                    !ticket.getAssignedTo().getId().equals(request.getAssignedToId())) {
                newAssignment = true;
            }
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

        // ── Notify the ticket creator of status change ───────────────────
        User creator = updatedTicket.getCreatedBy();
        if (request.getStatus() != null && !request.getStatus().equals(previousStatus)) {
            String statusLabel = translateStatus(request.getStatus());
            String notifTitle  = "Statut de votre ticket mis à jour";
            String notifMsg    = String.format(
                    "Le statut de votre ticket « %s » est passé à : %s.",
                    updatedTicket.getTitle(), statusLabel);

            notificationService.createNotification(
                    creator.getId(), "TICKET_STATUS_CHANGED", notifTitle, notifMsg, updatedTicket.getId());
            emailService.sendTicketNotification(
                    creator.getEmail(),
                    creator.getFullName() != null ? creator.getFullName() : creator.getUsername(),
                    notifTitle, notifMsg, updatedTicket.getId(), updatedTicket.getTitle());
        }

        // ── Notify newly assigned technician ────────────────────────────
        if (newAssignment && updatedTicket.getAssignedTo() != null) {
            User tech = updatedTicket.getAssignedTo();
            String notifTitle = "Ticket assigné";
            String notifMsg   = String.format(
                    "Le ticket « %s » vous a été assigné.", updatedTicket.getTitle());

            notificationService.createNotification(
                    tech.getId(), "TICKET_ASSIGNED", notifTitle, notifMsg, updatedTicket.getId());
            emailService.sendTicketNotification(
                    tech.getEmail(),
                    tech.getFullName() != null ? tech.getFullName() : tech.getUsername(),
                    notifTitle, notifMsg, updatedTicket.getId(), updatedTicket.getTitle());
        }

        return mapToDto(updatedTicket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        ticketRepository.delete(ticket);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private boolean hasRole(User user, String roleName) {
        return user.getRoles() != null &&
                user.getRoles().stream().anyMatch(r -> r.getName() != null &&
                        r.getName().name().equals(roleName));
    }

    private String translateStatus(TicketStatus status) {
        return switch (status) {
            case OPEN        -> "Ouvert";
            case IN_PROGRESS -> "En cours";
            case RESOLVED    -> "Résolu";
            case CLOSED      -> "Fermé";
        };
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
