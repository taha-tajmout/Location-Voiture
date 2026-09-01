package com.mehdiluxury.repo;

import com.mehdiluxury.model.Vehicle;
import com.mehdiluxury.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findAllByOrderByPositionAscIdDesc();

    List<Vehicle> findByTypeOrderByPositionAscIdDesc(VehicleType type);

    List<Vehicle> findByAvailableTrueOrderByPositionAscIdDesc();

    List<Vehicle> findByTypeAndAvailableTrueOrderByPositionAscIdDesc(VehicleType type);

    List<Vehicle> findByFeaturedTrueAndAvailableTrueOrderByPositionAscIdDesc();
}
