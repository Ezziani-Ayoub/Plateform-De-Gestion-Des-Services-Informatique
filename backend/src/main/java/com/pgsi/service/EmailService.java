package com.pgsi.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send an HTML email asynchronously so it never blocks the main thread.
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            // We swallow the exception so a mail failure never breaks a business transaction
        }
    }

    /**
     * Convenience method: ticket event notification email.
     */
    @Async
    public void sendTicketNotification(String to, String recipientFullName,
                                       String eventTitle, String eventMessage,
                                       Long ticketId, String ticketTitle) {
        String subject = "[PGSI] " + eventTitle;
        String htmlBody = buildTicketEmailBody(recipientFullName, eventTitle, eventMessage, ticketId, ticketTitle);
        sendHtmlEmail(to, subject, htmlBody);
    }

    // ── Template ────────────────────────────────────────────────────────────

    private String buildTicketEmailBody(String recipientName, String title,
                                        String message, Long ticketId, String ticketTitle) {
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f7fb; margin:0; padding:0; }
                    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px;
                               box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden; }
                    .header { background: linear-gradient(135deg,#0ea5e9,#6366f1);
                              padding:30px 40px; color:#fff; }
                    .header h1 { margin:0; font-size:22px; font-weight:700; }
                    .header p  { margin:4px 0 0; font-size:13px; opacity:.85; }
                    .body { padding:32px 40px; color:#374151; }
                    .body p  { line-height:1.7; font-size:15px; }
                    .ticket-card { background:#f0f9ff; border-left:4px solid #0ea5e9;
                                   border-radius:6px; padding:14px 18px; margin:20px 0; }
                    .ticket-card .label { font-size:11px; text-transform:uppercase;
                                          letter-spacing:.06em; color:#0ea5e9; font-weight:600; }
                    .ticket-card .value { font-size:15px; font-weight:600; color:#1e3a5f; margin-top:2px; }
                    .btn { display:inline-block; margin-top:24px; padding:12px 28px;
                           background:linear-gradient(135deg,#0ea5e9,#6366f1);
                           color:#fff; text-decoration:none; border-radius:8px;
                           font-weight:600; font-size:14px; }
                    .footer { background:#f9fafb; padding:20px 40px;
                              text-align:center; font-size:12px; color:#9ca3af; }
                  </style>
                </head>
                <body>
                  <div class="wrapper">
                    <div class="header">
                      <h1>PGSI — Gestion des Services Informatiques</h1>
                      <p>SOS Villages d'Enfants Maroc</p>
                    </div>
                    <div class="body">
                      <p>Bonjour <strong>%s</strong>,</p>
                      <p>%s</p>
                      <div class="ticket-card">
                        <div class="label">Ticket concerné</div>
                        <div class="value">#%d — %s</div>
                      </div>
                      <p>Connectez-vous à la plateforme pour plus de détails.</p>
                    </div>
                    <div class="footer">
                      © 2025 SOS Villages d'Enfants Maroc · Plateforme PGSI<br>
                      Ce message est généré automatiquement, merci de ne pas y répondre.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(recipientName, message, ticketId, ticketTitle);
    }
}
