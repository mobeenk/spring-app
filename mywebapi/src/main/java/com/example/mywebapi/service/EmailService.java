package com.example.mywebapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetCode(String toEmail, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("moubien.kayali@gmail.com"); // Must be verified in Brevo
            message.setTo(toEmail);
            message.setSubject("Password Reset Code");
            message.setText("Your password reset code is: " + resetCode + 
                           "\n\nThis code will expire in 15 minutes." +
                           "\n\nIf you didn't request this, please ignore this email.");
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void sendContactMessage(String name, String email, String userMessage) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("moubien.kayali@gmail.com"); // Your email to receive contact messages
        message.setSubject("Contact Form Submission from " + name);
        message.setText("Name: " + name + 
                       "\nEmail: " + email + 
                       "\n\nMessage:\n" + userMessage);
        message.setReplyTo(email);
        mailSender.send(message);
    }

    public void sendContactMessageWithDetails(String name, String email, String userMessage, 
                                             String ipAddress, String userAgent) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("moubien.kayali@gmail.com");
            message.setTo("moubien.kayali@outlook.com");
            message.setSubject("Contact Form Submission from " + name);
            
            StringBuilder emailBody = new StringBuilder();
            emailBody.append("=== CONTACT INFORMATION ===\n");
            emailBody.append("Name: ").append(name).append("\n");
            emailBody.append("Email: ").append(email).append("\n\n");
            
            emailBody.append("=== TECHNICAL DETAILS ===\n");
            emailBody.append("IP Address: ").append(ipAddress != null ? ipAddress : "Unknown").append("\n");
            emailBody.append("User Agent: ").append(userAgent != null ? userAgent : "Unknown").append("\n");
            emailBody.append("Timestamp: ").append(java.time.LocalDateTime.now()).append("\n\n");
            
            emailBody.append("=== MESSAGE ===\n");
            emailBody.append(userMessage);
            
            message.setText(emailBody.toString());
            message.setReplyTo(email);
            mailSender.send(message);
            System.out.println("Contact form email sent successfully from: " + name + " (" + email + ")");
        } catch (Exception e) {
            System.err.println("Failed to send contact form email: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
