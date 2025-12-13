package com.example.mywebapi.controller;

import com.example.mywebapi.entity.ContactRequest;
import com.example.mywebapi.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contact")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/submit")
    public ResponseEntity<String> submitContactForm(
            @RequestBody ContactRequest request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            // Validate input
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message is required");
            }

            // Get IP address
            String ipAddress = getClientIpAddress(forwardedFor, httpRequest);

            // Send email with additional info
            emailService.sendContactMessageWithDetails(
                request.getName(),
                request.getEmail(),
                request.getMessage(),
                ipAddress,
                userAgent
            );

            return ResponseEntity.ok("Thank you for your message. We'll get back to you soon!");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send message: " + e.getMessage());
        }
    }

    private String getClientIpAddress(String forwardedFor, jakarta.servlet.http.HttpServletRequest request) {
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, get the first one
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
