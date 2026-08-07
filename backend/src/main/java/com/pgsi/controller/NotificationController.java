package com.pgsi.controller;

import com.pgsi.dto.MessageResponse;
import com.pgsi.dto.NotificationDto;
import com.pgsi.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/v1/notifications/recent?limit=20
     * Returns the most recent notifications for the current user.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<NotificationDto>> getRecent(
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.getRecentNotifications(authentication.getName(), limit)
        );
    }

    /**
     * GET /api/v1/notifications/unread
     * Returns only unread notifications.
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnread(Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(authentication.getName())
        );
    }

    /**
     * GET /api/v1/notifications/count
     * Returns the unread count — polled every N seconds by the frontend bell.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.countUnread(authentication.getName())
        );
    }

    /**
     * PATCH /api/v1/notifications/{id}/read
     * Mark a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(new MessageResponse("Notification marquée comme lue."));
    }

    /**
     * PATCH /api/v1/notifications/read-all
     * Mark all notifications as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(new MessageResponse("Toutes les notifications ont été marquées comme lues."));
    }
}
