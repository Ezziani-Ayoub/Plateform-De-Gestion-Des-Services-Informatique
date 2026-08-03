package com.pgsi.dto;

import com.pgsi.entity.EquipmentStatus;

import java.time.LocalDate;

public class UpdateEquipmentRequest {

    private String name;
    private String category;
    private EquipmentStatus status;
    private String location;
    private LocalDate purchaseDate;
    private String description;
    private Long assignedToId;

    public UpdateEquipmentRequest() {}

    public UpdateEquipmentRequest(String name, String category, EquipmentStatus status, String location, LocalDate purchaseDate, String description, Long assignedToId) {
        this.name = name;
        this.category = category;
        this.status = status;
        this.location = location;
        this.purchaseDate = purchaseDate;
        this.description = description;
        this.assignedToId = assignedToId;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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
}
