package com.pgsi.dto;

import com.pgsi.entity.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateEquipmentRequest {

    @NotBlank(message = "Le nom de l'equipement est obligatoire")
    private String name;

    @NotBlank(message = "Le numero de serie est obligatoire")
    private String serialNumber;

    @NotBlank(message = "La categorie est obligatoire")
    private String category;

    @NotNull(message = "Le statut est obligatoire")
    private EquipmentStatus status;

    private String location;
    private LocalDate purchaseDate;
    private String description;
    private Long assignedToId;

    public CreateEquipmentRequest() {}

    public CreateEquipmentRequest(String name, String serialNumber, String category, EquipmentStatus status, String location, LocalDate purchaseDate, String description, Long assignedToId) {
        this.name = name;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
        this.location = location;
        this.purchaseDate = purchaseDate;
        this.description = description;
        this.assignedToId = assignedToId;
    }

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
}
