package com.mehdiluxury.controller;

import com.mehdiluxury.model.Reservation;
import com.mehdiluxury.model.SiteSettings;
import com.mehdiluxury.model.Vehicle;
import com.mehdiluxury.repo.ReservationRepository;
import com.mehdiluxury.repo.SiteSettingsRepository;
import com.mehdiluxury.repo.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Toutes les routes du tableau de bord. Protegees par AdminAuthFilter. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final VehicleRepository vehicles;
    private final SiteSettingsRepository settings;
    private final ReservationRepository reservations;

    public AdminController(VehicleRepository vehicles,
                           SiteSettingsRepository settings,
                           ReservationRepository reservations) {
        this.vehicles = vehicles;
        this.settings = settings;
        this.reservations = reservations;
    }

    // ---------------- Vehicules ----------------

    @GetMapping("/vehicles")
    public List<Vehicle> allVehicles() {
        return vehicles.findAllByOrderByPositionAscIdDesc();
    }

    @PostMapping("/vehicles")
    public Vehicle create(@RequestBody Vehicle vehicle) {
        vehicle.setId(null);
        return vehicles.save(vehicle);
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle body) {
        return vehicles.findById(id).map(existing -> {
            body.setId(id);
            body.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(vehicles.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Bascule rapide de la disponibilite depuis la liste. */
    @PatchMapping("/vehicles/{id}/availability")
    public ResponseEntity<Vehicle> toggleAvailability(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return vehicles.findById(id).map(vehicle -> {
            vehicle.setAvailable(Boolean.TRUE.equals(body.get("available")));
            return ResponseEntity.ok(vehicles.save(vehicle));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!vehicles.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehicles.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Vehicule supprime"));
    }

    // ---------------- Parametres du site ----------------

    @GetMapping("/settings")
    public SiteSettings settings() {
        return settings.findById(1L).orElseGet(() -> settings.save(new SiteSettings()));
    }

    @PutMapping("/settings")
    public SiteSettings updateSettings(@RequestBody SiteSettings body) {
        body.setId(1L);
        return settings.save(body);
    }

    // ---------------- Reservations ----------------

    @GetMapping("/reservations")
    public List<Reservation> reservations() {
        return reservations.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/reservations/{id}")
    public ResponseEntity<Reservation> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return reservations.findById(id).map(reservation -> {
            try {
                reservation.setStatus(Reservation.Status.valueOf(body.get("status")));
            } catch (IllegalArgumentException | NullPointerException e) {
                return ResponseEntity.badRequest().<Reservation>build();
            }
            return ResponseEntity.ok(reservations.save(reservation));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id) {
        if (!reservations.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reservations.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Reservation supprimee"));
    }

    // ---------------- Statistiques ----------------

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        List<Vehicle> all = vehicles.findAll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", all.size());
        stats.put("cars", all.stream().filter(v -> v.getType() == com.mehdiluxury.model.VehicleType.CAR).count());
        stats.put("motos", all.stream().filter(v -> v.getType() == com.mehdiluxury.model.VehicleType.MOTO).count());
        stats.put("available", all.stream().filter(Vehicle::isAvailable).count());
        stats.put("totalReservations", reservations.count());
        stats.put("newReservations", reservations.countByStatus(Reservation.Status.NEW));
        return stats;
    }
}
