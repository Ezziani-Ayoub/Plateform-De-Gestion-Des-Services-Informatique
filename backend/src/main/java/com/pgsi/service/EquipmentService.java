package com.pgsi.service;

import com.pgsi.dto.CreateEquipmentRequest;
import com.pgsi.dto.EquipmentDto;
import com.pgsi.dto.UpdateEquipmentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EquipmentService {
    Page<EquipmentDto> getEquipments(String search, String category, String status, Pageable pageable);
    EquipmentDto getEquipmentById(Long id);
    EquipmentDto createEquipment(CreateEquipmentRequest request);
    EquipmentDto updateEquipment(Long id, UpdateEquipmentRequest request);
    void deleteEquipment(Long id);
    EquipmentDto assignEquipmentToUser(Long equipmentId, Long userId);
}
