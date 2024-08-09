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
    public String lockuser(@RequestBody LockPayload username) {
        userInfoService.lockUser(username.getUsername());
        return ("User locked successfully "+username.getUsername());
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

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(ex.getReason(), ex.getStatusCode());
    }

}
