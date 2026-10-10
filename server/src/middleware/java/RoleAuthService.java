package middleware;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Core business logic for authentication and Role-Based Access Control (RBAC).
 * Mirrors the logic in roles.js:
 *   1. Resolve user ID from header (x-user-id), query param, or active user.
 *   2. Find user by ID, Email, or Username.
 *   3. If ADMIN -> universally allowed.
 *   4. If allowedRoles matches user.role -> allowed.
 *   5. Else -> 403 Forbidden.
 */
public class RoleAuthService {

    public static class AuthResult {
        private final boolean authenticated;
        private final boolean authorized;
        private final int statusCode;
        private final String errorMessage;
        private final User user;

        private AuthResult(boolean authenticated, boolean authorized, int statusCode, String errorMessage, User user) {
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
     * Evaluates whether the requested user has permission for the specified allowed roles.
     * Equivalent to:
     *   if (user.role === 'ADMIN' || allowedRoles.includes(user.role))
     */
    public static AuthResult checkPermission(User user, Role... allowedRoles) {
        if (user == null) {
            return AuthResult.unauthorized("Please log in to continue.");
        }

        // Admin has universal authority across all endpoints
        if (user.getRole() == Role.ADMIN) {
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
