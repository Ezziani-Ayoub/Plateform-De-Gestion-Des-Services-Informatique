package com.pgsi.service;

import com.pgsi.dto.NotificationDto;
import com.pgsi.entity.Notification;
import com.pgsi.entity.User;
import com.pgsi.exception.ResourceNotFoundException;
import com.pgsi.repository.NotificationRepository;
import com.pgsi.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void createNotification(Long recipientId, String type, String title, String message, Long relatedTicketId) {
        User recipient = userRepository.findById(recipientId)
                .orElse(null);
        if (recipient == null) return; // silently skip if recipient not found

        Notification notification = new Notification(recipient, title, message, type, relatedTicketId);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotifications(String username) {
        User user = getUser(username);
        return notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getRecentNotifications(String username, int limit) {
        User user = getUser(username);
        Pageable pageable = PageRequest.of(0, limit);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable)
                .getContent()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(String username) {
        User user = getUser(username);
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String username) {
        User user = getUser(username);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new com.pgsi.exception.BadRequestException("Vous n'etes pas autorise a modifier cette notification.");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        User user = getUser(username);
        notificationRepository.markAllAsReadForUser(user);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getRelatedTicketId(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
