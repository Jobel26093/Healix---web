package middleware;

/**
 * Granular clinical permissions within the Healix Clinic system.
 * Mirrors the permissions catalog in permissionEngine.js and permissionEngine.jsx.
 */
public enum Permission {
    // Appointments
    APPOINTMENTS_VIEW("appointments:view"),
    APPOINTMENTS_CREATE("appointments:create"),
    APPOINTMENTS_MANAGE("appointments:manage"),
    APPOINTMENTS_CANCEL("appointments:cancel"),
    APPOINTMENTS_DELETE("appointments:delete"),
    APPOINTMENTS_SET_STATUS("appointments:set_status"),
    APPOINTMENTS_SET_AMOUNT("appointments:set_amount"),
    APPOINTMENTS_NURSE_NOTES("appointments:nurse_notes"),

    // Patients
    PATIENTS_VIEW_ALL("patients:view_all"),
    PATIENTS_VIEW_CLINICAL("patients:view_clinical"),
    PATIENTS_MANAGE("patients:manage"),

    // Nurses & Staff
    NURSES_VIEW("nurses:view"),
    NURSES_MANAGE("nurses:manage"),

    // Timings
    TIMINGS_VIEW("timings:view"),
    TIMINGS_MANAGE("timings:manage"),

    // Payments & Financials
    PAYMENTS_INCOME_SUMMARY("payments:income_summary"),
    PAYMENTS_VIEW_ALL("payments:view_all"),
    PAYMENTS_VIEW_OWN("payments:view_own"),
    PAYMENTS_PROCESS("payments:process"),
    PAYMENTS_COLLECT("payments:collect"),

    // Audit
    AUDIT_VIEW("audit:view");

    private final String value;

    Permission(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Permission fromValue(String value) {
        if (value == null) return null;
        for (Permission p : values()) {
            if (p.value.equalsIgnoreCase(value.trim())) {
                return p;
            }
        }
        return null;
    }
}
