package com.pgsi.repository;

import com.pgsi.entity.Equipment;
import com.pgsi.entity.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Optional<Equipment> findBySerialNumber(String serialNumber);

    Boolean existsBySerialNumber(String serialNumber);

    Page<Equipment> findByStatus(EquipmentStatus status, Pageable pageable);

    Page<Equipment> findByCategory(String category, Pageable pageable);

    @Query(value = "SELECT * FROM equipments e WHERE " +
           "(:search IS NULL OR lower(e.name) LIKE lower(CONCAT('%', CAST(:search AS text), '%')) " +
           "OR lower(e.serial_number) LIKE lower(CONCAT('%', CAST(:search AS text), '%')) " +
           "OR lower(e.location) LIKE lower(CONCAT('%', CAST(:search AS text), '%'))) " +
           "AND (:category IS NULL OR e.category = CAST(:category AS text)) " +
           "AND (:status IS NULL OR e.status = CAST(:status AS text))",
           countQuery = "SELECT COUNT(*) FROM equipments e WHERE " +
           "(:search IS NULL OR lower(e.name) LIKE lower(CONCAT('%', CAST(:search AS text), '%')) " +
           "OR lower(e.serial_number) LIKE lower(CONCAT('%', CAST(:search AS text), '%')) " +
           "OR lower(e.location) LIKE lower(CONCAT('%', CAST(:search AS text), '%'))) " +
           "AND (:category IS NULL OR e.category = CAST(:category AS text)) " +
           "AND (:status IS NULL OR e.status = CAST(:status AS text))",
           nativeQuery = true)
    Page<Equipment> filterEquipments(@Param("search") String search,
                                     @Param("category") String category,
                                     @Param("status") String status,
                                     Pageable pageable);
}
