package com.example.mywebapi.service;

import com.example.mywebapi.entity.UserInfo;
import com.example.mywebapi.repository.UserInfoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserInfoService implements UserDetailsService {

    @Autowired
    private UserInfoRepository _userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserInfo> userDetail = _userRepository.findByName(username);

        // Converting userDetail to UserDetails
        return userDetail.map(UserInfoDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }


    public boolean userExists(String username) {
        return _userRepository.findByName(username).isPresent();
    }
    public String addUser(UserInfo userInfo) {
        userInfo.setPassword(encoder.encode(userInfo.getPassword()));
        _userRepository.save(userInfo);
        return "User Added Successfully";
    }
    @Transactional
    public void deleteUserByName(String username) {
        if (username.equalsIgnoreCase("admin")) {
            throw new IllegalArgumentException("Cannot delete user with username 'admin'");
        }
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        if (userOpt.isPresent()) {
            _userRepository.deleteByName(username);
        } else {
            throw new EntityNotFoundException("User not found with username: " + username);
        }
    }

    public void lockUser(String username) {
        if (username.equalsIgnoreCase("admin")) {
            throw new IllegalArgumentException("Cannot lock admin user");
        }
        
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        userOpt.ifPresent(user -> {
            if ("ROLE_ADMIN".equals(user.getRoles())) {
                throw new IllegalArgumentException("Cannot lock users with admin role");
            }
            user.setLocked(true);
            _userRepository.save(user);
        });
    }

    public void unlockUser(String username) {
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        userOpt.ifPresent(user -> {
            user.setLocked(false);
            _userRepository.save(user);
        });
    }

    public boolean updatePassword(String username, String oldPassword, String newPassword) {
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        
        UserInfo user = userOpt.get();
        
        // Verify old password
        if (!encoder.matches(oldPassword, user.getPassword())) {
            return false;
        }
        
        // Update to new password
        user.setPassword(encoder.encode(newPassword));
        _userRepository.save(user);
        return true;
    }

    public java.util.List<UserInfo> getAllUsers() {
        return _userRepository.findAll();
    }

    public UserInfo updateUserInfo(String username, String newEmail, String newRoles) {
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        
        UserInfo user = userOpt.get();
        
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            user.setEmail(newEmail);
        }
        
        if (newRoles != null && !newRoles.trim().isEmpty()) {
            user.setRoles(newRoles);
        }
        
        return _userRepository.save(user);
    }

    public Optional<UserInfo> findByEmail(String email) {
        return _userRepository.findByEmail(email);
    }

    public void resetPassword(String email, String newPassword) {
        Optional<UserInfo> userOpt = _userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        
        UserInfo user = userOpt.get();
        user.setPassword(encoder.encode(newPassword));
        _userRepository.save(user);
    }
}
