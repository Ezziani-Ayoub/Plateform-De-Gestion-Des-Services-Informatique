package com.pgsi.dto;

import com.pgsi.entity.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateEquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 100, message = "Equipment name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number cannot exceed 100 characters")
    private String serialNumber;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @NotNull(message = "Equipment status is required")
    private EquipmentStatus status;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    private LocalDate purchaseDate;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private Long assignedToUserId;
}
