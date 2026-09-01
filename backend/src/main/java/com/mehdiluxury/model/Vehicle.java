package com.mehdiluxury.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;

    @Enumerated(EnumType.STRING)
    private VehicleType type = VehicleType.CAR;

    /** Categorie libre : Berline, SUV, Sport, Scooter, Roadster... */
    private String category;

    private Double pricePerDay = 0d;
    private Double pricePerWeek;
    private Double pricePerMonth;

    /** Caution demandee au client. */
    private Double deposit;

    @Column(length = 1000)
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "vehicle_images", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "url", length = 1000)
    private List<String> images = new ArrayList<>();

    @Column(name = "model_year")
    private Integer year;

    /** Manuelle / Automatique (voitures). */
    private String transmission;

    /** Diesel / Essence / Hybride / Electrique. */
    private String fuel;

    private Integer seats;
    private Integer doors;

    /** Cylindree pour les motos (ex : 300 cc) ou motorisation. */
    private String engine;

    @Column(length = 2000)
    private String description;

    private boolean available = true;
    private boolean featured = false;
    private Integer position = 0;

    private Instant createdAt = Instant.now();

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public VehicleType getType() { return type; }
    public void setType(VehicleType type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(Double pricePerDay) { this.pricePerDay = pricePerDay; }

    public Double getPricePerWeek() { return pricePerWeek; }
    public void setPricePerWeek(Double pricePerWeek) { this.pricePerWeek = pricePerWeek; }

    public Double getPricePerMonth() { return pricePerMonth; }
    public void setPricePerMonth(Double pricePerMonth) { this.pricePerMonth = pricePerMonth; }

    public Double getDeposit() { return deposit; }
    public void setDeposit(Double deposit) { this.deposit = deposit; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images == null ? new ArrayList<>() : images; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public String getFuel() { return fuel; }
    public void setFuel(String fuel) { this.fuel = fuel; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public Integer getDoors() { return doors; }
    public void setDoors(Integer doors) { this.doors = doors; }

    public String getEngine() { return engine; }
    public void setEngine(String engine) { this.engine = engine; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
