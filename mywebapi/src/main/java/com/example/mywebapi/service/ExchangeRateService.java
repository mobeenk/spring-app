package com.example.mywebapi.service;

import dto.ExchangeRateDTO;
import models.CryptoAndMetalsResponse;
import models.ExchangeRateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExchangeRateService {

    private final RestTemplate restTemplate;

    @Value("${exchange.api.base.url}")
    private String exchangeApiUrl;
    @Value("${metals.api.url}")
    private String cryptoMetalUrl;
    public ExchangeRateService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Cacheable(value = "exchangeRate", key = "#root.method.name", sync = true)
    public ExchangeRateDTO getExchangeRates(String currency) {
        String url = exchangeApiUrl + currency;
        ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
        if (response != null) {
            Map<String, Double> rates = response.getRates();
            // Adjust the SYP rate
            Double sypRate = rates.get("SYP");
            if (sypRate != null) {
                sypRate = sypRate + (sypRate * 0.127);
                rates.put("SYP", sypRate);
            }
            // Filter and format the needed currencies
            Map<String, Double> filteredRates = new HashMap<>();
            filteredRates.put("USD", formatRate(rates.get("USD")));
            filteredRates.put("AED", formatRate(rates.get("AED")));
            filteredRates.put("SAR", formatRate(rates.get("SAR")));
            filteredRates.put("SYP", formatRate(rates.get("SYP")));
            filteredRates.put("GBP", formatRate(rates.get("GBP")));
            filteredRates.put("AUD", formatRate(rates.get("AUD")));
            filteredRates.put("CAD", formatRate(rates.get("CAD")));
            filteredRates.put("TRY", formatRate(rates.get("TRY")));
            filteredRates.put("EGP", formatRate(rates.get("EGP")));
            return new ExchangeRateDTO(response.getDate(), response.getBase(), filteredRates);
        }
        return null;
    }
    @Cacheable(value = "gold-rate", sync = true)
    public CryptoAndMetalsResponse getGoldRate(String currency) {
        String url = cryptoMetalUrl + currency;
        CryptoAndMetalsResponse response = restTemplate.getForObject(url, CryptoAndMetalsResponse.class);
        if (response != null) {
            return response;
        }
        return null;
    }
    @Cacheable(value = "silver-rate", sync = true)
    public CryptoAndMetalsResponse getSilverRate(String currency) {
        String url = cryptoMetalUrl + currency;
        CryptoAndMetalsResponse response = restTemplate.getForObject(url, CryptoAndMetalsResponse.class);
        if (response != null) {
            return response;
        }
        return null;
    }
    @Cacheable(value = "bitcoin-rate", sync = true)
    public CryptoAndMetalsResponse getBitcoinRate(String currency) {
        String url = cryptoMetalUrl + currency;
        CryptoAndMetalsResponse response = restTemplate.getForObject(url, CryptoAndMetalsResponse.class);
        if (response != null) {
            return response;
        }
        return null;
    }
    private Double formatRate(Double rate) {
        if (rate == null) return null;
        return BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
    private Double adjustSypRate(Double apiRate, Double desiredRate) {
        if (apiRate == null || desiredRate == null) return null;
        return apiRate * (1 + (desiredRate - apiRate) / apiRate);
    }

}

