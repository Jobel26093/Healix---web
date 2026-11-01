const express = require('express');
const router = express.Router();
const { getDB, saveDB, addAuditLog, AUTHORIZED_ADMIN_EMAILS } = require('../db/store');
const { requireRole, resolveUser, PERMISSIONS, getPermissionsForRole } = require('../middleware/roles');

// Universal Admin Gate: Requires Admin role or Full Access co-admin authority
router.use(requireRole('ADMIN'));

/**
 * GET /api/admin/admins
 * WhatsApp Group Style: List current group administrators (Lead Doctor + Co-Admins)
 * and all eligible clinic members who can be appointed as Admin.
 */
router.get('/admins', (req, res) => {
  const db = getDB();
  const caller = resolveUser(req);

  const admins = db.users
    .filter(u => u.role === 'ADMIN' || u.accessLevel === 'full' || u.isCoAdmin)
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      accessLevel: u.accessLevel || 'full',
      isPrimaryAdmin: Boolean(u.isPrimaryAdmin || AUTHORIZED_ADMIN_EMAILS.includes((u.email || '').toLowerCase().trim())),
      isCoAdmin: Boolean(u.isCoAdmin || (u.role === 'ADMIN' && !AUTHORIZED_ADMIN_EMAILS.includes((u.email || '').toLowerCase().trim()))),
      promotedAt: u.promotedAt || null,
      promotedBy: u.promotedBy || null,
      status: u.status || 'Active'
    }));

  const eligibleUsers = db.users
    .filter(u => u.role !== 'ADMIN' && u.accessLevel !== 'full' && !u.isCoAdmin)
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status || 'Active'
    }));

  res.json({
    success: true,
    totalAdmins: admins.length,
    admins,
    eligibleUsers
  });
});

/**
 * POST /api/admin/make-admin
 * WhatsApp Group Style: Appoint another member as Administrator
 */
router.post('/make-admin', (req, res) => {
  const db = getDB();
  const caller = resolveUser(req) || { fullName: 'Lead Doctor' };
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId is required to appoint an Admin." });
  }

  const targetUser = db.users.find(u => u.id === userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: "Member not found in clinic records." });
  }

  if (targetUser.role === 'ADMIN' && !targetUser.isCoAdmin) {
    return res.status(400).json({ success: false, error: `${targetUser.fullName} is already a Primary Administrator.` });
  }

  // Preserve previous role so they can be reverted if dismissed
  targetUser.previousRole = targetUser.role;
  targetUser.role = 'ADMIN';
  targetUser.isCoAdmin = true;
  targetUser.accessLevel = 'full';
  targetUser.promotedAt = new Date().toISOString();
  targetUser.promotedBy = caller.fullName || caller.username || "Lead Admin";
  targetUser.permissions = Object.values(PERMISSIONS);

  addAuditLog(
    db,
    caller.fullName || "Admin",
    "Admin Appointed (WhatsApp Group Style)",
    `${caller.fullName} made ${targetUser.fullName} (@${targetUser.username}, ${targetUser.email}) a Clinic Administrator with full privileges.`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `🎉 ${targetUser.fullName} has been made a Clinic Administrator with full access!`,
    user: {
      id: targetUser.id,
      fullName: targetUser.fullName,
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role,
      accessLevel: targetUser.accessLevel,
      isCoAdmin: true,
      promotedAt: targetUser.promotedAt,
      promotedBy: targetUser.promotedBy
    }
  });
});

/**
 * POST /api/admin/dismiss-admin
 * WhatsApp Group Style: Dismiss a co-admin and revert back to normal member/nurse
 */
router.post('/dismiss-admin', (req, res) => {
  const db = getDB();
  const caller = resolveUser(req) || { fullName: 'Lead Doctor' };
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId is required to dismiss an Admin." });
  }

  const targetUser = db.users.find(u => u.id === userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: "Member record not found." });
  }

  // Protect Lead Doctor from being demoted
  const isLeadDoctor = targetUser.isPrimaryAdmin || AUTHORIZED_ADMIN_EMAILS.includes((targetUser.email || '').toLowerCase().trim());
  if (isLeadDoctor) {
    return res.status(403).json({
      success: false,
      error: "The Lead Chief Doctor & Primary Administrator cannot be dismissed."
    });
  }

  // Prevent self-lockout
  if (caller && caller.id === targetUser.id) {
    return res.status(400).json({
      success: false,
      error: "You cannot dismiss yourself as admin. Another administrator must dismiss you."
    });
  }

  const revertedRole = targetUser.previousRole || (targetUser.id.startsWith('NURSE_') ? 'NURSE' : 'USER');
  targetUser.role = revertedRole;
  targetUser.isCoAdmin = false;
  targetUser.accessLevel = 'standard';
  targetUser.permissions = getPermissionsForRole(revertedRole);
  targetUser.dismissedAt = new Date().toISOString();
  targetUser.dismissedBy = caller.fullName || caller.username || "Admin";

  addAuditLog(
    db,
    caller.fullName || "Admin",
    "Admin Dismissed (WhatsApp Group Style)",
    `${caller.fullName} dismissed ${targetUser.fullName} (@${targetUser.username}) as Admin. Reverted to ${revertedRole}.`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `${targetUser.fullName} has been dismissed as Administrator and returned to ${revertedRole} status.`,
    user: {
      id: targetUser.id,
      fullName: targetUser.fullName,
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role,
      accessLevel: targetUser.accessLevel,
      isCoAdmin: false
    }
  });
});

/**
 * GET /api/admin/users
 * Returns list of all clinic users with their role, access level, and permissions
 */
router.get('/users', (req, res) => {
  const db = getDB();
  const users = db.users.map(u => ({
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    phone: u.phone || '',
    role: u.role,
    accessLevel: u.accessLevel || (u.role === 'ADMIN' ? 'full' : 'standard'),
    isCoAdmin: Boolean(u.isCoAdmin),
    isPrimaryAdmin: Boolean(u.isPrimaryAdmin || AUTHORIZED_ADMIN_EMAILS.includes((u.email || '').toLowerCase().trim())),
    status: u.status || 'Active',
    permissions: Array.isArray(u.permissions) && u.permissions.length > 0 
      ? u.permissions 
      : (u.role === 'ADMIN' || u.accessLevel === 'full' ? Object.values(PERMISSIONS) : getPermissionsForRole(u.role))
  }));

  res.json({
    success: true,
    total: users.length,
    users
  });
});

module.exports = router;

