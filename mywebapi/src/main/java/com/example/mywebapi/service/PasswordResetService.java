package com.example.mywebapi.service;

import com.example.mywebapi.entity.PasswordResetToken;
import com.example.mywebapi.repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private UserInfoService userInfoService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public String generateResetCode(String email) {
        // Verify email exists
        if (userInfoService.findByEmail(email).isEmpty()) {
            throw new IllegalArgumentException("No user found with this email");
        }

        // Generate 6-digit code
        String resetCode = String.format("%06d", new Random().nextInt(999999));
        
        // Delete any existing tokens for this email
        resetTokenRepository.deleteByEmail(email);
        
        // Create new token (expires in 15 minutes)
        PasswordResetToken token = new PasswordResetToken(
            email,
            resetCode,
            LocalDateTime.now().plusMinutes(15)
        );
        
        resetTokenRepository.save(token);
        
        // Send email with reset code
        emailService.sendResetCode(email, resetCode);
        
        return resetCode;
    }

    public boolean validateResetCode(String email, String resetCode) {
        Optional<PasswordResetToken> tokenOpt = resetTokenRepository.findByEmailAndResetCode(email, resetCode);
        
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken token = tokenOpt.get();
        
        if (token.isUsed() || token.isExpired()) {
            return false;
        }
        
        return true;
    }

    @Transactional
    public void resetPassword(String email, String resetCode, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = resetTokenRepository.findByEmailAndResetCode(email, resetCode);
        
        if (tokenOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid reset code");
        }
        
        PasswordResetToken token = tokenOpt.get();
        
        if (token.isUsed()) {
            throw new IllegalArgumentException("Reset code already used");
        }
        
        if (token.isExpired()) {
            throw new IllegalArgumentException("Reset code expired");
        }
        
        // Reset the password
        userInfoService.resetPassword(email, newPassword);
        
        // Mark token as used
        token.setUsed(true);
        resetTokenRepository.save(token);
    }
}
