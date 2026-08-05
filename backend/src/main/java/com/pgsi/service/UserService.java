package com.pgsi.service;

import com.pgsi.dto.CreateUserRequest;
import com.pgsi.dto.UpdateUserRequest;
import com.pgsi.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    Page<UserDto> getUsers(String search, Long departmentId, Pageable pageable);
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    UserDto createUser(CreateUserRequest request);
    UserDto updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
}
