package com.example.mywebapi.aspect;

import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;

@Component
public class RateLimiter {
    private final Map<String, RateLimitedSemaphore> semaphores = new ConcurrentHashMap<>();

    public boolean tryAcquire(String key, int requests, int seconds) {
        // Get the current timestamp
        long currentTime = System.currentTimeMillis();

        // Calculate the start time of the time window (in milliseconds)
        long startTime = currentTime - seconds * 1000;

        // Remove expired entries from the semaphore map
        cleanupExpiredEntries(startTime);

        // Get or create the semaphore for the given key
        RateLimitedSemaphore semaphore = semaphores.computeIfAbsent(key, k -> {
            RateLimitedSemaphore newSemaphore = new RateLimitedSemaphore(requests);
            newSemaphore.setLastAcquireTime(currentTime); // Set last acquire time
            return newSemaphore;
        });

        // Check if the semaphore allows acquiring a permit
        boolean acquired = semaphore.tryAcquire();
        if (acquired) {
            semaphore.setLastAcquireTime(currentTime); // Update last acquire time
        }
        return acquired;
    }

    private void cleanupExpiredEntries(long startTime) {
        Iterator<Map.Entry<String, RateLimitedSemaphore>> iterator = semaphores.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, RateLimitedSemaphore> entry = iterator.next();
            String key = entry.getKey();
            RateLimitedSemaphore semaphore = entry.getValue();
            if (semaphore.getLastAcquireTime() < startTime) {
                iterator.remove();
            }
        }
    }

    private class RateLimitedSemaphore extends Semaphore {
        private volatile long lastAcquireTime;

        public RateLimitedSemaphore(int permits) {
            super(permits);
        }

        public long getLastAcquireTime() {
            return lastAcquireTime;
        }

        public void setLastAcquireTime(long lastAcquireTime) {
            this.lastAcquireTime = lastAcquireTime;
        }
    }
}
