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

// Get Clinic Timings & Schedule Slots (Syncs Booked Count Live)
router.get('/', (req, res) => {
  const db = getDB();
  syncSlotBookedCounts(db);
  saveDB(db);

  res.json({
    success: true,
    timings: db.clinicTimings,
    services: db.services
  });
});

// Add New Timing Slot (Admin)
router.post('/', requireRole('ADMIN'), (req, res) => {
  const db = getDB();
  const { day, timeSlot, maxCapacity, isHomeVisitSlot } = req.body;

  if (!timeSlot) {
    return res.status(400).json({ success: false, error: "Time slot label is required." });
  }

  const newSlot = {
    id: `slot-${Date.now()}`,
    day: day || "Monday - Saturday",
    timeSlot: isHomeVisitSlot ? `${timeSlot} (Home Visit)` : timeSlot,
    maxCapacity: parseInt(maxCapacity) || 4,
    booked: 0,
    isAvailable: true
  };

  db.clinicTimings.push(newSlot);
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Timing Slot Added", 
    `Added clinic schedule slot '${newSlot.timeSlot}'.`
  );

  saveDB(db);

  res.status(201).json({
    success: true,
    message: "Clinic timing slot added successfully.",
    slot: newSlot
  });
});

// Toggle Availability of Slot (Admin: Block Slot increases count to max, Unblock decreases to active bookings)
router.patch('/:id/toggle', requireRole('ADMIN'), (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const slot = db.clinicTimings.find(s => s.id === id);
  if (!slot) {
    return res.status(404).json({ success: false, error: "Timing slot not found." });
  }

  slot.isAvailable = !slot.isAvailable;

  // Immediately recalculate slot counts (if blocked => increases to max, if unblocked => decreases)
  syncSlotBookedCounts(db);

  addAuditLog(
    db, 
    db.activeUser ? db.activeUser.fullName : "Admin", 
    "Timing Slot Availability Toggled", 
    `Set slot '${slot.timeSlot}' availability to ${slot.isAvailable}. Booked count set to ${slot.booked}.`
  );

  saveDB(db);

  res.json({
    success: true,
    message: `Slot '${slot.timeSlot}' is now ${slot.isAvailable ? 'Available' : 'Blocked'}. Booked count updated to ${slot.booked}.`,
    slot: slot
  });
});

module.exports = router;
