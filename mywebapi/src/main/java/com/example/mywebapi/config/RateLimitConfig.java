package com.example.mywebapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;



@Configuration
public class RateLimitConfig {
    @Value("${rate.limit.requests}")
    private int requests;

    @Value("${rate.limit.seconds}")
    private int seconds;

    public int getRequests() {
        return requests;
    }

    public void setRequests(int requests) {
        this.requests = requests;
    }

    public int getSeconds() {
        return seconds;
    }

    public void setSeconds(int seconds) {
        this.seconds = seconds;
    }
// Getters and setters
}
