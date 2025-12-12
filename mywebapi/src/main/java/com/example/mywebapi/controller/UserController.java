package com.example.mywebapi.controller;


import com.example.mywebapi.entity.AuthRequest;
import com.example.mywebapi.entity.LockPayload;
import com.example.mywebapi.entity.UserInfo;
import com.example.mywebapi.service.JwtService;
import com.example.mywebapi.service.UserInfoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.mywebapi.aspect.RateLimited;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class UserController {
    private static final Set<String> ALLOWED_ROLES = Set.of("ROLE_USER", "ROLE_SUPERVISOR");

    @Autowired
    private UserInfoService userInfoService;

    @Autowired
    private final JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public UserController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome this endpoint is not secure";
    }
    @PostMapping("/admin/lockuser")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> lockuser(@RequestBody LockPayload username) {
        try {
            userInfoService.lockUser(username.getUsername());
            return ResponseEntity.ok("User locked successfully: " + username.getUsername());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
    }
    @PostMapping("/admin/unlockuser")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public String unlockuser(@RequestBody LockPayload username) {
        userInfoService.unlockUser(username.getUsername());
        return ("User unlocked successfully "+username.getUsername());
    }
    @PostMapping("/addNewUser")
    public ResponseEntity<String> addNewUser(@RequestBody UserInfo userInfo) {
        // Check if the username already exists
        if (userInfoService.userExists(userInfo.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if ("ROLE_ADMIN".equals(userInfo.getRoles())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Creation of admin role is not allowed");
        }
        if (!ALLOWED_ROLES.contains(userInfo.getRoles())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Role Doesn't Exists");
        }

        userInfoService.addUser(userInfo);
        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
    }

    @GetMapping("/user/userProfile")
//    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public String userProfile() {
        return "Welcome to User Profile";
    }

    @GetMapping("/admin/adminProfile")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public String adminProfile() {

        return "Welcome to Admin Profile";
    }

    @PostMapping("/generateToken")
    @RateLimited
    public String authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(authRequest.getUsername());
        } else {
            throw new UsernameNotFoundException("invalid user request !");
        }
    }

//    @GetMapping("/lockUser")
//    public ResponseEntity<String> lockUser() {
//        try {
//            userInfoService.lockUser("user");
//            return ResponseEntity.ok("User locked successfully");
//        } catch (EntityNotFoundException ex) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
//        }
//    }


    @DeleteMapping("/admin/{username}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteUserByName(@PathVariable String username) {
        if (userInfoService.userExists(username)) {
            try{
                userInfoService.deleteUserByName(username);
            }
            catch (Exception ex){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
            }

            return ResponseEntity.ok("User deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<java.util.List<UserInfo>> getAllUsers() {
        java.util.List<UserInfo> users = userInfoService.getAllUsers();
        // Remove passwords from response for security
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/admin/update-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateUser(@RequestBody com.example.mywebapi.entity.UserUpdateRequest request) {
        try {
            UserInfo updatedUser = userInfoService.updateUserInfo(
                request.getUsername(),
                request.getEmail(),
                request.getRoles()
            );
            updatedUser.setPassword(null); // Don't send password back
            return ResponseEntity.ok(updatedUser);
        } catch (UsernameNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("{\"error\": \"User not found\"}");
        }
    }

    @PutMapping("/user/change-password")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<String> changePassword(@RequestBody com.example.mywebapi.entity.PasswordChangeRequest request) {
        try {
            boolean success = userInfoService.updatePassword(
                request.getUsername(), 
                request.getOldPassword(), 
                request.getNewPassword()
            );
            
            if (success) {
                return ResponseEntity.ok("Password updated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Old password is incorrect");
            }
        } catch (UsernameNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found");
        }
    }

    @Autowired
    private com.example.mywebapi.service.PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody com.example.mywebapi.entity.PasswordResetRequest request) {
        try {
            passwordResetService.generateResetCode(request.getEmail());
            return ResponseEntity.ok("Password reset code has been sent to your email. Code is valid for 15 minutes.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No user found with this email");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.example.mywebapi.entity.PasswordResetConfirm request) {
        try {
            passwordResetService.resetPassword(
                request.getEmail(),
                request.getResetCode(),
                request.getNewPassword()
            );
            return ResponseEntity.ok("Password reset successfully");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
        }
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(ex.getReason(), ex.getStatusCode());
    }

}
