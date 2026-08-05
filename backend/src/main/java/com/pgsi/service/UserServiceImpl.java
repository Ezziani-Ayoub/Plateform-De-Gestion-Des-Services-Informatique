package com.pgsi.service;

import com.pgsi.dto.CreateUserRequest;
import com.pgsi.dto.UpdateUserRequest;
import com.pgsi.dto.UserDto;
import com.pgsi.entity.Department;
import com.pgsi.entity.ERole;
import com.pgsi.entity.Role;
import com.pgsi.entity.User;
import com.pgsi.exception.BadRequestException;
import com.pgsi.exception.ResourceNotFoundException;
import com.pgsi.repository.DepartmentRepository;
import com.pgsi.repository.RoleRepository;
import com.pgsi.repository.UserRepository;
import com.pgsi.repository.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getUsers(String search, Long departmentId, Pageable pageable) {
        return userRepository.findAll(UserSpecification.withFilters(search, departmentId), pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Ce nom d'utilisateur est déjà utilisé");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName() != null ? request.getFullName() : request.getUsername());
        user.setEnabled(true);

        Set<Role> roles = resolveRoles(request.getRoles());
        user.setRoles(roles);

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            user.setDepartment(dept);
        }

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Cet email est déjà utilisé");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = resolveRoles(request.getRoles());
            user.setRoles(roles);
        }

        if (request.getDepartmentId() != null) {
            if (request.getDepartmentId() == -1L) {
                user.setDepartment(null);
            } else {
                Department dept = departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
                user.setDepartment(dept);
            }
        }

        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    private Set<Role> resolveRoles(Set<String> strRoles) {
        Set<Role> roles = new HashSet<>();
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Erreur: Rôle non trouvé."));
            roles.add(userRole);
            return roles;
        }

        for (String role : strRoles) {
            String cleanRole = role.trim().toUpperCase();
            if (!cleanRole.startsWith("ROLE_")) {
                cleanRole = "ROLE_" + cleanRole;
            }
            // Map ROLE_EMPLOYEE to ROLE_USER for backend consistency if sent
            if ("ROLE_EMPLOYEE".equals(cleanRole)) {
                cleanRole = "ROLE_USER";
            }

            ERole eRole;
            try {
                eRole = ERole.valueOf(cleanRole);
            } catch (IllegalArgumentException e) {
                eRole = ERole.ROLE_USER;
            }

            Role foundRole = roleRepository.findByName(eRole)
                    .orElseThrow(() -> new RuntimeException("Erreur: Rôle " + role + " non trouvé."));
            roles.add(foundRole);
        }
        return roles;
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setEnabled(user.getEnabled());
        dto.setRoles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList()));
        if (user.getDepartment() != null) {
            dto.setDepartmentId(user.getDepartment().getId());
            dto.setDepartmentName(user.getDepartment().getName());
        }
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
