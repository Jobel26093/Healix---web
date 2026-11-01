import React from 'react';

/**
 * Healix Unified Permission Engine (Frontend Client Core)
 * Single source of truth for Role-Based Access Control (RBAC) and Granular Capabilities on the UI.
 * Acts in lockstep with the backend permission engine.
 */

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  NURSE: 'NURSE',
  USER: 'USER',
  PATIENT: 'USER'
});

export const PERMISSIONS = Object.freeze({
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

export const ROLE_PERMISSIONS = Object.freeze({
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

export const NURSE_ALLOWED_STATUSES = Object.freeze(["Confirmed", "Pending Dispatch", "Completed"]);

/**
 * Return list of permissions granted to a given role
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  const normalizedRole = String(role).toUpperCase();
  if (normalizedRole === 'PATIENT') return ROLE_PERMISSIONS[ROLES.USER];
  return ROLE_PERMISSIONS[normalizedRole] || [];
}

/**
 * Check if a user has a specific permission, factoring in optional context
 * (e.g. appointment ownership or permitted nurse statuses)
 */
export function isUserAdmin(user) {
  if (!user) return false;
  const role = String(user.role || '').toUpperCase();
  return role === ROLES.ADMIN || user.accessLevel === 'full' || Boolean(user.isCoAdmin);
}

export function hasPermission(user, permission, context = {}) {
  if (!user) return false;
  const role = String(user.role || '').toUpperCase();

  // Admin or Full-Access Co-Admin (Nurse / Appointed Admin) has universal authority across all permissions
  if (role === ROLES.ADMIN || user.accessLevel === 'full' || Boolean(user.isCoAdmin)) return true;

  // Use permissions array if available, or fallback to role definition
  const permissions = Array.isArray(user.permissions) && user.permissions.length > 0
    ? user.permissions
    : getPermissionsForRole(role);

  if (!permissions.includes(permission)) return false;

  // Contextual checks
  if (role === ROLES.NURSE) {
    if (permission === PERMISSIONS.APPOINTMENTS_SET_STATUS && context.status) {
      if (user.accessLevel === 'full') return true;
      return NURSE_ALLOWED_STATUSES.includes(context.status);
    }
  }

  if (role === ROLES.USER) {
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
 * Check if a user matches any of the allowed roles
 */
export function hasRole(user, ...allowedRoles) {
  if (!user || !user.role) return false;
  const userRole = String(user.role).toUpperCase();
  const normalized = allowedRoles.map(r => String(r).toUpperCase());
  if (normalized.includes(ROLES.ADMIN) && (user.accessLevel === 'full' || user.isCoAdmin)) {
    return true;
  }
  return normalized.includes(userRole);
}

/**
 * Declarative Permission Gate Component for React UI
 * Renders children only if current user has the required permission
 */
export function PermissionGate({ user, permission, context = {}, fallback = null, children }) {
  const allowed = hasPermission(user, permission, context);
  if (!allowed) return fallback;
  return <>{children}</>;
}

/**
 * Declarative Role Gate Component for React UI
 * Renders children only if current user matches allowed roles
 */
export function RoleGate({ user, allowedRoles = [], fallback = null, children }) {
  const allowed = hasRole(user, ...allowedRoles);
  if (!allowed) return fallback;
  return <>{children}</>;
}
