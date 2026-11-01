package middleware;

import java.util.Set;

/**
 * Representation of a user / staff member in the clinic with dynamic access control.
 */
public class User {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private String status;
    private String accessLevel; // "standard" or "full"
    private boolean isCoAdmin;
    private Set<Permission> customPermissions;

    public User() {}

    public User(String id, String username, String email, String fullName, Role role, String status) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
        this.accessLevel = (role == Role.ADMIN) ? "full" : "standard";
        this.isCoAdmin = false;
    }

    public User(String id, String username, String email, String fullName, Role role, String status, String accessLevel, boolean isCoAdmin) {
        this(id, username, email, fullName, role, status);
        this.accessLevel = accessLevel;
        this.isCoAdmin = isCoAdmin;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }

    public boolean isCoAdmin() { return isCoAdmin; }
    public void setCoAdmin(boolean coAdmin) { isCoAdmin = coAdmin; }

    public Set<Permission> getCustomPermissions() { return customPermissions; }
    public void setCustomPermissions(Set<Permission> customPermissions) { this.customPermissions = customPermissions; }

    @Override
    public String toString() {
        return "User{id='" + id + "', username='" + username + "', role=" + role + ", accessLevel='" + accessLevel + "', isCoAdmin=" + isCoAdmin + "}";
    }
}
