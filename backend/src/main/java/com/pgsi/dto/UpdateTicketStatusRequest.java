package com.pgsi.dto;

import com.pgsi.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTicketStatusRequest {

    @NotNull(message = "Le statut est obligatoire")
    private TicketStatus status;

    private Long assignedToId;

    private String resolutionNotes;

    public UpdateTicketStatusRequest() {}

    public UpdateTicketStatusRequest(TicketStatus status, Long assignedToId, String resolutionNotes) {
        this.status = status;
        this.assignedToId = assignedToId;
        this.resolutionNotes = resolutionNotes;
    }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
