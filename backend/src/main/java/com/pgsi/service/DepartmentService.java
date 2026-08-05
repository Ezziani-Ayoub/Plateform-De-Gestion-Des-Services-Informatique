package com.pgsi.service;

import com.pgsi.dto.CreateDepartmentRequest;
import com.pgsi.dto.DepartmentDto;

import java.util.List;

public interface DepartmentService {
    List<DepartmentDto> getAllDepartments();
    DepartmentDto getDepartmentById(Long id);
    DepartmentDto createDepartment(CreateDepartmentRequest request);
    DepartmentDto updateDepartment(Long id, CreateDepartmentRequest request);
    void deleteDepartment(Long id);
}
