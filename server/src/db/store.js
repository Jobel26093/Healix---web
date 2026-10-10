const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Admin emails allowed ONLY for Admin Portal access (Doctor)
const AUTHORIZED_ADMIN_EMAILS = [
  "calvinjoelc@gmail.com"
];

// Admin usernames allowed for Admin Portal access
const AUTHORIZED_ADMIN_USERNAMES = [
  "drcalvin",
  "calvinjoelc",
  "admin",
  "drjoel"
];

// Initial Physiotherapy Clinic Database Schema (Amounts in Indian Rupees - ₹ INR)
const initialData = {
  activeUser: null, // Current active session
  users: [
    {
      id: "usr_admin_1",
      email: "calvinjoelc@gmail.com",
      username: "drcalvin",
      password: "adminpassword123",
      fullName: "Dr. Joel Calvin C (Lead Physio)",
      phone: "+91 73053 94549",
      role: "ADMIN",
      createdAt: "2026-10-01"
    },
    {
      id: "usr_pat_1",
      email: "john.doe@example.com",
      username: "johndoe",
      password: "userpassword123",
      fullName: "John Doe",
      phone: "+91 98765 43210",
      role: "USER",
      age: 34,
      gender: "Male",
      address: "742 Anna Salai, T. Nagar, Chennai, Tamil Nadu",
      medicalCondition: "Post-ACL Surgery Rehabilitation & Lower Back Stiffness",
      createdAt: "2026-10-02"
    },
    {
      id: "usr_pat_2",
      email: "sarah.smith@example.com",
      username: "sarahsmith",
      password: "userpassword123",
      fullName: "Sarah Smith",
      phone: "+91 91234 56789",
      role: "USER",
      age: 29,
      gender: "Female",
      address: "12 Mahatma Gandhi Road, Koramangala, Bengaluru, Karnataka",
      medicalCondition: "Cervical Spondylosis & Shoulder Impingement",
      createdAt: "2026-10-02"
    }
  ],

  // Clinic Operating Hours & Available Time Slots Management
  clinicTimings: [
    { id: "slot-1", day: "Monday - Saturday", timeSlot: "09:00 AM - 10:00 AM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-2", day: "Monday - Saturday", timeSlot: "10:00 AM - 11:00 AM", maxCapacity: 4, booked: 2, isAvailable: true },
    { id: "slot-3", day: "Monday - Saturday", timeSlot: "11:00 AM - 12:00 PM", maxCapacity: 4, booked: 0, isAvailable: true },
    { id: "slot-4", day: "Monday - Saturday", timeSlot: "02:00 PM - 03:00 PM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-5", day: "Monday - Saturday", timeSlot: "03:00 PM - 04:00 PM", maxCapacity: 4, booked: 0, isAvailable: true },
    { id: "slot-6", day: "Monday - Saturday", timeSlot: "04:00 PM - 05:00 PM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-7", day: "Monday - Saturday", timeSlot: "05:00 PM - 06:00 PM (Evening Home Visits)", maxCapacity: 3, booked: 1, isAvailable: true },
    { id: "slot-8", day: "Monday - Saturday", timeSlot: "06:00 PM - 07:00 PM (Evening Home Visits)", maxCapacity: 3, booked: 0, isAvailable: true }
  ],

  // Clinic Services Offered (Prices in ₹ INR)
  services: [
    { id: "srv-1", name: "Sports Injury Rehabilitation", duration: "45 Mins", price: 800, icon: "Activity" },
    { id: "srv-2", name: "Orthopedic Physiotherapy", duration: "60 Mins", price: 1000, icon: "Bone" },
    { id: "srv-3", name: "Neurological Rehabilitation", duration: "60 Mins", price: 1200, icon: "Brain" },
    { id: "srv-4", name: "Post-Surgical Joint Mobilization", duration: "45 Mins", price: 900, icon: "Stethoscope" },
    { id: "srv-5", name: "Personalized Home Visit Physiotherapy", duration: "60 Mins", price: 1500, icon: "Home" }
  ],

  // Patient Appointments & Home Visit Records
  appointments: [
    {
      id: "apt-1001",
      patientId: "usr_pat_1",
      patientName: "John Doe",
      patientPhone: "+91 98765 43210",
      serviceName: "Post-Surgical Joint Mobilization",
      date: "2026-10-05",
      timeSlot: "10:00 AM - 11:00 AM",
      visitType: "In-Clinic",
      isHomeVisit: false,
      homeAddress: "",
      landmark: "",
      status: "Confirmed",
      assignedPhysio: "Dr. Joel Calvin C",
      notes: "Post ACL reconstruction week 4 mobilization exercises.",
      createdAt: "2026-10-02"
    },
    {
      id: "apt-1002",
      patientId: "usr_pat_2",
      patientName: "Sarah Smith",
      patientPhone: "+91 91234 56789",
      serviceName: "Personalized Home Visit Physiotherapy",
      date: "2026-10-06",
      timeSlot: "05:00 PM - 06:00 PM (Evening Home Visits)",
      visitType: "Home-Visit",
      isHomeVisit: true,
      homeAddress: "12 Mahatma Gandhi Road, Koramangala, Bengaluru",
      landmark: "Near Forum Mall Metro Station",
      status: "Confirmed",
      assignedPhysio: "Dr. Joel Calvin C",
      notes: "Severe cervical radiculopathy. Bedside neck traction and ultrasound therapy required.",
      createdAt: "2026-10-02"
    }
  ],

  auditLogs: [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      user: "System",
      action: "Database Initialized (INR)",
      details: "PhysioFlex Care Clinic database initialized with amounts in Indian Rupees (₹ INR)."
    }
  ]
};

// Migration helper to ensure accounts consistency (Doctor manages nurse staff)
function ensureNurse(data) {
  if (!Array.isArray(data.users)) return false;
  let changed = false;

  // Remove any legacy hardcoded placeholder nurse accounts so doctor has full control
  const beforeLen = data.users.length;
  data.users = data.users.filter(u => u.id !== "usr_nurse_1" && u.email !== "anitha.nurse@example.com");
  if (data.users.length !== beforeLen) changed = true;

  // Ensure nurses added by doctor have active status and supervising doctor assigned
  data.users.forEach(u => {
    if (u.role === "NURSE") {
      if (!u.status) { u.status = "Active"; changed = true; }
      if (!u.supervisingDoctor) { u.supervisingDoctor = "Dr. Joel Calvin C"; changed = true; }
      if (!u.shift) { u.shift = "Full-Time Clinical Duty"; changed = true; }
    }
  });

  // Ensure only authorized doctors are ADMIN
  data.users.forEach(u => {
    if (u.role === "ADMIN" && !AUTHORIZED_ADMIN_EMAILS.includes(u.email.toLowerCase().trim())) {
      u.role = "NURSE";
      changed = true;
    }
    // Ensure every user has a username
    if (!u.username && u.email) {
      if (u.email.toLowerCase() === "calvinjoelc@gmail.com") {
        u.username = "drcalvin";
      } else {
        u.username = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
      changed = true;
    }
  });

  return changed;
}

function getDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    let raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    const data = JSON.parse(raw);
    if (ensureNurse(data)) saveDB(data);
    return data;
  } catch (err) {
    console.error("Error reading data.json, returning initial state:", err);
    return initialData;
  }
}

function saveDB(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing data.json:", err);
  }
}

function addAuditLog(data, user, action, details) {
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || "System",
    action: action,
    details: details
  };
  if (!data.auditLogs) data.auditLogs = [];
  data.auditLogs.unshift(newLog);
  if (data.auditLogs.length > 100) data.auditLogs = data.auditLogs.slice(0, 100);
}

module.exports = {
  AUTHORIZED_ADMIN_EMAILS,
  AUTHORIZED_ADMIN_USERNAMES,
  getDB,
  saveDB,
  addAuditLog
};
