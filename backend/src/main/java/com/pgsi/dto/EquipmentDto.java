package com.pgsi.dto;

import com.pgsi.entity.EquipmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EquipmentDto {

    private Long id;
    private String name;
    private String serialNumber;
    private String category;
    private EquipmentStatus status;
    private String location;
    private LocalDate purchaseDate;
    private String description;
    private Long assignedToId;
    private String assignedToUsername;
    private String assignedToFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EquipmentDto() {}

    public EquipmentDto(Long id, String name, String serialNumber, String category, EquipmentStatus status, String location, LocalDate purchaseDate, String description, Long assignedToId, String assignedToUsername, String assignedToFullName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
        this.location = location;
        this.purchaseDate = purchaseDate;
        this.description = description;
        this.assignedToId = assignedToId;
        this.assignedToUsername = assignedToUsername;
        this.assignedToFullName = assignedToFullName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public EquipmentStatus getStatus() { return status; }
    public void setStatus(EquipmentStatus status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToUsername() { return assignedToUsername; }
    public void setAssignedToUsername(String assignedToUsername) { this.assignedToUsername = assignedToUsername; }

    public String getAssignedToFullName() { return assignedToFullName; }
    public void setAssignedToFullName(String assignedToFullName) { this.assignedToFullName = assignedToFullName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String serialNumber;
        private String category;
        private EquipmentStatus status;
        private String location;
        private LocalDate purchaseDate;
        private String description;
        private Long assignedToId;
        private String assignedToUsername;
        private String assignedToFullName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder serialNumber(String serialNumber) { this.serialNumber = serialNumber; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder status(EquipmentStatus status) { this.status = status; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder purchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder assignedToId(Long assignedToId) { this.assignedToId = assignedToId; return this; }
        public Builder assignedToUsername(String assignedToUsername) { this.assignedToUsername = assignedToUsername; return this; }
        public Builder assignedToFullName(String assignedToFullName) { this.assignedToFullName = assignedToFullName; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public EquipmentDto build() {
            return new EquipmentDto(id, name, serialNumber, category, status, location, purchaseDate, description, assignedToId, assignedToUsername, assignedToFullName, createdAt, updatedAt);
        }
    }
}
