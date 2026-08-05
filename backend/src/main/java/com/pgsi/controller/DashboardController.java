package com.pgsi.controller;

import com.pgsi.dto.DashboardStatsDto;
import com.pgsi.entity.EquipmentStatus;
import com.pgsi.repository.EquipmentRepository;
import com.pgsi.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    public DashboardController(UserRepository userRepository, EquipmentRepository equipmentRepository) {
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        long totalUsers = userRepository.count();
        long totalEquipments = equipmentRepository.count();
        long assignedEquipments = equipmentRepository.findAll().stream()
                .filter(e -> e.getStatus() == EquipmentStatus.IN_USE || e.getAssignedTo() != null)
                .count();
        long availableEquipments = equipmentRepository.findAll().stream()
                .filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE)
                .count();
        long maintenanceEquipments = equipmentRepository.findAll().stream()
                .filter(e -> e.getStatus() == EquipmentStatus.MAINTENANCE)
                .count();

        DashboardStatsDto stats = new DashboardStatsDto(
                totalUsers,
                totalEquipments,
                assignedEquipments,
                availableEquipments,
                maintenanceEquipments
        );

        return ResponseEntity.ok(stats);
    }
}
