package com.pgsi.controller;

import com.pgsi.dto.CreateEquipmentRequest;
import com.pgsi.dto.EquipmentDto;
import com.pgsi.dto.MessageResponse;
import com.pgsi.dto.UpdateEquipmentRequest;
import com.pgsi.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/equipments")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public ResponseEntity<Page<EquipmentDto>> getAllEquipments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<EquipmentDto> result = equipmentService.getEquipments(search, category, status, pageable);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<EquipmentDto> createEquipment(@Valid @RequestBody CreateEquipmentRequest request) {
        EquipmentDto created = equipmentService.createEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDto> getEquipmentById(@PathVariable Long id) {
        EquipmentDto equipment = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(equipment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<EquipmentDto> updateEquipment(@PathVariable Long id, @RequestBody UpdateEquipmentRequest request) {
        EquipmentDto updated = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(new MessageResponse("Equipement supprime avec succes"));
    }

    @PutMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<EquipmentDto> assignEquipment(@PathVariable Long id, @PathVariable Long userId) {
        EquipmentDto updated = equipmentService.assignEquipmentToUser(id, userId);
        return ResponseEntity.ok(updated);
    }
}
