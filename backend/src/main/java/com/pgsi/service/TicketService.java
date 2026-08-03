package com.pgsi.service;

import com.pgsi.dto.CreateTicketRequest;
import com.pgsi.dto.TicketDto;
import com.pgsi.dto.UpdateTicketStatusRequest;

import java.util.List;

public interface TicketService {

    TicketDto createTicket(CreateTicketRequest request, String currentUsername);

    List<TicketDto> getAllTickets();

    List<TicketDto> getMyTickets(String username);

    TicketDto getTicketById(Long id);

    TicketDto updateTicketStatus(Long id, UpdateTicketStatusRequest request, String currentUsername);

    void deleteTicket(Long id);
}
