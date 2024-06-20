package models;

import java.util.Date;



public class CryptoAndMetalsResponse {

    private String symbol;
    private String name;
    private Double price;
    private Date updatedAt;
    private String updatedAtReadable;

    // Getters and setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getUpdatedAtReadable() {
        return updatedAtReadable;
    }

    public void setUpdatedAtReadable(String updatedAtReadable) {
        this.updatedAtReadable = updatedAtReadable;
    }
}

