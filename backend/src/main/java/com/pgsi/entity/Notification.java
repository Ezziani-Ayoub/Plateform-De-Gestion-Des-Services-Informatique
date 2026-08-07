package com.pgsi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String type; // e.g. TICKET_CREATED, TICKET_STATUS_CHANGED, TICKET_COMMENT_ADDED

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "related_ticket_id")
    private Long relatedTicketId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(User recipient, String title, String message, String type, Long relatedTicketId) {
        this.recipient = recipient;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedTicketId = relatedTicketId;
        this.read = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public Long getRelatedTicketId() { return relatedTicketId; }
    public void setRelatedTicketId(Long relatedTicketId) { this.relatedTicketId = relatedTicketId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
