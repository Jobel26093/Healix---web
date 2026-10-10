const express = require('express');
const router = express.Router();
const { getDB, saveDB, addAuditLog } = require('../db/store');
const { requireRole } = require('../middleware/roles');

// Helper to recalculate all slot booked counts dynamically:
// - If slot is BLOCKED (isAvailable = false), booked count increases to maxCapacity!
// - If slot is AVAILABLE (isAvailable = true), booked count is tallied from active appointments.
function syncSlotBookedCounts(db) {
  if (!db.clinicTimings) return;

  db.clinicTimings.forEach(slot => {
    if (!slot.isAvailable) {
      // Slot is BLOCKED by Admin -> Booked count increases to maxCapacity!
      slot.booked = slot.maxCapacity || 4;
    } else {
      // Slot is AVAILABLE -> Tally active (non-cancelled) patient appointments
      let count = 0;
      (db.appointments || []).forEach(apt => {
        if (apt.status !== 'Cancelled') {
          const sClean = slot.timeSlot.split('(')[0].trim();
          const aptClean = apt.timeSlot.split('(')[0].trim();
          if (slot.timeSlot === apt.timeSlot || sClean === aptClean || slot.timeSlot.includes(aptClean) || apt.timeSlot.includes(sClean)) {
            count++;
          }
        }
      });
      slot.booked = count;
    }
  });
}

// Get Appointments & Home Visits List
// - ADMIN (doctor): all appointments
// - USER (patient): read-only, own appointments only
// - NURSE: must use /api/nurse/appointments
router.get('/', requireRole('ADMIN', 'USER'), (req, res) => {
  const db = getDB();
  syncSlotBookedCounts(db);
  saveDB(db);

  let result = db.appointments || [];
  const targetPatientId = req.query.patientId || (req.activeUser?.role === 'USER' ? req.activeUser.id : null);

  if (targetPatientId) {
    const patientUser = (db.users || []).find(u => u.id === targetPatientId) || req.activeUser;
    result = result.filter(a => {
      if (a.patientId === targetPatientId) return true;
      if (patientUser) {
        if (a.patientPhone && patientUser.phone && a.patientPhone.replace(/\D/g, '') === patientUser.phone.replace(/\D/g, '')) return true;
        if (a.patientName && patientUser.fullName && a.patientName.toLowerCase().trim() === patientUser.fullName.toLowerCase().trim()) return true;
      }
      return false;
    });
  } else if (req.activeUser?.role === 'USER') {
    result = result.filter(a => 
      a.patientId === req.activeUser.id ||
      (a.patientPhone && req.activeUser.phone && a.patientPhone.replace(/\D/g, '') === req.activeUser.phone.replace(/\D/g, '')) ||
      (a.patientName && req.activeUser.fullName && a.patientName.toLowerCase().trim() === req.activeUser.fullName.toLowerCase().trim())
    );
  }

  res.json({
    success: true,
    appointments: result,
    homeVisitsCount: result.filter(a => a.isHomeVisit).length,
    inClinicCount: result.filter(a => !a.isHomeVisit).length
  });
});

// Book Appointment / Request Home Visit (Requires Patient or Doctor Login)
router.post('/', requireRole('USER', 'ADMIN'), (req, res) => {
  const db = getDB();
  syncSlotBookedCounts(db);

  const { 
    patientId,
    patientName, 
    patientPhone, 
    serviceName, 
    date, 
    timeSlot, 
    visitType, 
    isHomeVisit, 
    homeAddress, 
    landmark, 
    locationUrl,
    notes,
    assignedPhysio
  } = req.body;

  if (!patientName || !date || !timeSlot) {
    return res.status(400).json({ success: false, error: "Patient name, appointment date, and time slot are required." });
  }

  // Resolve best matching patientId
  let finalPatientId = patientId;
  if (!finalPatientId && db.activeUser && db.activeUser.role === 'USER') {
    finalPatientId = db.activeUser.id;
  }
  if (!finalPatientId) {
    const cleanPhone = (patientPhone || '').replace(/\D/g, '');
    const cleanName = (patientName || '').toLowerCase().trim();
    const matchedUser = (db.users || []).find(u => 
      (cleanPhone && u.phone && u.phone.replace(/\D/g, '') === cleanPhone) ||
      (cleanName && u.fullName && u.fullName.toLowerCase().trim() === cleanName)
    );
    if (matchedUser) {
      finalPatientId = matchedUser.id;
    } else {
      finalPatientId = `usr_pat_${Date.now()}`;
    }
  }

  const isHome = isHomeVisit === true || visitType === "Home-Visit";

  if (isHome && (!homeAddress || homeAddress.trim() === "")) {
    return res.status(400).json({ success: false, error: "Complete Home Address is required for Home Visit bookings." });
  }

  // Find matching timing slot
  const slotObj = db.clinicTimings.find(s => {
    const sClean = s.timeSlot.split('(')[0].trim();
    const aptClean = timeSlot.split('(')[0].trim();
    return s.timeSlot === timeSlot || sClean === aptClean || s.timeSlot.includes(aptClean) || timeSlot.includes(sClean);
  });

  if (slotObj && !slotObj.isAvailable) {
    return res.status(400).json({ success: false, error: `The selected time slot '${timeSlot}' is currently BLOCKED by clinic administration.` });
  }

  if (slotObj && slotObj.booked >= slotObj.maxCapacity) {
    return res.status(400).json({ 
      success: false, 
      error: `The time slot '${timeSlot}' has reached maximum patient capacity (${slotObj.booked}/${slotObj.maxCapacity}). Please select a different time slot.` 
    });
  }

  const newAppointment = {
    id: `apt-${Date.now()}`,
    patientId: finalPatientId,
    patientName: patientName,
    patientPhone: patientPhone || (db.activeUser ? db.activeUser.phone : "+91 98765 43210"),
    serviceName: serviceName || "General Physiotherapy Consultation",
    date: date,
    timeSlot: timeSlot,
    visitType: isHome ? "Home-Visit" : "In-Clinic",
    isHomeVisit: isHome,
    homeAddress: isHome ? homeAddress : "",
    landmark: isHome ? (landmark || "") : "",
    locationUrl: isHome ? (locationUrl || req.body.location || "").trim() : "",
    status: isHome ? "Pending Dispatch" : "Confirmed",
    assignedPhysio: assignedPhysio || "Dr. Joel Calvin C",
    notes: notes || "",
    paymentStatus: req.body.paymentStatus || "DUE",
    createdAt: new Date().toISOString().split('T')[0]
  };

  if (req.body.customAmount !== undefined || req.body.amount !== undefined) {
    const feeVal = Number(req.body.customAmount !== undefined ? req.body.customAmount : req.body.amount);
    if (!isNaN(feeVal) && feeVal >= 0) {
      newAppointment.customAmount = feeVal;
      newAppointment.amount = feeVal;
      newAppointment.feeSetBy = req.activeUser ? req.activeUser.fullName : "Dr. Joel Calvin C";
      newAppointment.feeNote = req.body.feeNote ? req.body.feeNote.trim() : "";
      newAppointment.feeUpdatedAt = new Date().toISOString();
    }
  }

  db.appointments.unshift(newAppointment);

  // Recalculate slot booked counts (+1)
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    patientName, 
    isHome ? "Home Visit Requested" : "Clinic Appointment Booked", 
    `Booked ${isHome ? 'Home Visit' : 'In-Clinic'} session for ${patientName} on ${date} (${timeSlot}). Slot booked count updated.`
  );

  saveDB(db);

  res.status(201).json({
    success: true,
    message: isHome ? "Home Visit Physiotherapy request submitted successfully!" : "In-Clinic appointment booked successfully!",
    appointment: newAppointment
  });
});

// Patient or Admin Update / Reschedule Appointment
router.patch('/:id/manage', requireRole('ADMIN', 'USER'), (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const apt = db.appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, error: "Appointment record not found." });
  }

  // Patient ownership validation
  if (req.activeUser.role === 'USER') {
    const isOwner = apt.patientId === req.activeUser.id || 
                    (apt.patientPhone && req.activeUser.phone && apt.patientPhone === req.activeUser.phone) ||
                    (apt.patientName && req.activeUser.fullName && apt.patientName.toLowerCase() === req.activeUser.fullName.toLowerCase());
    if (!isOwner) {
      return res.status(403).json({ success: false, error: "Access denied: You can only manage your own appointments." });
    }
  }

  const { date, timeSlot, homeAddress, landmark, locationUrl, notes, status, serviceName, customAmount, amount, feeNote } = req.body;

  // Validate capacity if rescheduling to another slot
  if (timeSlot && timeSlot !== apt.timeSlot) {
    const newSlot = db.clinicTimings.find(s => {
      const sClean = s.timeSlot.split('(')[0].trim();
      const targetClean = timeSlot.split('(')[0].trim();
      return s.timeSlot === timeSlot || sClean === targetClean || s.timeSlot.includes(targetClean);
    });
    if (newSlot && !newSlot.isAvailable) {
      return res.status(400).json({ success: false, error: `The selected time slot '${timeSlot}' is currently BLOCKED by clinic administration.` });
    }
    if (newSlot && newSlot.booked >= newSlot.maxCapacity) {
      return res.status(400).json({ success: false, error: `The selected time slot '${timeSlot}' is currently full.` });
    }
    apt.timeSlot = timeSlot;
  }

  if (date) apt.date = date;
  if (serviceName) apt.serviceName = serviceName;
  if (homeAddress !== undefined) apt.homeAddress = homeAddress;
  if (landmark !== undefined) apt.landmark = landmark;
  if (locationUrl !== undefined) apt.locationUrl = locationUrl;
  if (notes !== undefined) apt.notes = notes;
  if (req.body.paymentStatus && req.activeUser.role === 'ADMIN') {
    apt.paymentStatus = req.body.paymentStatus;
  }
  if (status && (status === 'Cancelled' || req.activeUser.role === 'ADMIN')) {
    apt.status = status;
  }

  // Doctor can set custom fee in manage route as well
  if (req.activeUser.role === 'ADMIN' && (customAmount !== undefined || amount !== undefined)) {
    const val = customAmount !== undefined ? customAmount : amount;
    if (!isNaN(Number(val)) && Number(val) >= 0) {
      apt.customAmount = Number(val);
      apt.amount = Number(val);
      apt.feeSetBy = req.activeUser.fullName || "Dr. Joel Calvin C";
      if (feeNote !== undefined) apt.feeNote = feeNote;
      apt.feeUpdatedAt = new Date().toISOString();
    }
  }

  // Recalculate slot booked counts
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    req.activeUser.fullName, 
    "Appointment Managed / Rescheduled", 
    `Appointment #${id} updated by ${req.activeUser.fullName}. Date: ${apt.date}, Slot: ${apt.timeSlot}, Status: ${apt.status}.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: "Appointment details updated successfully!",
    appointment: apt
  });
});

// Doctor / Admin: Set individual custom fee for a specific patient session
router.patch('/:id/amount', requireRole('ADMIN'), (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { amount, customAmount, feeNote, resetToDefault } = req.body;

  const apt = (db.appointments || []).find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, error: "Appointment record not found." });
  }

  if (resetToDefault) {
    delete apt.customAmount;
    delete apt.amount;
    delete apt.feeNote;
    delete apt.feeSetBy;
    delete apt.feeUpdatedAt;
    apt.paymentStatus = 'DUE';

    addAuditLog(
      db, 
      req.activeUser ? req.activeUser.fullName : "Doctor/Admin", 
      "Fee Reset to Post-Treatment Setting", 
      `Doctor reset session fee for ${apt.patientName} (Appointment #${id}) to be evaluated after treatment.`
    );

    saveDB(db);

    return res.json({
      success: true,
      message: `Fee for ${apt.patientName} reset to post-treatment evaluation.`,
      appointment: apt
    });
  }

  const targetAmount = amount !== undefined ? amount : customAmount;
  if (targetAmount === undefined || targetAmount === null || isNaN(Number(targetAmount)) || Number(targetAmount) < 0) {
    return res.status(400).json({ success: false, error: "Please enter a valid individual fee amount in ₹ INR (>= 0)." });
  }

  const prevFee = apt.customAmount !== undefined ? `₹${apt.customAmount}` : 'Default Schedule';
  const newFee = Number(targetAmount);
  apt.customAmount = newFee;
  apt.amount = newFee;
  apt.feeSetBy = req.activeUser ? req.activeUser.fullName : "Dr. Joel Calvin C";
  apt.feeNote = feeNote ? feeNote.trim() : "";
  apt.feeUpdatedAt = new Date().toISOString();
  if (req.body.paymentStatus) {
    apt.paymentStatus = req.body.paymentStatus;
  }

  addAuditLog(
    db, 
    req.activeUser ? req.activeUser.fullName : "Doctor/Admin", 
    "Individual Patient Fee Configured", 
    `Doctor set session fee for ${apt.patientName} (Appointment #${id}) from ${prevFee} to ₹${newFee}${feeNote ? ` (Note: ${feeNote})` : ''}.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: `Individual fee for ${apt.patientName} successfully set to ₹${newFee.toLocaleString()}.`,
    appointment: apt
  });
});

// Patient or Admin Cancel Appointment
router.post('/:id/cancel', requireRole('ADMIN', 'USER'), (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const apt = db.appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, error: "Appointment record not found." });
  }

  if (req.activeUser.role === 'USER') {
    const isOwner = apt.patientId === req.activeUser.id || 
                    (apt.patientPhone && req.activeUser.phone && apt.patientPhone === req.activeUser.phone) ||
                    (apt.patientName && req.activeUser.fullName && apt.patientName.toLowerCase() === req.activeUser.fullName.toLowerCase());
    if (!isOwner) {
      return res.status(403).json({ success: false, error: "Access denied: You can only cancel your own appointments." });
    }
  }

  const oldStatus = apt.status;
  apt.status = 'Cancelled';

  // Recalculate slot booked counts (freed up!)
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    req.activeUser.fullName, 
    "Appointment Cancelled", 
    `Appointment #${id} for ${apt.patientName} (${apt.date} ${apt.timeSlot}) was cancelled by ${req.activeUser.fullName}.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: "Your appointment has been cancelled. The time slot has been freed up.",
    appointment: apt
  });
});

// Update Appointment Status / Assign Physio (Doctor only)
router.patch('/:id/status', requireRole('ADMIN'), (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { status, assignedPhysio, notes } = req.body;

  const apt = db.appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, error: "Appointment record not found." });
  }

  const oldStatus = apt.status;
  if (status) apt.status = status;
  if (assignedPhysio) apt.assignedPhysio = assignedPhysio;
  if (notes) apt.notes = notes;

  // Recalculate slot booked counts
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Appointment Status Modified", 
    `Updated appointment #${id} status from '${oldStatus}' to '${apt.status}'. Slot booked count adjusted.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: `Appointment status updated to ${apt.status}.`,
    appointment: apt
  });
});

// Cancel / Delete Appointment
router.delete('/:id', requireRole('ADMIN', 'USER'), (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Appointment not found." });
  }

  const target = db.appointments[idx];
  if (req.activeUser.role === 'USER') {
    const isOwner = target.patientId === req.activeUser.id || 
                    (target.patientPhone && req.activeUser.phone && target.patientPhone === req.activeUser.phone);
    if (!isOwner) {
      return res.status(403).json({ success: false, error: "Access denied: You can only delete your own appointments." });
    }
  }

  const removed = db.appointments.splice(idx, 1)[0];

  // Recalculate slot booked counts
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Appointment Cancelled & Deleted", 
    `Cancelled appointment for ${removed.patientName} (${removed.timeSlot}). Slot booked count decremented.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: `Appointment for ${removed.patientName} cancelled & removed. Slot booked count updated.`
  });
});

module.exports = router;
