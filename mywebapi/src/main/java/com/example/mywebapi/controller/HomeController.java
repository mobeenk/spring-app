package com.example.mywebapi.controller;


import com.example.mywebapi.service.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/home")
public class HomeController {

    @Autowired
    private UserInfoService userInfoService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public HomeController() {

    }

    @GetMapping("/welcome")
    public ResponseEntity<String> welcome() {

        String message = "This is home page";
        return ResponseEntity.ok().body("{\"message\": \"" + message + "\"}");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(ex.getReason(), ex.getStatusCode());
    }

}
