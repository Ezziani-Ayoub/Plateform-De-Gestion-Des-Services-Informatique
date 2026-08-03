package com.pgsi.dto;

import com.pgsi.entity.TicketCategory;
import com.pgsi.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTicketRequest {

    @NotBlank(message = "Le titre du ticket est obligatoire")
    private String title;

    @NotBlank(message = "La description du problème est obligatoire")
    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    private TicketCategory category;

    private TicketPriority priority;

    private Long equipmentId;

    public CreateTicketRequest() {}

    public CreateTicketRequest(String title, String description, TicketCategory category, TicketPriority priority, Long equipmentId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.equipmentId = equipmentId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }
}
