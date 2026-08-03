package com.pgsi.repository;

import com.pgsi.entity.Ticket;
import com.pgsi.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedBy_UsernameOrderByCreatedAtDesc(String username);

    List<Ticket> findByAssignedTo_UsernameOrderByCreatedAtDesc(String username);

    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<Ticket> findAllByOrderByCreatedAtDesc();
}
