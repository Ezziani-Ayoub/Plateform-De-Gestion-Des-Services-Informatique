package com.pgsi.controller;

import com.pgsi.dto.CreateEquipmentRequest;
import com.pgsi.dto.EquipmentDto;
import com.pgsi.dto.MessageResponse;
import com.pgsi.dto.UpdateEquipmentRequest;
import com.pgsi.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    /** Maps Java camelCase property names to PostgreSQL snake_case column names for native queries. */
    private String toColumnName(String field) {
        switch (field) {
            case "createdAt":      return "created_at";
            case "updatedAt":      return "updated_at";
            case "serialNumber":   return "serial_number";
            case "purchaseDate":   return "purchase_date";
            case "assignedTo":     return "assigned_user_id";
            default:               return field; // id, name, category, status, location already match
        }
    }

    @GetMapping
    public ResponseEntity<Page<EquipmentDto>> getEquipments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        String columnName = toColumnName(sortBy);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(columnName).ascending() : Sort.by(columnName).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<EquipmentDto> equipments = equipmentService.getEquipments(search, category, status, pageable);
        return ResponseEntity.ok(equipments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDto> getEquipmentById(@PathVariable Long id) {
        EquipmentDto equipment = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(equipment);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<EquipmentDto> createEquipment(@Valid @RequestBody CreateEquipmentRequest request) {
        EquipmentDto created = equipmentService.createEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<EquipmentDto> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEquipmentRequest request
    ) {
        EquipmentDto updated = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(new MessageResponse("Equipment deleted successfully"));
    }
}
