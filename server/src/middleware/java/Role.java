package middleware;

/**
 * User roles within the Healix Clinic system.
 * - ADMIN: Doctor / Clinic Administrator with universal authority.
 * - NURSE: Attending clinical staff with appointment view/edit permissions.
 * - USER:  Patient with self-service viewing permissions.
 */
public enum Role {
    ADMIN,
    NURSE,
    USER;

    public static Role fromString(String roleStr) {
        if (roleStr == null) return null;
        try {
            return Role.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
