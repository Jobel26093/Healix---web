const express = require('express');
const router = express.Router();
const { requireRole, requirePermission, PERMISSIONS, getPermissionsForRole } = require('../middleware/roles');
const { getDB, saveDB, addAuditLog } = require('../db/store');

// All nurse roster and operational management routes are restricted to Doctor / Admin
router.use(requirePermission(PERMISSIONS.NURSES_MANAGE));

// GET /api/admin/nurses - Fetch all nurses in the clinic roster
router.get('/', (req, res) => {
  const db = getDB();
  const nurses = db.users
    .filter(u => u.role === 'NURSE')
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      shift: u.shift || 'Morning (08:00 AM - 02:00 PM)',
      status: u.status || 'Active',
      supervisingDoctor: u.supervisingDoctor || 'Dr. Calvin Joel (Chief Physiotherapist)',
      password: u.password || '••••••',
      createdAt: u.createdAt || u.joinedDate || null,
      resignedAt: u.resignedAt || null,
      notes: u.notes || ''
    }));

  res.json({
    success: true,
    total: nurses.length,
    nurses
  });
});

// POST /api/admin/nurses - Doctor registers a new incoming nurse
router.post('/', (req, res) => {
  const db = getDB();
  const { 
    fullName, 
    email, 
    username, 
    password, 
    phone, 
    shift, 
    supervisingDoctor, 
    notes 
  } = req.body;

  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ success: false, error: "Nurse full name is required." });
  }

  if (!email || !String(email).trim()) {
    return res.status(400).json({ success: false, error: "Registered email address is required for nurse login and OTP security." });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const rawUsername = username && String(username).trim() 
    ? String(username).toLowerCase().trim() 
    : cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '_');
  const cleanPassword = password ? String(password).trim() : 'Nurse@1234';

  // Check email collision
  const existingEmail = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ 
      success: false, 
      error: `An account with email "${cleanEmail}" already exists (${existingEmail.role}: ${existingEmail.fullName}).` 
    });
  }

  // Check username collision
  const existingUsername = db.users.find(u => u.username && u.username.toLowerCase() === rawUsername);
  const finalUsername = existingUsername ? `${rawUsername}_${Date.now().toString().slice(-4)}` : rawUsername;

  const newNurseId = `NURSE_${Date.now()}`;
  const newNurse = {
    id: newNurseId,
    fullName: String(fullName).trim(),
    email: cleanEmail,
    username: finalUsername,
    password: cleanPassword,
    role: "NURSE",
    phone: phone ? String(phone).trim() : "+91 94432 00000",
    shift: shift || "Morning (08:00 AM - 02:00 PM)",
    status: "Active",
    supervisingDoctor: supervisingDoctor || "Dr. Calvin Joel (Chief Physiotherapist)",
    createdAt: new Date().toISOString(),
    notes: notes ? String(notes).trim() : "Newly onboarded clinic nurse by Medical Director."
  };

  db.users.push(newNurse);
  addAuditLog(
    db, 
    "Dr. Calvin Joel (Doctor/Admin)", 
    "New Nurse Onboarded", 
    `Doctor added new incoming nurse: ${newNurse.fullName} (@${newNurse.username}, Email: ${newNurse.email}) for shift ${newNurse.shift}.`
  );
  saveDB(db);

  res.status(201).json({
    success: true,
    message: `Nurse ${newNurse.fullName} successfully registered to Nurse Station!`,
    nurse: {
      id: newNurse.id,
      fullName: newNurse.fullName,
      username: newNurse.username,
      email: newNurse.email,
      phone: newNurse.phone,
      shift: newNurse.shift,
      status: newNurse.status,
      supervisingDoctor: newNurse.supervisingDoctor,
      password: newNurse.password
    }
  });
});

// PUT /api/admin/nurses/:id - Doctor updates nurse details, resets password, changes shift or status
router.put('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const nurse = db.users.find(u => u.id === id && u.role === 'NURSE');

  if (!nurse) {
    return res.status(404).json({ success: false, error: "Nurse record not found in system." });
  }

  const { 
    fullName, 
    email, 
    username, 
    password, 
    phone, 
    shift, 
    status, 
    supervisingDoctor, 
    notes 
  } = req.body;

  // Validate email if changed
  if (email && String(email).trim().toLowerCase() !== nurse.email.toLowerCase()) {
    const cleanEmail = String(email).trim().toLowerCase();
    const collision = db.users.find(u => u.id !== id && u.email && u.email.toLowerCase() === cleanEmail);
    if (collision) {
      return res.status(400).json({ success: false, error: `Email "${cleanEmail}" is already used by another account.` });
    }
    nurse.email = cleanEmail;
  }

  if (fullName && String(fullName).trim()) nurse.fullName = String(fullName).trim();
  if (username && String(username).trim()) nurse.username = String(username).toLowerCase().trim();
  if (password && String(password).trim()) nurse.password = String(password).trim();
  if (phone !== undefined) nurse.phone = String(phone).trim();
  if (shift) nurse.shift = String(shift).trim();
  if (supervisingDoctor) nurse.supervisingDoctor = String(supervisingDoctor).trim();
  if (notes !== undefined) nurse.notes = String(notes).trim();

  // If status changed
  if (status && status !== nurse.status) {
    const oldStatus = nurse.status;
    nurse.status = status;
    if (status === 'Resigned' || status === 'Inactive') {
      nurse.resignedAt = new Date().toISOString();
      addAuditLog(
        db, 
        "Dr. Calvin Joel (Doctor/Admin)", 
        "Nurse Marked Resigned / Inactive", 
        `Doctor changed nurse ${nurse.fullName}'s status from "${oldStatus}" to "${status}". Nurse portal access revoked.`
      );
    } else if (status === 'Active') {
      nurse.resignedAt = null;
      addAuditLog(
        db, 
        "Dr. Calvin Joel (Doctor/Admin)", 
        "Nurse Account Reactivated", 
        `Doctor reactivated nurse ${nurse.fullName} to Active duty status.`
      );
    }
  } else {
    addAuditLog(
      db, 
      "Dr. Calvin Joel (Doctor/Admin)", 
      "Nurse Profile Updated", 
      `Doctor updated profile/credentials for nurse ${nurse.fullName} (@${nurse.username}).`
    );
  }

  saveDB(db);

  res.json({
    success: true,
    message: `Nurse ${nurse.fullName} updated successfully.`,
    nurse: {
      id: nurse.id,
      fullName: nurse.fullName,
      username: nurse.username,
      email: nurse.email,
      phone: nurse.phone,
      shift: nurse.shift,
      status: nurse.status,
      supervisingDoctor: nurse.supervisingDoctor,
      password: nurse.password,
      resignedAt: nurse.resignedAt
    }
  });
});

// DELETE /api/admin/nurses/:id - Handle nurse quitting/resignation or deletion
router.delete('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const nurseIndex = db.users.findIndex(u => u.id === id && u.role === 'NURSE');

  if (nurseIndex === -1) {
    return res.status(404).json({ success: false, error: "Nurse account not found." });
  }

  const nurse = db.users[nurseIndex];
  const permanent = req.query.permanent === 'true';

  if (permanent) {
    db.users.splice(nurseIndex, 1);
    addAuditLog(
      db, 
      "Dr. Calvin Joel (Doctor/Admin)", 
      "Nurse Account Permanently Removed", 
      `Doctor permanently deleted nurse record for ${nurse.fullName} (Email: ${nurse.email}).`
    );
    saveDB(db);

    return res.json({
      success: true,
      message: `Nurse ${nurse.fullName} record permanently removed from clinic system.`
    });
  } else {
    // Standard clinical protocol: Mark as Resigned and Revoke Portal Access
    nurse.status = "Resigned";
    nurse.resignedAt = new Date().toISOString();
    nurse.notes = (nurse.notes ? nurse.notes + " | " : "") + `Resigned on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Access revoked.`;
    
    addAuditLog(
      db, 
      "Dr. Calvin Joel (Doctor/Admin)", 
      "Nurse Resigned & Portal Access Revoked", 
      `Doctor marked nurse ${nurse.fullName} as Resigned. Nurse portal login blocked.`
    );
    saveDB(db);

    return res.json({
      success: true,
      message: `Nurse ${nurse.fullName} has been marked as Resigned. Nurse Station login has been immediately revoked.`,
      nurse
    });
  }
});


// PATCH /api/admin/nurses/:id/access-level - Toggle between Standard and Full Admin Access
router.patch('/:id/access-level', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const nurse = db.users.find(u => u.id === id && u.role === 'NURSE');

  if (!nurse) {
    return res.status(404).json({ success: false, error: "Nurse record not found." });
  }

  const { accessLevel } = req.body;
  const isFull = accessLevel === 'full';
  nurse.accessLevel = isFull ? 'full' : 'standard';
  nurse.isCoAdmin = isFull;
  nurse.permissions = isFull ? Object.values(PERMISSIONS) : getPermissionsForRole('NURSE');

  addAuditLog(
    db, 
    "Doctor/Admin", 
    "Nurse Access Level Modified", 
    `Nurse ${nurse.fullName} granted ${isFull ? 'Full Access (Same as Admin)' : 'Standard Clinical Access'}.`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Nurse ${nurse.fullName} updated to ${isFull ? 'Full Admin Access' : 'Standard Clinical Access'}.`,
    nurse: {
      id: nurse.id,
      fullName: nurse.fullName,
      accessLevel: nurse.accessLevel,
      isCoAdmin: nurse.isCoAdmin,
      permissions: nurse.permissions
    }
  });
});

// PATCH /api/admin/nurses/:id/permissions - Dynamically customize permissions
router.patch('/:id/permissions', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const nurse = db.users.find(u => u.id === id && (u.role === 'NURSE' || u.role === 'USER'));

  if (!nurse) {
    return res.status(404).json({ success: false, error: "Staff member not found." });
  }

  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ success: false, error: "Permissions must be an array of strings." });
  }

  nurse.permissions = permissions;
  addAuditLog(
    db, 
    "Doctor/Admin", 
    "Dynamic Permissions Updated", 
    `Granular permissions customized for ${nurse.fullName} (${permissions.length} capabilities assigned).`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Permissions successfully updated for ${nurse.fullName}.`,
    nurse: {
      id: nurse.id,
      fullName: nurse.fullName,
      permissions: nurse.permissions
    }
  });
});

module.exports = router;
