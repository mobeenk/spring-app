package com.example.mywebapi.helpers;


import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.github.benmanes.caffeine.cache.stats.CacheStats;

@Component
public class CacheStatsLogger {

    private final CacheManager cacheManager;

    public CacheStatsLogger(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Scheduled(fixedRate = 60000) // Log every minute
    public void logCacheStats() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            CaffeineCache caffeineCache = (CaffeineCache) cacheManager.getCache(cacheName);
            if (caffeineCache != null) {
                com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = caffeineCache.getNativeCache();
                CacheStats stats = nativeCache.stats();
                System.out.println("Cache: " + cacheName + " - " + stats);
            }
        });
    }
}
