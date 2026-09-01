package com.mehdiluxury.repo;

import com.mehdiluxury.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findAllByOrderByCreatedAtDesc();

    long countByStatus(Reservation.Status status);
}
