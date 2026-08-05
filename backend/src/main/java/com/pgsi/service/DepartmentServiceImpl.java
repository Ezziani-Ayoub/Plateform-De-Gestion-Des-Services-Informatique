package com.pgsi.service;

import com.pgsi.dto.CreateDepartmentRequest;
import com.pgsi.dto.DepartmentDto;
import com.pgsi.entity.Department;
import com.pgsi.exception.BadRequestException;
import com.pgsi.exception.ResourceNotFoundException;
import com.pgsi.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToDto(dept);
    }

    @Override
    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Un département avec ce nom existe déjà");
        }
        Department dept = new Department();
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        return mapToDto(departmentRepository.save(dept));
    }

    @Override
    @Transactional
    public DepartmentDto updateDepartment(Long id, CreateDepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        // Only check name conflict if the name actually changed
        if (!dept.getName().equals(request.getName()) && departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Un département avec ce nom existe déjà");
        }
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        return mapToDto(departmentRepository.save(dept));
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        departmentRepository.delete(dept);
    }

    private DepartmentDto mapToDto(Department dept) {
        return new DepartmentDto(dept.getId(), dept.getName(), dept.getDescription(),
                dept.getCreatedAt(), dept.getUpdatedAt());
    }
}
