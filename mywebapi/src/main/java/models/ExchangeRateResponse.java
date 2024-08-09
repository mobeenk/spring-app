package models;

import java.util.Map;

// Response class to map the API response
public class ExchangeRateResponse {
    private String base;
    private Map<String, Double> rates;
    private String date;


    // getters and setters
    public String getBase() {
        return base;
    }

    public void setBase(String base) {
        this.base = base;
    }

    public Map<String, Double> getRates() {
        return rates;
    }

    public void setRates(Map<String, Double> rates) {
        this.rates = rates;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
