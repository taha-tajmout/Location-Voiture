package com.mehdiluxury.controller;

import com.mehdiluxury.model.Reservation;
import com.mehdiluxury.model.SiteSettings;
import com.mehdiluxury.model.Vehicle;
import com.mehdiluxury.model.VehicleType;
import com.mehdiluxury.repo.ReservationRepository;
import com.mehdiluxury.repo.SiteSettingsRepository;
import com.mehdiluxury.repo.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Endpoints ouverts au public (site visiteur). */
@RestController
@RequestMapping("/api")
public class PublicController {

    private final VehicleRepository vehicles;
    private final SiteSettingsRepository settings;
    private final ReservationRepository reservations;

    public PublicController(VehicleRepository vehicles,
                            SiteSettingsRepository settings,
                            ReservationRepository reservations) {
        this.vehicles = vehicles;
        this.settings = settings;
        this.reservations = reservations;
    }

    /**
     * Liste des vehicules visibles par les clients.
     * type = CAR ou MOTO (optionnel), all = true pour inclure les indisponibles.
     */
    @GetMapping("/vehicles")
    public List<Vehicle> list(@RequestParam(required = false) String type,
                              @RequestParam(defaultValue = "true") boolean includeUnavailable) {
        VehicleType parsed = parseType(type);

        if (parsed == null) {
            return includeUnavailable
                    ? vehicles.findAllByOrderByPositionAscIdDesc()
                    : vehicles.findByAvailableTrueOrderByPositionAscIdDesc();
        }
        return includeUnavailable
                ? vehicles.findByTypeOrderByPositionAscIdDesc(parsed)
                : vehicles.findByTypeAndAvailableTrueOrderByPositionAscIdDesc(parsed);
    }

    @GetMapping("/vehicles/featured")
    public List<Vehicle> featured() {
        return vehicles.findByFeaturedTrueAndAvailableTrueOrderByPositionAscIdDesc();
    }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<Vehicle> one(@PathVariable Long id) {
        return vehicles.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** Numeros de reservation, reseaux sociaux et textes du site. */
    @GetMapping("/settings")
    public SiteSettings settings() {
        return settings.findById(1L).orElseGet(() -> settings.save(new SiteSettings()));
    }

    /** Demande de reservation envoyee depuis le formulaire du site. */
    @PostMapping("/reservations")
    public ResponseEntity<?> create(@RequestBody Reservation reservation) {
        if (isBlank(reservation.getCustomerName()) || isBlank(reservation.getCustomerPhone())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le nom et le telephone sont obligatoires"));
        }
        reservation.setId(null);
        reservation.setStatus(Reservation.Status.NEW);
        if (reservation.getVehicleId() != null && isBlank(reservation.getVehicleName())) {
            vehicles.findById(reservation.getVehicleId())
                    .ifPresent(v -> reservation.setVehicleName(v.getName()));
        }
        Reservation saved = reservations.save(reservation);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "message", "Demande enregistree"));
    }

    static VehicleType parseType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        try {
            return VehicleType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
