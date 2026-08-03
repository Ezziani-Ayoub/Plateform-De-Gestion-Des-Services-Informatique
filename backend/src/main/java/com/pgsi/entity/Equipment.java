package com.pgsi.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipments")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentStatus status;

    private String location;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Equipment() {}

    public Equipment(Long id, String name, String serialNumber, String category, EquipmentStatus status, String location, LocalDate purchaseDate, String description, User assignedTo, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.serialNumber = serialNumber;
        this.category = category;
        this.status = status;
        this.location = location;
        this.purchaseDate = purchaseDate;
        this.description = description;
        this.assignedTo = assignedTo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

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
        private User assignedTo;
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
        public Builder assignedTo(User assignedTo) { this.assignedTo = assignedTo; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Equipment build() {
            return new Equipment(id, name, serialNumber, category, status, location, purchaseDate, description, assignedTo, createdAt, updatedAt);
        }
    }
}
