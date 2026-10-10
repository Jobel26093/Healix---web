const express = require('express');
const router = express.Router();
const { getDB, saveDB, addAuditLog, AUTHORIZED_ADMIN_EMAILS, AUTHORIZED_ADMIN_USERNAMES } = require('../db/store');
const { generateAndSendOtp, verifyOtp, maskEmail, generateAndSendAdminOtp, verifyAdminOtp } = require('../services/otpService');

// Get active session user profile
router.get('/me', (req, res) => {
  const db = getDB();
  const sessionUser = db.activeUser;
  res.json({
    success: true,
    user: sessionUser
  });
});

// Patient / User Signup
router.post('/register', (req, res) => {
  const db = getDB();
  const { username, email, password, fullName, phone, age, gender, address, medicalCondition } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, error: "Email, password, and full name are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

  // Prevent user from registering with admin email/username
  if (AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail) || (AUTHORIZED_ADMIN_USERNAMES && AUTHORIZED_ADMIN_USERNAMES.includes(cleanUsername))) {
    return res.status(400).json({ 
      success: false, 
      error: "This email address or username is reserved for System Administration. Please log in via the Admin Portal." 
    });
  }

  const existingEmail = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ success: false, error: "An account with this email address already exists." });
  }

  const existingUsername = db.users.find(u => u.username && u.username.toLowerCase() === cleanUsername);
  if (existingUsername) {
    return res.status(400).json({ success: false, error: `The username "${cleanUsername}" is already taken. Please choose another.` });
  }

  const newUser = {
    id: `usr_pat_${Date.now()}`,
    username: cleanUsername,
    email: cleanEmail,
    password: password,
    fullName: fullName,
    phone: phone || "+1 (555) 000-0000",
    role: "USER",
    age: parseInt(age) || 30,
    gender: gender || "Other",
    address: address || "",
    medicalCondition: medicalCondition || "Physiotherapy Consultation",
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.users.push(newUser);
  db.activeUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
    phone: newUser.phone,
    address: newUser.address
  };

  addAuditLog(db, newUser.fullName, "Patient Registered", `New patient account created for ${newUser.fullName} (@${newUser.username}, ${newUser.email}).`);
  saveDB(db);

  res.status(201).json({
    success: true,
    message: "Patient account registered successfully!",
    user: db.activeUser
  });
});

// User / Patient Login (Accepts Username OR Email, supports /user-login and /login)
router.post(['/user-login', '/login'], (req, res) => {
  const db = getDB();
  const { usernameOrEmail, email, username, password } = req.body;
  const identifier = (usernameOrEmail || username || email || '').toLowerCase().trim();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: "Username or email address and password are required." });
  }

  const user = db.users.find(u => 
    (u.email && u.email.toLowerCase() === identifier) ||
    (u.username && u.username.toLowerCase() === identifier)
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: "Invalid patient username/email or password." });
  }

  db.activeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    address: user.address
  };

  addAuditLog(db, user.fullName, "Patient Logged In", `Patient session initiated for ${user.fullName} (@${user.username || user.email}).`);
  saveDB(db);

  res.json({
    success: true,
    message: `Welcome back, ${user.fullName}!`,
    user: db.activeUser
  });
});

// Admin Portal Login (EXCLUSIVELY FOR DOCTOR / ADMIN, accepts username e.g. drcalvin or email)
router.post('/admin-login', (req, res) => {
  const db = getDB();
  const { usernameOrEmail, email, username, password } = req.body;
  const identifier = (usernameOrEmail || username || email || '').toLowerCase().trim();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: "Admin username/email and password are required." });
  }

  // If nurse tries to login as admin, provide helpful redirect
  const matchedNurse = db.users.find(u => 
    u.role === "NURSE" && (
      (u.email && u.email.toLowerCase() === identifier) ||
      (u.username && u.username.toLowerCase() === identifier)
    )
  );
  if (matchedNurse) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: This account is registered as Clinic Nurse (${matchedNurse.fullName}). Please log in via the Nurse Portal.`,
      suggestion: "Please use the Nurse Portal to sign in."
    });
  }

  const adminUsernames = AUTHORIZED_ADMIN_USERNAMES || ['drcalvin', 'calvinjoelc', 'admin', 'drjoel'];
  const isAuthorized = AUTHORIZED_ADMIN_EMAILS.includes(identifier) || adminUsernames.includes(identifier);

  // Strict whitelist check
  if (!isAuthorized) {
    addAuditLog(
      db, 
      identifier, 
      "UNAUTHORIZED ADMIN ACCESS ATTEMPT", 
      `Access denied for ${identifier}. Not in Doctor Whitelist.`
    );
    saveDB(db);

    return res.status(403).json({
      success: false,
      error: "Access Denied: Admin login is restricted to authorized clinic doctors only.",
      suggestion: "If you are a nurse, please log in through the Nurse Portal. If you are a patient, log in through the Patient Portal."
    });
  }

  let adminUser = db.users.find(u => 
    u.role === "ADMIN" && (
      (u.email && u.email.toLowerCase() === identifier) ||
      (u.username && u.username.toLowerCase() === identifier) ||
      AUTHORIZED_ADMIN_EMAILS.includes(u.email.toLowerCase())
    )
  );

  // Auto-provision default doctor admin if missing in db array
  if (!adminUser) {
    adminUser = {
      id: `usr_admin_${Date.now()}`,
      email: "calvinjoelc@gmail.com",
      username: "drcalvin",
      password: password,
      fullName: "Dr. Joel Calvin C (Lead Physio & Doctor)",
      phone: "+91 73053 94549",
      role: "ADMIN",
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.users.push(adminUser);
  } else if (adminUser.password !== password) {
    return res.status(401).json({ success: false, error: "Incorrect admin password." });
  }

  db.activeUser = {
    id: adminUser.id,
    username: adminUser.username || "drcalvin",
    email: adminUser.email,
    fullName: adminUser.fullName,
    role: "ADMIN",
    phone: adminUser.phone
  };

  addAuditLog(db, adminUser.fullName, "Admin Portal Authenticated", `Doctor/Admin logged into PhysioCare Admin Portal (@${adminUser.username}, ${adminUser.email}).`);
  saveDB(db);

  res.json({
    success: true,
    message: `Administrator authentication granted. Welcome, ${adminUser.fullName}!`,
    user: db.activeUser
  });
});

// Nurse Portal Login (Supports any active nurse registered or managed by the Clinic Doctor)
router.post('/nurse-login', (req, res) => {
  const db = getDB();
  const { usernameOrEmail, email, username, password } = req.body;
  const identifier = (usernameOrEmail || username || email || '').toLowerCase().trim();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: "Nurse username or registered email and password are required." });
  }

  // Check if any nurse has been added by the doctor
  const totalNurses = db.users.filter(u => u.role === "NURSE");
  if (totalNurses.length === 0) {
    return res.status(403).json({
      success: false,
      error: "No clinic nurse account is currently registered. Only the attending doctor can add and authorize a nurse from the Admin Portal."
    });
  }

  // 1. Find nurse by registered email or username
  let nurse = db.users.find(u => 
    u.role === "NURSE" && (
      (u.email && u.email.toLowerCase() === identifier) ||
      (u.username && u.username.toLowerCase() === identifier)
    )
  );

  // If general alias "nurse" or "duty_nurse" was used, match active on-duty nurse
  if (!nurse && (identifier === 'nurse' || identifier === 'duty_nurse')) {
    nurse = db.users.find(u => u.role === "NURSE" && u.status !== 'Inactive' && u.status !== 'Resigned');
  }

  // If no nurse found
  if (!nurse) {
    addAuditLog(db, identifier, "UNAUTHORIZED NURSE LOGIN ATTEMPT", `Failed nurse login attempt for unlisted nurse identifier "${identifier}".`);
    saveDB(db);
    return res.status(401).json({ 
      success: false, 
      error: `No registered nurse account found matching "${identifier}". Please check your credentials or contact the attending doctor.` 
    });
  }

  // Check if nurse has quit or been deactivated by the Doctor
  if (nurse.status === 'Inactive' || nurse.status === 'Resigned' || nurse.status === 'Quitted') {
    addAuditLog(db, nurse.fullName, "BLOCKED RESIGNED NURSE LOGIN", `Resigned/Inactive nurse ${nurse.fullName} attempted login.`);
    saveDB(db);
    return res.status(403).json({
      success: false,
      error: `Access Revoked: The account for ${nurse.fullName} is marked as "${nurse.status || 'Inactive'}" by the Clinic Doctor. Please contact clinic administration.`
    });
  }

  // Verify password
  if (nurse.password !== String(password)) {
    addAuditLog(db, nurse.fullName, "FAILED NURSE LOGIN", `Incorrect password attempt for nurse ${nurse.fullName}.`);
    saveDB(db);
    return res.status(401).json({ 
      success: false, 
      error: "Invalid password for Nurse Station. Please re-enter your registered password or use 'Reset Password' with email OTP." 
    });
  }

  db.activeUser = {
    id: nurse.id,
    username: nurse.username || "nurse",
    email: nurse.email,
    fullName: nurse.fullName,
    role: "NURSE",
    phone: nurse.phone,
    shift: nurse.shift || "Morning (08:00 AM - 02:00 PM)",
    status: nurse.status || "Active",
    supervisingDoctor: nurse.supervisingDoctor || "Dr. Calvin Joel (Chief Physiotherapist)"
  };

  addAuditLog(db, nurse.fullName, "Nurse Logged In", `Nurse session initiated for ${nurse.fullName} (@${nurse.username}) - Duty Shift: ${nurse.shift || 'General'}.`);
  saveDB(db);

  res.json({
    success: true,
    message: `Welcome to Nurse Station, ${nurse.fullName}!`,
    user: db.activeUser
  });
});

// Universal Request OTP for Password Reset (All Roles: Patient, Nurse, Doctor/Admin)
router.post('/send-otp', async (req, res) => {
  const db = getDB();
  const { identifier, portalType } = req.body;
  const sessionUser = db.activeUser;

  const cleanId = (identifier || (sessionUser ? (sessionUser.email || sessionUser.username) : '')).toLowerCase().trim();

  if (!cleanId) {
    return res.status(400).json({ 
      success: false, 
      error: "Username or registered email address is required to dispatch verification OTP." 
    });
  }

  // Find user by email or username
  let targetUser = db.users.find(u => 
    (u.email && u.email.toLowerCase() === cleanId) ||
    (u.username && u.username.toLowerCase() === cleanId)
  );

  // Admin alias lookup fallback
  if (!targetUser && (portalType === 'admin' || cleanId === 'admin' || cleanId === 'drcalvin' || cleanId === 'drjoel' || cleanId === 'calvinjoelc@gmail.com' || cleanId === 'calvinjoelc')) {
    targetUser = db.users.find(u => u.role === "ADMIN");
  }

  // Nurse alias lookup fallback: prioritize active on-duty nurse
  if (!targetUser && (cleanId === 'nurse' || cleanId === 'duty_nurse')) {
    targetUser = db.users.find(u => u.role === "NURSE" && u.status !== 'Inactive' && u.status !== 'Resigned');
  }

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      error: `No registered account found matching "${identifier}". Please check your username/email or sign up.`
    });
  }

  // Portal role matching validation
  if (portalType === 'admin' && targetUser.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: "Access Denied: This account is not a Clinic Administrator. Please use the appropriate portal."
    });
  }
  if (portalType === 'nurse' && targetUser.role !== 'NURSE') {
    return res.status(403).json({
      success: false,
      error: "Access Denied: This account is not a Clinic Nurse. Please use the appropriate portal."
    });
  }
  if (portalType === 'patient' && targetUser.role !== 'USER' && targetUser.role !== 'PATIENT') {
    return res.status(403).json({
      success: false,
      error: `This account is registered as ${targetUser.role === 'ADMIN' ? 'Clinic Doctor/Admin' : 'Clinic Nurse'}. Please use the corresponding portal.`
    });
  }

  if (!targetUser.email) {
    return res.status(400).json({
      success: false,
      error: "No registered email address found for this account. Please contact clinic administration."
    });
  }

  try {
    const roleForMailer = targetUser.role === 'ADMIN' ? 'ADMIN' : (targetUser.role === 'NURSE' ? 'NURSE' : 'PATIENT');
    const otpResult = await generateAndSendOtp(targetUser.email, targetUser.fullName || targetUser.username, roleForMailer);

    if (!otpResult.success) {
      return res.status(429).json(otpResult);
    }

    addAuditLog(
      db, 
      targetUser.fullName || targetUser.username, 
      "Security Verification OTP Dispatched", 
      `Password reset verification code dispatched to registered email ${targetUser.email} (${targetUser.role}).`
    );
    saveDB(db);

    return res.json({
      success: true,
      message: `Verification code dispatched to registered email: ${otpResult.maskedEmail}. Valid for 10 minutes.`,
      email: targetUser.email,
      maskedEmail: otpResult.maskedEmail,
      username: targetUser.username,
      userRole: targetUser.role,
      devOtp: otpResult.devOtp
    });
  } catch (err) {
    console.error("Failed to generate and dispatch OTP:", err);
    return res.status(500).json({
      success: false,
      error: "An error occurred while dispatching the OTP email. Please try again."
    });
  }
});

// Backward-compatible Admin-specific OTP endpoint
router.post('/send-admin-otp', async (req, res) => {
  const db = getDB();
  const { identifier } = req.body;
  const sessionUser = db.activeUser;
  const cleanId = (identifier || (sessionUser && sessionUser.role === 'ADMIN' ? sessionUser.email : '')).toLowerCase().trim();

  let adminUser = db.users.find(u => 
    u.role === "ADMIN" && (
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.username && u.username.toLowerCase() === cleanId)
    )
  );

  if (!adminUser && (
    (AUTHORIZED_ADMIN_EMAILS && AUTHORIZED_ADMIN_EMAILS.includes(cleanId)) ||
    (AUTHORIZED_ADMIN_USERNAMES && AUTHORIZED_ADMIN_USERNAMES.includes(cleanId)) ||
    cleanId === 'admin' || cleanId === 'drcalvin' || cleanId === 'calvinjoelc' || cleanId === 'drjoel' || cleanId === 'calvinjoelc@gmail.com'
  )) {
    adminUser = db.users.find(u => u.role === "ADMIN");
  }

  if (!adminUser || adminUser.role !== 'ADMIN') {
    return res.status(404).json({
      success: false,
      error: `No authorized clinic administrator account found matching "${identifier}".`
    });
  }

  try {
    const otpResult = await generateAndSendOtp(adminUser.email, adminUser.fullName, 'ADMIN');
    if (!otpResult.success) {
      return res.status(429).json(otpResult);
    }

    addAuditLog(db, adminUser.fullName, "Admin Security OTP Dispatched", `Password verification OTP sent to ${adminUser.email}.`);
    saveDB(db);

    return res.json({
      success: true,
      message: `Verification code sent to registered administrator email: ${otpResult.maskedEmail}. Valid for 10 minutes.`,
      email: adminUser.email,
      maskedEmail: otpResult.maskedEmail,
      devOtp: otpResult.devOtp
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP without committing password change yet
router.post(['/verify-otp', '/verify-admin-otp'], (req, res) => {
  const db = getDB();
  const { identifier, otp } = req.body;
  const sessionUser = db.activeUser;
  const cleanId = (identifier || (sessionUser ? (sessionUser.email || sessionUser.username) : '')).toLowerCase().trim();

  if (!cleanId || !otp) {
    return res.status(400).json({ success: false, error: "Identifier and OTP code are required." });
  }

  let user = db.users.find(u => 
    (u.email && u.email.toLowerCase() === cleanId) ||
    (u.username && u.username.toLowerCase() === cleanId)
  );

  if (!user && (cleanId === 'admin' || cleanId === 'drcalvin' || cleanId === 'calvinjoelc@gmail.com')) {
    user = db.users.find(u => u.role === "ADMIN");
  }

  if (!user && (cleanId === 'nurse' || cleanId === 'duty_nurse')) {
    user = db.users.find(u => u.role === "NURSE" && u.status !== 'Inactive' && u.status !== 'Resigned');
  }

  if (!user) {
    return res.status(404).json({ success: false, error: "User account not found." });
  }

  const check = verifyOtp(user.email, otp);
  if (!check.valid) {
    return res.status(400).json({ success: false, error: check.error });
  }

  return res.json({
    success: true,
    message: "OTP verified successfully. You may now set your new password."
  });
});

// Authenticated Admin Password Update (used from within Admin Dashboard)
router.post('/update-admin-password', (req, res) => {
  const db = getDB();
  const { newPassword, confirmPassword, otp } = req.body;
  const sessionUser = db.activeUser;

  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return res.status(401).json({
      success: false,
      error: "Access Denied: You must be signed in as Clinic Administrator to use this endpoint."
    });
  }

  if (!newPassword || !String(newPassword).trim()) {
    return res.status(400).json({ success: false, error: "New password is required." });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: "New password and confirmation do not match." });
  }

  if (!otp) {
    return res.status(400).json({
      success: false,
      error: "Security Verification OTP is required. Please click 'Send OTP' to receive the code at your registered email."
    });
  }

  const adminUser = db.users.find(u => u.id === sessionUser.id && u.role === 'ADMIN');
  if (!adminUser) {
    return res.status(404).json({ success: false, error: "Administrator record not found in system." });
  }

  const otpCheck = verifyOtp(adminUser.email, otp);
  if (!otpCheck.valid) {
    return res.status(400).json({ success: false, error: otpCheck.error });
  }

  adminUser.password = newPassword;
  addAuditLog(
    db, 
    adminUser.fullName, 
    "Admin Password Updated", 
    `Administrator password updated via email OTP verification sent to ${adminUser.email}.`
  );
  saveDB(db);

  res.json({
    success: true,
    message: "Administrator password updated successfully! Please keep your credentials safe.",
    email: adminUser.email
  });
});

// Universal Forgot / Reset Password Endpoint (MANDATORY OTP ENFORCEMENT FOR ALL USERS)
router.post('/reset-password', (req, res) => {
  const db = getDB();
  const { identifier, newPassword, confirmPassword, portalType, otp } = req.body;

  if (!identifier || !newPassword) {
    return res.status(400).json({ success: false, error: "Username or email address and new password are required." });
  }

  // MANDATORY OTP REQUIREMENT FOR ALL ROLES: NO USER CAN RESET WITHOUT OTP VERIFICATION
  if (!otp || !String(otp).trim()) {
    return res.status(400).json({
      success: false,
      error: "Mandatory Security Verification: A 6-digit OTP is required to reset your password. Please click 'Send OTP to Email' to receive the verification code at your registered email address."
    });
  }

  const cleanOtp = String(otp).trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({
      success: false,
      error: "Invalid OTP format. Please enter the full 6-digit numeric verification code sent to your registered email."
    });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: "New password and password confirmation do not match." });
  }

  const cleanId = identifier.toLowerCase().trim();

  // Find user in database by username or email
  let user = db.users.find(u => 
    (u.email && u.email.toLowerCase() === cleanId) || 
    (u.username && u.username.toLowerCase() === cleanId)
  );

  // Admin alias lookup fallback
  if (!user && (portalType === 'admin' || cleanId === 'admin' || cleanId === 'drcalvin' || cleanId === 'drjoel' || cleanId === 'calvinjoelc@gmail.com' || cleanId === 'calvinjoelc')) {
    user = db.users.find(u => u.role === "ADMIN");
  }

  // Nurse alias lookup fallback: prioritize active on-duty nurse
  if (!user && (cleanId === 'nurse' || cleanId === 'duty_nurse')) {
    user = db.users.find(u => u.role === "NURSE" && u.status !== 'Inactive' && u.status !== 'Resigned');
  }

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: `No registered account found with username or email: "${identifier}". Please verify your credentials or create a new account.` 
    });
  }

  // Role validation if resetting through specific portal
  if (portalType === 'admin' && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: "This account is not authorized as a Clinic Administrator." });
  }
  if (portalType === 'nurse' && user.role !== 'NURSE') {
    return res.status(403).json({ success: false, error: "This account is not authorized as a Clinic Nurse." });
  }
  if (portalType === 'patient' && user.role !== 'USER' && user.role !== 'PATIENT') {
    return res.status(403).json({ success: false, error: `This account is registered as ${user.role === 'ADMIN' ? 'Clinic Doctor/Admin' : 'Clinic Nurse'}. Please use the corresponding portal.` });
  }

  // STRICT OTP VERIFICATION FOR ALL ROLES:
  const check = verifyOtp(user.email, cleanOtp);
  if (!check.valid) {
    return res.status(400).json({
      success: false,
      error: check.error
    });
  }

  // Update password
  user.password = newPassword;
  addAuditLog(
    db, 
    user.fullName || user.username, 
    `Password Reset via Verified Email OTP (${user.role})`, 
    `Password successfully updated for account ${user.fullName || user.username} (@${user.username || user.email}) after verifying 6-digit OTP sent to registered email ${user.email}.`
  );
  saveDB(db);

  res.json({
    success: true,
    message: `Password reset successfully for ${user.fullName || user.username}! You can now sign in with your new password.`,
    username: user.username,
    email: user.email
  });
});


// Logout
router.post('/logout', (req, res) => {
  const db = getDB();
  db.activeUser = null;
  saveDB(db);
  res.json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
