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
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Code");
        message.setText("Your password reset code is: " + resetCode + 
                       "\n\nThis code will expire in 15 minutes." +
                       "\n\nIf you didn't request this, please ignore this email.");
        mailSender.send(message);
    }
}
