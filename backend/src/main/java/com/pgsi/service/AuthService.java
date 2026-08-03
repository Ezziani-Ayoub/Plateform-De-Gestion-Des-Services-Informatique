package com.pgsi.service;

import com.pgsi.dto.JwtResponse;
import com.pgsi.dto.LoginRequest;
import com.pgsi.dto.UserDto;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    UserDto getCurrentUser(String username);
}
