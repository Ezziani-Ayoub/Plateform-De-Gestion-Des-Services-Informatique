package com.pgsi.controller;

import com.pgsi.dto.CreateTicketRequest;
import com.pgsi.dto.MessageResponse;
import com.pgsi.dto.TicketDto;
import com.pgsi.dto.UpdateTicketStatusRequest;
import com.pgsi.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketDto> createTicket(@Valid @RequestBody CreateTicketRequest request, Authentication authentication) {
        TicketDto ticket = ticketService.createTicket(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping
    public ResponseEntity<List<TicketDto>> getAllTickets(Authentication authentication) {
        boolean isEmployeeOnly = authentication.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TECHNICIAN"));

        if (isEmployeeOnly) {
            return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
        }
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketDto>> getMyTickets(Authentication authentication) {
        List<TicketDto> tickets = ticketService.getMyTickets(authentication.getName());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicketById(@PathVariable Long id) {
        TicketDto ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDto> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication) {
        TicketDto updated = ticketService.updateTicketStatus(id, request, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(new MessageResponse("Ticket supprime avec succes."));
    }
}
