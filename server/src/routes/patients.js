const express = require('express');
const router = express.Router();
const { getDB, saveDB, addAuditLog } = require('../db/store');
const { requireRole } = require('../middleware/roles');

// Patient records & login credentials are managed by the doctor (ADMIN) only
router.use(requireRole('ADMIN'));

// Get Patients List (Admin)
router.get('/', (req, res) => {
  const db = getDB();
  const patientUsers = db.users.filter(u => u.role === "USER");
  res.json({
    success: true,
    patients: patientUsers
  });
});

// Add New Patient Account & Login (Admin)
router.post('/', (req, res) => {
  const db = getDB();
  const { fullName, email, password, phone, age, gender, address, medicalCondition } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, error: "Full name and email are required." });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, error: "An account with this email address already exists." });
  }

  const newPatient = {
    id: `usr_pat_${Date.now()}`,
    email: email.toLowerCase().trim(),
    password: password || "userpassword123",
    fullName: fullName,
    phone: phone || "+91 98765 43210",
    role: "USER",
    age: parseInt(age) || 30,
    gender: gender || "Other",
    address: address || "N/A",
    medicalCondition: medicalCondition || "General Physiotherapy & Rehabilitation",
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.users.push(newPatient);

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Patient Login Account Created", 
    `Created patient profile & login credentials for ${fullName} (${email}).`
  );

  saveDB(db);

  res.status(201).json({
    success: true,
    message: `Patient account for ${fullName} created successfully.`,
    patient: newPatient
  });
});

// Edit Patient Account & Login Credentials (Admin)
router.put('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { fullName, email, password, phone, age, gender, address, medicalCondition } = req.body;

  const patient = db.users.find(u => u.id === id);
  if (!patient) {
    return res.status(404).json({ success: false, error: "Patient record not found." });
  }

  if (fullName) patient.fullName = fullName;
  if (email) patient.email = email.toLowerCase().trim();
  if (password) patient.password = password;
  if (phone) patient.phone = phone;
  if (age) patient.age = parseInt(age);
  if (gender) patient.gender = gender;
  if (address) patient.address = address;
  if (medicalCondition) patient.medicalCondition = medicalCondition;

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Patient Login Account Modified", 
    `Updated patient profile & login credentials for ${patient.fullName}.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: `Patient profile for ${patient.fullName} updated.`,
    patient: patient
  });
});

// Delete Patient Account & Login (Admin)
router.delete('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Patient not found." });
  }

  const removed = db.users.splice(idx, 1)[0];

  // Also clear any appointments for this patient
  db.appointments = db.appointments.filter(a => a.patientId !== id);

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Patient Account Removed", 
    `Removed patient login account & profile for ${removed.fullName}.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: `Patient login account for ${removed.fullName} removed from database.`
  });
});

module.exports = router;
