package dto;



import java.util.Map;

public class ExchangeRateDTO {
    private String date;
    private String base;
    private Map<String, Double> rates;

    // Constructors
    public ExchangeRateDTO() {}

    public ExchangeRateDTO(String date, String base, Map<String, Double> rates) {
        this.date = date;
        this.base = base;
        this.rates = rates;
    }

    // Getters and Setters
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

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
}
