package com.pgsi.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Ticket() {}

    public Ticket(Long id, String title, String description, TicketCategory category, TicketPriority priority,
                  TicketStatus status, User createdBy, User assignedTo, Equipment equipment,
                  String resolutionNotes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.createdBy = createdBy;
        this.assignedTo = assignedTo;
        this.equipment = equipment;
        this.resolutionNotes = resolutionNotes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
        if (this.priority == null) {
            this.priority = TicketPriority.MEDIUM;
        }
        if (this.category == null) {
            this.category = TicketCategory.HARDWARE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private TicketCategory category;
        private TicketPriority priority;
        private TicketStatus status;
        private User createdBy;
        private User assignedTo;
        private Equipment equipment;
        private String resolutionNotes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(TicketCategory category) { this.category = category; return this; }
        public Builder priority(TicketPriority priority) { this.priority = priority; return this; }
        public Builder status(TicketStatus status) { this.status = status; return this; }
        public Builder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public Builder assignedTo(User assignedTo) { this.assignedTo = assignedTo; return this; }
        public Builder equipment(Equipment equipment) { this.equipment = equipment; return this; }
        public Builder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Ticket build() {
            return new Ticket(id, title, description, category, priority, status, createdBy, assignedTo, equipment, resolutionNotes, createdAt, updatedAt);
        }
    }
}
