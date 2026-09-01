package com.mehdiluxury.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Demande de reservation envoyee depuis le site.
 * Le client est ensuite redirige vers WhatsApp, mais la demande reste
 * visible dans le tableau de bord de l'admin.
 */
@Entity
@Table(name = "reservations")
public class Reservation {

    public enum Status { NEW, CONFIRMED, DONE, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String customerPhone;
    private String customerEmail;

    private Long vehicleId;
    private String vehicleName;

    private LocalDate startDate;
    private LocalDate endDate;

    private String pickupPlace;

    @Column(length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    private Instant createdAt = Instant.now();

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getPickupPlace() { return pickupPlace; }
    public void setPickupPlace(String pickupPlace) { this.pickupPlace = pickupPlace; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
