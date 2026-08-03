package com.pgsi.dto;

import com.pgsi.entity.TicketCategory;
import com.pgsi.entity.TicketPriority;
import com.pgsi.entity.TicketStatus;

import java.time.LocalDateTime;

public class TicketDto {
    private Long id;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;

    private Long createdById;
    private String createdByUsername;
    private String createdByFullName;

    private Long assignedToId;
    private String assignedToUsername;
    private String assignedToFullName;

    private Long equipmentId;
    private String equipmentName;

    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TicketDto() {}

    public TicketDto(Long id, String title, String description, TicketCategory category, TicketPriority priority, TicketStatus status, Long createdById, String createdByUsername, String createdByFullName, Long assignedToId, String assignedToUsername, String assignedToFullName, Long equipmentId, String equipmentName, String resolutionNotes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.createdById = createdById;
        this.createdByUsername = createdByUsername;
        this.createdByFullName = createdByFullName;
        this.assignedToId = assignedToId;
        this.assignedToUsername = assignedToUsername;
        this.assignedToFullName = assignedToFullName;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.resolutionNotes = resolutionNotes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByUsername() { return createdByUsername; }
    public void setCreatedByUsername(String createdByUsername) { this.createdByUsername = createdByUsername; }

    public String getCreatedByFullName() { return createdByFullName; }
    public void setCreatedByFullName(String createdByFullName) { this.createdByFullName = createdByFullName; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToUsername() { return assignedToUsername; }
    public void setAssignedToUsername(String assignedToUsername) { this.assignedToUsername = assignedToUsername; }

    public String getAssignedToFullName() { return assignedToFullName; }
    public void setAssignedToFullName(String assignedToFullName) { this.assignedToFullName = assignedToFullName; }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private TicketCategory category;
        private TicketPriority priority;
        private TicketStatus status;
        private Long createdById;
        private String createdByUsername;
        private String createdByFullName;
        private Long assignedToId;
        private String assignedToUsername;
        private String assignedToFullName;
        private Long equipmentId;
        private String equipmentName;
        private String resolutionNotes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(TicketCategory category) { this.category = category; return this; }
        public Builder priority(TicketPriority priority) { this.priority = priority; return this; }
        public Builder status(TicketStatus status) { this.status = status; return this; }
        public Builder createdById(Long createdById) { this.createdById = createdById; return this; }
        public Builder createdByUsername(String createdByUsername) { this.createdByUsername = createdByUsername; return this; }
        public Builder createdByFullName(String createdByFullName) { this.createdByFullName = createdByFullName; return this; }
        public Builder assignedToId(Long assignedToId) { this.assignedToId = assignedToId; return this; }
        public Builder assignedToUsername(String assignedToUsername) { this.assignedToUsername = assignedToUsername; return this; }
        public Builder assignedToFullName(String assignedToFullName) { this.assignedToFullName = assignedToFullName; return this; }
        public Builder equipmentId(Long equipmentId) { this.equipmentId = equipmentId; return this; }
        public Builder equipmentName(String equipmentName) { this.equipmentName = equipmentName; return this; }
        public Builder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public TicketDto build() {
            return new TicketDto(id, title, description, category, priority, status, createdById, createdByUsername, createdByFullName, assignedToId, assignedToUsername, assignedToFullName, equipmentId, equipmentName, resolutionNotes, createdAt, updatedAt);
        }
    }
}
