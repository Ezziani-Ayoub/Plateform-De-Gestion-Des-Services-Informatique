package com.pgsi.dto;

import java.util.List;

public class UserDto {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Boolean enabled;
    private List<String> roles;

    public UserDto() {}

    public UserDto(Long id, String username, String email, String fullName, Boolean enabled, List<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.enabled = enabled;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private Boolean enabled;
        private List<String> roles;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder enabled(Boolean enabled) { this.enabled = enabled; return this; }
        public Builder roles(List<String> roles) { this.roles = roles; return this; }

        public UserDto build() {
            return new UserDto(id, username, email, fullName, enabled, roles);
        }
    }
}
