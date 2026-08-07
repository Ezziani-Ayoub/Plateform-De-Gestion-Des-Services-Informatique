package com.pgsi.service;

import com.pgsi.dto.NotificationDto;

import java.util.List;

public interface NotificationService {

    /**
     * Create and persist an in-app notification for a single recipient.
     */
    void createNotification(Long recipientId, String type, String title, String message, Long relatedTicketId);

    /**
     * Return all unread notifications for the current authenticated user.
     */
    List<NotificationDto> getUnreadNotifications(String username);

    /**
     * Return the last N notifications (read + unread) for the current user.
     */
    List<NotificationDto> getRecentNotifications(String username, int limit);

    /**
     * Count unread notifications for the current user.
     */
    long countUnread(String username);

    /**
     * Mark a single notification as read.
     */
    void markAsRead(Long notificationId, String username);

    /**
     * Mark all notifications as read for the current user.
     */
    void markAllAsRead(String username);
}
