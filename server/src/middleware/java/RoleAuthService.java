package middleware;

import java.util.*;

/**
 * Core Role-Based and Permission-Based Access Control Evaluation Service.
 * Implements centralized enterprise logic for the Healix Physiotherapy system with dynamic access levels.
 */
public class RoleAuthService {

    /**
     * Authentication result containing status code, success state, and contextual diagnostic message.
     */
    public static class AuthResult {
        private final boolean authenticated;
        private final boolean authorized;
        private final int statusCode;
        private final String errorMessage;
        private final User user;

        public AuthResult(boolean authenticated, boolean authorized, int statusCode, String errorMessage, User user) {
            this.authenticated = authenticated;
            this.authorized = authorized;
            this.statusCode = statusCode;
            this.errorMessage = errorMessage;
            this.user = user;
        }

        public static AuthResult success(User user) {
            return new AuthResult(true, true, 200, null, user);
        }

        public static AuthResult unauthorized(String message) {
            return new AuthResult(false, false, 401, message, null);
        }

        public static AuthResult forbidden(String message) {
            return new AuthResult(true, false, 403, message, null);
        }

        public boolean isSuccess() { return authenticated && authorized; }
        public int getStatusCode() { return statusCode; }
        public String getErrorMessage() { return errorMessage; }
        public User getUser() { return user; }
    }

    /**
     * Resolves the user from the repository based on explicitId (id, email, or username).
     */
    public static Optional<User> findUser(List<User> userList, String explicitId) {
        if (explicitId == null || explicitId.trim().isEmpty() || userList == null) {
            return Optional.empty();
        }
        String needle = explicitId.trim().toLowerCase();

        return userList.stream().filter(u ->
            (u.getId() != null && u.getId().equalsIgnoreCase(needle)) ||
            (u.getEmail() != null && u.getEmail().toLowerCase().equals(needle)) ||
            (u.getUsername() != null && u.getUsername().toLowerCase().equals(needle))
        ).findFirst();
    }

    /**
     * Return list of permissions granted to a given role
     */
    public static Set<Permission> getPermissionsForRole(Role role) {
        if (role == null) return Collections.emptySet();
        switch (role) {
            case ADMIN:
                return EnumSet.allOf(Permission.class);
            case NURSE:
                return EnumSet.of(
                    Permission.APPOINTMENTS_VIEW,
                    Permission.APPOINTMENTS_SET_STATUS,
                    Permission.APPOINTMENTS_NURSE_NOTES,
                    Permission.PATIENTS_VIEW_CLINICAL,
                    Permission.NURSES_VIEW,
                    Permission.TIMINGS_VIEW
                );
            case USER:
                return EnumSet.of(
                    Permission.APPOINTMENTS_VIEW,
                    Permission.APPOINTMENTS_CREATE,
                    Permission.APPOINTMENTS_MANAGE,
                    Permission.APPOINTMENTS_CANCEL,
                    Permission.APPOINTMENTS_DELETE,
                    Permission.PAYMENTS_VIEW_OWN,
                    Permission.PAYMENTS_PROCESS,
                    Permission.TIMINGS_VIEW
                );
            default:
                return Collections.emptySet();
        }
    }

    /**
     * Check if user possesses a granular permission, factoring in dynamic access level and co-admin privileges.
     */
    public static boolean hasPermission(User user, Permission permission) {
        if (user == null || permission == null) return false;
        // Admin, Full Access nurse, or Co-Admin has universal authority across all permissions
        if (user.getRole() == Role.ADMIN || "full".equalsIgnoreCase(user.getAccessLevel()) || user.isCoAdmin()) {
            return true;
        }
        // Custom granular permission overrides
        if (user.getCustomPermissions() != null && !user.getCustomPermissions().isEmpty()) {
            return user.getCustomPermissions().contains(permission);
        }
        return getPermissionsForRole(user.getRole()).contains(permission);
    }

    /**
     * Evaluates permission requirement for a user.
     */
    public static AuthResult checkPermission(User user, Permission permission) {
        if (user == null) {
            return AuthResult.unauthorized("Authentication required. Please log in to continue.");
        }
        if (hasPermission(user, permission)) {
            return AuthResult.success(user);
        }
        return AuthResult.forbidden(
            "Access denied: your account (" + user.getRole() + ") lacks permission '" + permission.getValue() + "'."
        );
    }

    /**
     * Evaluates whether the requested user has permission for the specified allowed roles.
     * Factors in dynamic full-access and co-admin authority.
     */
    public static AuthResult checkPermission(User user, Role... allowedRoles) {
        if (user == null) {
            return AuthResult.unauthorized("Please log in to continue.");
        }

        // Admin or Full-Access Co-Admin has universal authority across all endpoints
        if (user.getRole() == Role.ADMIN || "full".equalsIgnoreCase(user.getAccessLevel()) || user.isCoAdmin()) {
            return AuthResult.success(user);
        }

        boolean hasRole = Arrays.asList(allowedRoles).contains(user.getRole());
        if (hasRole) {
            return AuthResult.success(user);
        }

        return AuthResult.forbidden(
            "Access denied: your account (" + user.getRole() + ") is not permitted to perform this action."
        );
    }
}
