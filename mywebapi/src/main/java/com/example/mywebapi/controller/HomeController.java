package com.example.mywebapi.controller;


import com.example.mywebapi.aspect.RateLimited;
import com.example.mywebapi.service.ExchangeRateService;
import com.example.mywebapi.service.UserInfoService;
import dto.ExchangeRateDTO;
import models.CryptoAndMetalsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/home")
public class HomeController {
    private final ExchangeRateService exchangeRateService;
    @Autowired
    private UserInfoService userInfoService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public HomeController(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    @GetMapping("/welcome")
    @RateLimited
    public ResponseEntity<String> welcome() {

        String message = "This is home page";
        return ResponseEntity.ok().body("{\"message\": \"" + message + "\"}");
    }
    @GetMapping("/exchange-rates")
    @RateLimited
    public ExchangeRateDTO getExchangeRates(@RequestParam String currency) {
        return exchangeRateService.getExchangeRates(currency);
    }
    @GetMapping("/crypto-metals-rate")
    @RateLimited
    public CryptoAndMetalsResponse getCryptoMetals(@RequestParam String currency) {
        return switch (currency) {
            case "XAU" -> exchangeRateService.getGoldRate(currency);
            case "XAG" -> exchangeRateService.getSilverRate(currency);
            case "BTC" -> exchangeRateService.getBitcoinRate(currency);
            default -> null;
        };

    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(ex.getReason(), ex.getStatusCode());
    }

}
