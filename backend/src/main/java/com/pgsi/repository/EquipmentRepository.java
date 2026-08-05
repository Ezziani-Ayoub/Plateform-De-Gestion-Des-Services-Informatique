package com.pgsi.repository;

import com.pgsi.entity.Equipment;
import com.pgsi.entity.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {

    Optional<Equipment> findBySerialNumber(String serialNumber);

    Boolean existsBySerialNumber(String serialNumber);

    Page<Equipment> findByStatus(EquipmentStatus status, Pageable pageable);

    Page<Equipment> findByCategory(String category, Pageable pageable);
}

