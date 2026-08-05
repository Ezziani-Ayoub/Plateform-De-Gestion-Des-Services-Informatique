package com.pgsi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class UpdateUserRequest {

    @Size(max = 100)
    private String fullName;

    @Email(message = "Format d'email invalide")
    private String email;

    /** If provided, replaces the user's entire role set. */
    private Set<String> roles;

    private Long departmentId;

    /** If provided, enables or disables the account. */
    private Boolean enabled;

    /** If provided, updates the password. */
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    // Getters & Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
