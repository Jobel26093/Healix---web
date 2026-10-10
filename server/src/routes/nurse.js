const express = require('express');
const router = express.Router();
const { getDB, saveDB, addAuditLog } = require('../db/store');

// Statuses a nurse may set (nurses cannot cancel or delete bookings)
const NURSE_ALLOWED_STATUSES = ["Confirmed", "Pending Dispatch", "Completed"];

// Public endpoint: Fetch active clinic nurses added by the doctor (for homepage team display)
router.get('/public-roster', (req, res) => {
  const db = getDB();
  const activeNurses = (db.users || [])
    .filter(u => u.role === "NURSE" && u.status !== "Resigned" && u.status !== "Inactive")
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      shift: u.shift || "General Clinical Duty",
      phone: u.phone || "",
      status: u.status || "Active"
    }));
  res.json({ success: true, nurses: activeNurses });
});

// Only a logged-in nurse may use these endpoints
function requireNurse(req, res, next) {
  const db = getDB();
  const active = db.activeUser;
  if (!active || active.role !== "NURSE") {
    return res.status(403).json({ success: false, error: "Nurse authorization required." });
  }
  const nurse = db.users.find(u => u.id === active.id);
  if (!nurse) {
    return res.status(403).json({ success: false, error: "Nurse account not found." });
  }
  req.db = db;
  req.nurse = nurse;
  next();
}

router.use(requireNurse);

// Appointments & home visits list for Nurse Station (take care of all clinic appointments)
router.get('/appointments', (req, res) => {
  const { db, nurse } = req;
  const appointments = db.appointments || [];
  res.json({
    success: true,
    nurseName: nurse.fullName,
    supervisingDoctor: nurse.supervisingDoctor || "Dr. Joel Calvin C",
    appointments,
    homeVisitsCount: appointments.filter(a => a.isHomeVisit).length,
    inClinicCount: appointments.filter(a => !a.isHomeVisit).length
  });
});

// Limited patient info (no email / password) for nurse care management
router.get('/patients', (req, res) => {
  const { db, nurse } = req;
  const patients = (db.users || [])
    .filter(u => u.role === "USER")
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      age: u.age,
      gender: u.gender,
      address: u.address,
      medicalCondition: u.medicalCondition
    }));
  res.json({ 
    success: true, 
    nurseName: nurse.fullName, 
    supervisingDoctor: nurse.supervisingDoctor || "Dr. Joel Calvin C", 
    patients 
  });
});

// Update status / add nursing notes on appointments (Nurse can edit, cannot delete)
router.patch('/appointments/:id', (req, res) => {
  const { db, nurse } = req;
  const apt = (db.appointments || []).find(a => a.id === req.params.id);

  if (!apt) {
    return res.status(404).json({ success: false, error: "Appointment record not found." });
  }

  const { status, nurseNotes } = req.body;

  if (status !== undefined) {
    if (!NURSE_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({ success: false, error: `Nurses can only set status to: ${NURSE_ALLOWED_STATUSES.join(', ')}.` });
    }
    apt.status = status;
  }
  if (nurseNotes !== undefined) apt.nurseNotes = String(nurseNotes);

  addAuditLog(db, nurse.fullName, "Nurse Updated Appointment", `Nurse updated appointment #${apt.id} for ${apt.patientName} (status: ${apt.status}).`);
  saveDB(db);

  res.json({ success: true, message: "Appointment updated.", appointment: apt });
});

module.exports = router;
