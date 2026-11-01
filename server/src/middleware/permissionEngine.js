const { getDB } = require('../db/store');

/**
 * Healix Unified Permission Engine (Backend Core)
 * Single source of truth for Role-Based Access Control (RBAC) and Granular Capabilities.
 */

const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  NURSE: 'NURSE',
  USER: 'USER',
  PATIENT: 'USER' // Alias for patient
});

const PERMISSIONS = Object.freeze({
  // Appointments
  APPOINTMENTS_VIEW: 'appointments:view',
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_MANAGE: 'appointments:manage',
  APPOINTMENTS_CANCEL: 'appointments:cancel',
  APPOINTMENTS_DELETE: 'appointments:delete',
  APPOINTMENTS_SET_STATUS: 'appointments:set_status',
  APPOINTMENTS_SET_AMOUNT: 'appointments:set_amount',
  APPOINTMENTS_NURSE_NOTES: 'appointments:nurse_notes',

  // Patients
  PATIENTS_VIEW_ALL: 'patients:view_all',
  PATIENTS_VIEW_CLINICAL: 'patients:view_clinical',
  PATIENTS_MANAGE: 'patients:manage',

  // Nurses & Staff Roster
  NURSES_VIEW: 'nurses:view',
  NURSES_MANAGE: 'nurses:manage',

  // Clinic Schedule & Timings
  TIMINGS_VIEW: 'timings:view',
  TIMINGS_MANAGE: 'timings:manage',

  // Payments & Financials
  PAYMENTS_INCOME_SUMMARY: 'payments:income_summary',
  PAYMENTS_VIEW_ALL: 'payments:view_all',
  PAYMENTS_VIEW_OWN: 'payments:view_own',
  PAYMENTS_PROCESS: 'payments:process',
  PAYMENTS_COLLECT: 'payments:collect',

  // System & Audit
  AUDIT_VIEW: 'audit:view'
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.NURSE]: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_SET_STATUS,
    PERMISSIONS.APPOINTMENTS_NURSE_NOTES,
    PERMISSIONS.PATIENTS_VIEW_CLINICAL,
    PERMISSIONS.NURSES_VIEW,
    PERMISSIONS.TIMINGS_VIEW
  ],

  [ROLES.USER]: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_MANAGE,
    PERMISSIONS.APPOINTMENTS_CANCEL,
    PERMISSIONS.APPOINTMENTS_DELETE,
    PERMISSIONS.PAYMENTS_VIEW_OWN,
    PERMISSIONS.PAYMENTS_PROCESS,
    PERMISSIONS.TIMINGS_VIEW
  ]
});

// Nurse status modification limits
const NURSE_ALLOWED_STATUSES = Object.freeze(["Confirmed", "Pending Dispatch", "Completed"]);

/**
 * Return list of permissions granted to a given role
 */
function getPermissionsForRole(role) {
  if (!role) return [];
  const normalizedRole = String(role).toUpperCase();
  if (normalizedRole === 'PATIENT') return ROLE_PERMISSIONS[ROLES.USER];
  return ROLE_PERMISSIONS[normalizedRole] || [];
}

/**
 * Check if a user has a specific permission, factoring in optional context (e.g. resource ownership or allowed statuses)
 */
function isUserAdmin(user) {
  if (!user) return false;
  const role = String(user.role || '').toUpperCase();
  return role === ROLES.ADMIN || user.accessLevel === 'full' || Boolean(user.isCoAdmin);
}

function hasPermission(user, permission, context = {}) {
  if (!user) return false;
  const role = String(user.role || '').toUpperCase();

  // Admin or Full-Access Co-Admin (Nurse / Appointed Admin) has universal authority across all permissions
  if (role === ROLES.ADMIN || user.accessLevel === 'full' || user.isCoAdmin) return true;

  // Granular / Dynamic permissions check (custom user permissions override or role default)
  const permissions = Array.isArray(user.permissions) && user.permissions.length > 0
    ? user.permissions
    : getPermissionsForRole(role);
  if (!permissions.includes(permission)) return false;

  // Contextual evaluations
  if (role === ROLES.NURSE) {
    if (permission === PERMISSIONS.APPOINTMENTS_SET_STATUS && context.status) {
      // Full access nurses can set any status like an admin; standard nurses are limited to allowed list
      if (user.accessLevel === 'full') return true;
      return NURSE_ALLOWED_STATUSES.includes(context.status);
    }
  }

  if (role === ROLES.USER) {
    // Ownership checks for patient operations
    if (context.appointment) {
      const apt = context.appointment;
      const owns = (apt.patientId && apt.patientId === user.id) ||
        (apt.patientPhone && user.phone && apt.patientPhone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
        (apt.patientName && user.fullName && apt.patientName.toLowerCase().trim() === user.fullName.toLowerCase().trim());
      if (!owns) return false;
    }

    if (context.patientId && context.patientId !== user.id) {
      return false;
    }
  }

  return true;
}

/**
 * Securely resolves the authentic user making the request.
 * Authenticity is checked via x-user-id header, authorization header, or active session.
 * Request body or query parameters (e.g. target patientId) are NEVER used as user identity!
 */
function resolveUser(req) {
  const db = req.db || getDB();
  const headerUserId = req.headers['x-user-id'];
  const authHeader = req.headers['authorization'];
  let explicitId = headerUserId;

  if (!explicitId && authHeader && authHeader.startsWith('Bearer ')) {
    explicitId = authHeader.substring(7).trim();
  }

  let user = null;
  if (explicitId) {
    user = (db.users || []).find(u =>
      u.id === explicitId ||
      (u.email && u.email.toLowerCase() === String(explicitId).toLowerCase()) ||
      (u.username && u.username.toLowerCase() === String(explicitId).toLowerCase())
    );
  }

  if (!user && db.activeUser) {
    user = db.activeUser;
  }

  return user;
}

/**
 * Express middleware to require a specific permission
 */
function requirePermission(permission, contextResolver = null) {
  return (req, res, next) => {
    const db = getDB();
    req.db = db;
    const user = resolveUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please log in to continue.",
        code: "UNAUTHENTICATED"
      });
    }

    const context = typeof contextResolver === 'function' ? contextResolver(req) : {};
    const allowed = hasPermission(user, permission, context);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: `Access denied: your account role (${user.role}) lacks permission "${permission}".`,
        code: "PERMISSION_DENIED",
        requiredPermission: permission,
        userRole: user.role
      });
    }

    req.activeUser = user;
    req.user = user;
    req.userPermissions = getPermissionsForRole(user.role);
    next();
  };
}

/**
 * Express middleware to require one of the specified roles
 */
function requireRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map(r => String(r).toUpperCase());

  return (req, res, next) => {
    const db = getDB();
    req.db = db;
    const user = resolveUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please log in to continue.",
        code: "UNAUTHENTICATED"
      });
    }

    const userRole = String(user.role || '').toUpperCase();

    // Admin or Full-Access Nurse co-admin has universal authority across all endpoints
    const hasAdminAuthority = userRole === ROLES.ADMIN || user.accessLevel === 'full' || Boolean(user.isCoAdmin);
    if (hasAdminAuthority || normalizedAllowed.includes(userRole)) {
      req.activeUser = user;
      req.user = user;
      req.userPermissions = hasAdminAuthority
        ? Object.values(PERMISSIONS)
        : (user.permissions || getPermissionsForRole(user.role));
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access denied: your account (${user.role}) is not permitted to perform this action.`,
      code: "FORBIDDEN",
      allowedRoles: normalizedAllowed,
      userRole: user.role
    });
  };
}

module.exports = {
  ROLES,
  isUserAdmin,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  NURSE_ALLOWED_STATUSES,
  getPermissionsForRole,
  hasPermission,
  resolveUser,
  requirePermission,
  requireRole
};
