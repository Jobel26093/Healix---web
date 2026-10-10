// Mock API & Fallback Service Layer for Standalone Demo Deployment (GitHub Pages)
// When running locally with Express backend, requests go through to the real API.
// If the backend is unreachable or hosted on static servers (e.g. GitHub Pages),
// this interceptor automatically handles REST calls with an in-memory & localStorage clinical state.

const STORAGE_KEY = 'healix_clinical_db_v2';
const ACTIVE_USER_KEY = 'healix_active_user_v2';

const INITIAL_DB = {
  users: [
    {
      id: "usr_admin_1",
      email: "calvinjoelc@gmail.com",
      username: "drcalvin",
      password: "1234",
      fullName: "Dr. Joel Calvin C (Lead Physio)",
      phone: "+91 73053 94549",
      role: "ADMIN",
      createdAt: "2026-10-01"
    },
    {
      id: "usr_pat_1",
      email: "john.doe@example.com",
      username: "johndoe",
      password: "1234",
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
      id: "usr_pat_1791298880726",
      email: "jobelcrefloc@gmail.com",
      username: "jobelcrefloc",
      password: "1234",
      fullName: "Jobel Creflo",
      phone: "+918122555002",
      role: "USER",
      age: 20,
      gender: "Male",
      address: "91, Eden Garden, Sudhanantha Barathi Street, Ganapathipuram, East Tambaram, Chennai -600059",
      medicalCondition: "Knee ligament recovery",
      createdAt: "2026-10-06"
    },
    {
      id: "usr_pat_2",
      email: "sarah.smith@example.com",
      username: "sarahsmith",
      password: "1234",
      fullName: "Sarah Smith",
      phone: "+91 91234 56789",
      role: "USER",
      age: 29,
      gender: "Female",
      address: "12 Mahatma Gandhi Road, Chennai, Tamil Nadu",
      medicalCondition: "Cervical Spondylosis & Shoulder Impingement",
      createdAt: "2026-10-02"
    },
    {
      id: "NURSE_1791474439287",
      fullName: "Pauline .T",
      email: "paulinecharles11995@gmail.com",
      username: "paulinecharles11995",
      password: "1234",
      role: "NURSE",
      phone: "+91 9171022305",
      shift: "Morning (08:00 AM - 02:00 PM)",
      status: "Active",
      supervisingDoctor: "Dr. Calvin Joel (Chief Physiotherapist)",
      createdAt: "2026-10-08T15:47:19.287Z",
      notes: "Certified Junior Physiotherapist on morning rehabilitation duty."
    }
  ],
  clinicTimings: [
    { id: "slot-1", day: "Monday - Saturday", timeSlot: "09:00 AM - 10:00 AM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-2", day: "Monday - Saturday", timeSlot: "10:00 AM - 11:00 AM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-3", day: "Monday - Saturday", timeSlot: "11:00 AM - 12:00 PM", maxCapacity: 4, booked: 0, isAvailable: true },
    { id: "slot-4", day: "Monday - Saturday", timeSlot: "02:00 PM - 03:00 PM", maxCapacity: 4, booked: 0, isAvailable: true },
    { id: "slot-5", day: "Monday - Saturday", timeSlot: "03:00 PM - 04:00 PM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-6", day: "Monday - Saturday", timeSlot: "04:00 PM - 05:00 PM", maxCapacity: 4, booked: 1, isAvailable: true },
    { id: "slot-7", day: "Monday - Saturday", timeSlot: "05:00 PM - 06:00 PM (Evening Home Visits)", maxCapacity: 2, booked: 1, isAvailable: true },
    { id: "slot-8", day: "Monday - Saturday", timeSlot: "06:00 PM - 07:00 PM (Evening Home Visits)", maxCapacity: 2, booked: 0, isAvailable: true }
  ],
  appointments: [
    {
      id: "apt-demo-1",
      patientId: "usr_pat_1791298880726",
      patientName: "Jobel Creflo",
      patientPhone: "+918122555002",
      serviceName: "Personalized Home Visit Physiotherapy",
      date: "2026-10-12",
      timeSlot: "05:00 PM - 06:00 PM (Evening Home Visits)",
      visitType: "Home-Visit",
      isHomeVisit: true,
      homeAddress: "91, Eden Garden, Sudhanantha Barathi Street, East Tambaram, Chennai -600059",
      landmark: "Near Ganapathipuram Water Tank",
      locationUrl: "https://www.google.com/maps?q=12.920099,80.112018",
      status: "Confirmed",
      assignedPhysio: "Dr. Joel Calvin C",
      notes: "Knee stability and resistance band rehab prescribed",
      paymentStatus: "PAID",
      amount: 1500,
      customAmount: 1500,
      paymentId: "pay-1791470816520",
      paymentTxnId: "TXN-HLX-198233",
      paidAt: "2026-10-08T14:46:56.520Z",
      paymentMethod: "Google Pay (UPI)",
      securitySignature: "HLX-SHA256-731B9F083F41EFAA"
    },
    {
      id: "apt-demo-2",
      patientId: "usr_pat_1",
      patientName: "John Doe",
      patientPhone: "+91 98765 43210",
      serviceName: "Post-Surgical Joint Mobilization",
      date: "2026-10-11",
      timeSlot: "10:00 AM - 11:00 AM",
      visitType: "In-Clinic",
      isHomeVisit: false,
      status: "In-Session",
      assignedPhysio: "Dr. Joel Calvin C (Lead Physio)",
      notes: "Goniometer measurement: knee flexion 115 degrees",
      paymentStatus: "PAID",
      amount: 900,
      customAmount: 900,
      paymentId: "pay-1791470703641",
      paymentTxnId: "TXN-HLX-690472",
      paidAt: "2026-10-08T14:45:03.641Z",
      paymentMethod: "Cash at Clinic Reception",
      securitySignature: "HLX-SHA256-D7C85A7CBC73DEE4"
    },
    {
      id: "apt-demo-3",
      patientId: "usr_pat_2",
      patientName: "Sarah Smith",
      patientPhone: "+91 91234 56789",
      serviceName: "Orthopedic Physiotherapy",
      date: "2026-10-11",
      timeSlot: "04:00 PM - 05:00 PM",
      visitType: "In-Clinic",
      isHomeVisit: false,
      status: "Confirmed",
      assignedPhysio: "Dr. Joel Calvin C (Lead Physio)",
      notes: "Cervical traction and shoulder rotation therapy",
      paymentStatus: "DUE",
      amount: 1000,
      customAmount: 1000
    }
  ],
  payments: [
    {
      id: "pay-1791470816520",
      txnId: "TXN-HLX-198233",
      invoiceNo: "INV-2026-3677",
      appointmentId: "apt-demo-1",
      patientId: "usr_pat_1791298880726",
      patientName: "Jobel Creflo",
      patientPhone: "+918122555002",
      serviceName: "Personalized Home Visit Physiotherapy",
      amount: 1500,
      currency: "INR",
      paymentMethod: "UPI_GPAY",
      methodLabel: "Google Pay (UPI)",
      collectedBy: "Dr. Joel Calvin C (Lead Physio)",
      notes: "Settled home consultation fee for Jobel Creflo",
      securitySignature: "HLX-SHA256-731B9F083F41EFAA",
      verificationHash: "731b9f083f41efaa7678e8b3825b9b46fae0738bb32032b11f283d5f1139a3a0",
      complianceBadge: "In-Clinic Official Settlement · GST Compliant · Verified",
      status: "COMPLETED",
      paidAt: "2026-10-08T14:46:56.520Z",
      timestamp: "8/10/2026, 8:16:56 pm",
      isHomeVisit: true,
      date: "2026-10-12",
      timeSlot: "05:00 PM - 06:00 PM (Evening Home Visits)"
    },
    {
      id: "pay-1791470703641",
      txnId: "TXN-HLX-690472",
      invoiceNo: "INV-2026-5615",
      appointmentId: "apt-demo-2",
      patientId: "usr_pat_1",
      patientName: "John Doe",
      patientPhone: "+91 98765 43210",
      serviceName: "Post-Surgical Joint Mobilization",
      amount: 900,
      currency: "INR",
      paymentMethod: "CLINIC_CASH",
      methodLabel: "Cash at Clinic Reception",
      collectedBy: "Dr. Joel Calvin C (Lead Physio)",
      notes: "Settled consultation fee for John Doe",
      securitySignature: "HLX-SHA256-D7C85A7CBC73DEE4",
      verificationHash: "d7c85a7cbc73dee40f0fc272c5d130c927ec91692fd51d22d144af667cc63673",
      complianceBadge: "In-Clinic Official Settlement · GST Compliant · Verified",
      status: "COMPLETED",
      paidAt: "2026-10-08T14:45:03.641Z",
      timestamp: "8/10/2026, 8:15:03 pm",
      isHomeVisit: false,
      date: "2026-10-11",
      timeSlot: "10:00 AM - 11:00 AM"
    }
  ]
};

function getLocalDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read local mock DB:", e);
  }
  saveLocalDB(INITIAL_DB);
  return INITIAL_DB;
}

function saveLocalDB(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not persist local mock DB:", e);
  }
}

function getActiveUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read mock active user:", e);
  }
  return null;
}

function setActiveUser(user) {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (e) {
    console.warn("Could not update mock active user:", e);
  }
}

function mockResponse(data, status = 200) {
  const json = JSON.stringify(data);
  return new Response(json, {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleMockApiRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const parsedUrl = new URL(url, window.location.origin);
  const pathname = parsedUrl.pathname.replace(/^\/Healix---Website/, '');
  const searchParams = parsedUrl.searchParams;

  let body = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  const db = getLocalDB();

  // 1. AUTH ROUTES
  if (pathname === '/api/auth/me') {
    const active = getActiveUser();
    return mockResponse({ success: true, user: active });
  }

  if (pathname === '/api/auth/user-login') {
    const identifier = (body.usernameOrEmail || '').toLowerCase().trim();
    const user = db.users.find(u => 
      u.role === 'USER' && (
        (u.email && u.email.toLowerCase() === identifier) ||
        (u.username && u.username.toLowerCase() === identifier)
      )
    );
    if (!user || (body.password !== user.password && body.password !== '1234' && body.password !== 'HealthyPatient2026')) {
      return mockResponse({ success: false, error: 'Invalid patient username/email or password (Demo: 1234)' }, 401);
    }
    setActiveUser(user);
    return mockResponse({ success: true, user });
  }

  if (pathname === '/api/auth/admin-login') {
    const identifier = (body.usernameOrEmail || '').toLowerCase().trim();
    const admin = db.users.find(u => u.role === 'ADMIN');
    if ((identifier === 'drcalvin' || identifier === admin.email.toLowerCase()) && 
        (body.password === admin.password || body.password === '1234' || body.password === 'adminpassword123')) {
      setActiveUser(admin);
      return mockResponse({ success: true, user: admin });
    }
    return mockResponse({ success: false, error: 'Invalid Doctor / Admin credentials (Demo: drcalvin / 1234)' }, 401);
  }

  if (pathname === '/api/auth/nurse-login') {
    const identifier = (body.usernameOrEmail || '').toLowerCase().trim();
    const nurse = db.users.find(u => 
      u.role === 'NURSE' && (
        identifier === 'nurse' || 
        identifier === 'duty_nurse' ||
        (u.email && u.email.toLowerCase() === identifier) ||
        (u.username && u.username.toLowerCase() === identifier)
      )
    );
    if (!nurse || (body.password !== nurse.password && body.password !== '1234')) {
      return mockResponse({ success: false, error: 'Invalid Junior Physiotherapist credentials (Demo: paulinecharles11995 / 1234)' }, 401);
    }
    setActiveUser(nurse);
    return mockResponse({ success: true, user: nurse });
  }

  if (pathname === '/api/auth/logout') {
    setActiveUser(null);
    return mockResponse({ success: true });
  }

  if (pathname === '/api/auth/send-otp') {
    return mockResponse({ success: true, message: 'OTP sent successfully! Demo OTP code: 123456' });
  }

  if (pathname === '/api/auth/register') {
    const newPatient = {
      id: `usr_pat_${Date.now()}`,
      fullName: body.fullName || 'Demo Patient',
      email: body.email,
      username: body.username || (body.email ? body.email.split('@')[0] : 'patient'),
      phone: body.phone,
      password: body.password || '1234',
      age: body.age || 30,
      gender: body.gender || 'Other',
      address: body.address || 'Chennai',
      medicalCondition: body.medicalCondition || 'General Rehabilitation',
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    db.users.push(newPatient);
    saveLocalDB(db);
    setActiveUser(newPatient);
    return mockResponse({ success: true, user: newPatient });
  }

  if (pathname === '/api/auth/reset-password' || pathname === '/api/auth/update-admin-password') {
    return mockResponse({ success: true, message: 'Password updated successfully' });
  }

  // 2. TIMINGS ROUTES
  if (pathname === '/api/timings') {
    if (method === 'GET') {
      return mockResponse(db.clinicTimings);
    }
    if (method === 'POST') {
      const newSlot = {
        id: `slot-${Date.now()}`,
        day: body.day || "Monday - Saturday",
        timeSlot: body.timeSlot,
        maxCapacity: Number(body.maxCapacity) || 4,
        booked: 0,
        isAvailable: true
      };
      db.clinicTimings.push(newSlot);
      saveLocalDB(db);
      return mockResponse({ success: true, timings: db.clinicTimings });
    }
  }

  if (pathname.match(/^\/api\/timings\/([^/]+)\/toggle$/)) {
    const slotId = pathname.split('/')[3];
    const slot = db.clinicTimings.find(s => s.id === slotId);
    if (slot) {
      slot.isAvailable = !slot.isAvailable;
      saveLocalDB(db);
      return mockResponse({ success: true, timing: slot, timings: db.clinicTimings });
    }
    return mockResponse({ success: false, error: 'Slot not found' }, 404);
  }

  // 3. APPOINTMENTS ROUTES
  if (pathname === '/api/appointments') {
    if (method === 'GET') {
      const patientId = searchParams.get('patientId');
      if (patientId) {
        return mockResponse(db.appointments.filter(a => a.patientId === patientId));
      }
      return mockResponse(db.appointments);
    }
    if (method === 'POST') {
      const newApt = {
        id: `apt-${Date.now()}`,
        patientId: body.patientId,
        patientName: body.patientName || 'Registered Patient',
        patientPhone: body.patientPhone || '+91 73053 94549',
        serviceName: body.serviceName || 'General Physiotherapy',
        date: body.date,
        timeSlot: body.timeSlot,
        visitType: body.isHomeVisit ? 'Home-Visit' : 'In-Clinic',
        isHomeVisit: Boolean(body.isHomeVisit),
        homeAddress: body.homeAddress || '',
        landmark: body.landmark || '',
        locationUrl: body.locationUrl || '',
        status: body.isHomeVisit ? 'Pending Dispatch' : 'Confirmed',
        assignedPhysio: 'Dr. Joel Calvin C (Lead Physio)',
        notes: body.notes || '',
        paymentStatus: 'DUE',
        amount: body.isHomeVisit ? 1500 : 800,
        customAmount: body.isHomeVisit ? 1500 : 800,
        createdAt: new Date().toISOString()
      };
      db.appointments.unshift(newApt);
      // update booked count
      const slot = db.clinicTimings.find(s => s.timeSlot === body.timeSlot);
      if (slot) slot.booked = (slot.booked || 0) + 1;
      saveLocalDB(db);
      return mockResponse({ success: true, appointment: newApt });
    }
  }

  if (pathname.match(/^\/api\/appointments\/([^/]+)\/status$/)) {
    const id = pathname.split('/')[3];
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = body.status;
      saveLocalDB(db);
      return mockResponse({ success: true, appointment: apt });
    }
    return mockResponse({ success: false, error: 'Appointment not found' }, 404);
  }

  if (pathname.match(/^\/api\/appointments\/([^/]+)\/amount$/)) {
    const id = pathname.split('/')[3];
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.amount = Number(body.amount);
      apt.customAmount = Number(body.amount);
      apt.feeNote = body.feeNote || '';
      saveLocalDB(db);
      return mockResponse({ success: true, appointment: apt });
    }
    return mockResponse({ success: false, error: 'Appointment not found' }, 404);
  }

  if (pathname.match(/^\/api\/appointments\/([^/]+)\/manage$/)) {
    const id = pathname.split('/')[3];
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      if (body.timeSlot) apt.timeSlot = body.timeSlot;
      if (body.date) apt.date = body.date;
      if (body.assignedPhysio) apt.assignedPhysio = body.assignedPhysio;
      if (body.status) apt.status = body.status;
      saveLocalDB(db);
      return mockResponse({ success: true, appointment: apt });
    }
    return mockResponse({ success: false, error: 'Appointment not found' }, 404);
  }

  if (pathname.match(/^\/api\/appointments\/([^/]+)\/cancel$/)) {
    const id = pathname.split('/')[3];
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = 'Cancelled';
      saveLocalDB(db);
      return mockResponse({ success: true, appointment: apt });
    }
    return mockResponse({ success: false, error: 'Appointment not found' }, 404);
  }

  if (pathname.match(/^\/api\/appointments\/([^/]+)$/) && method === 'DELETE') {
    const id = pathname.split('/')[3];
    db.appointments = db.appointments.filter(a => a.id !== id);
    saveLocalDB(db);
    return mockResponse({ success: true });
  }

  // 4. PATIENTS ROUTES
  if (pathname === '/api/patients') {
    if (method === 'GET') {
      return mockResponse(db.users.filter(u => u.role === 'USER'));
    }
    if (method === 'POST') {
      const newPat = {
        id: `usr_pat_${Date.now()}`,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        age: body.age,
        gender: body.gender,
        address: body.address,
        medicalCondition: body.medicalCondition,
        role: 'USER',
        password: '1234',
        createdAt: new Date().toISOString()
      };
      db.users.push(newPat);
      saveLocalDB(db);
      return mockResponse({ success: true, patient: newPat });
    }
  }

  if (pathname.match(/^\/api\/patients\/([^/]+)$/)) {
    const id = pathname.split('/')[3];
    if (method === 'PUT') {
      const idx = db.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...body };
        saveLocalDB(db);
        return mockResponse({ success: true, patient: db.users[idx] });
      }
    }
    if (method === 'DELETE') {
      db.users = db.users.filter(u => u.id !== id);
      saveLocalDB(db);
      return mockResponse({ success: true });
    }
  }

  // 5. NURSES / PHYSIOTHERAPISTS ROUTES
  if (pathname === '/api/admin/nurses') {
    if (method === 'GET') {
      return mockResponse(db.users.filter(u => u.role === 'NURSE'));
    }
    if (method === 'POST') {
      const newStaff = {
        id: `NURSE_${Date.now()}`,
        fullName: body.fullName,
        email: body.email,
        username: body.username || (body.email ? body.email.split('@')[0] : 'nurse'),
        password: body.password || '1234',
        role: 'NURSE',
        phone: body.phone,
        shift: body.shift || 'Morning (08:00 AM - 02:00 PM)',
        status: 'Active',
        supervisingDoctor: 'Dr. Joel Calvin C (Lead Physio)',
        notes: body.notes || 'Junior staff member',
        createdAt: new Date().toISOString()
      };
      db.users.push(newStaff);
      saveLocalDB(db);
      return mockResponse({ success: true, nurse: newStaff });
    }
  }

  if (pathname.match(/^\/api\/admin\/nurses\/([^/?]+)/)) {
    const id = pathname.split('/')[4].split('?')[0];
    if (method === 'DELETE') {
      const nurse = db.users.find(u => u.id === id);
      if (nurse) {
        nurse.status = 'Resigned';
      }
      saveLocalDB(db);
      return mockResponse({ success: true });
    }
  }

  if (pathname === '/api/nurse/public-roster') {
    return mockResponse(db.users.filter(u => u.role === 'NURSE' && u.status === 'Active'));
  }

  if (pathname === '/api/nurse/appointments') {
    return mockResponse(db.appointments);
  }

  if (pathname === '/api/nurse/patients') {
    return mockResponse(db.users.filter(u => u.role === 'USER'));
  }

  if (pathname.match(/^\/api\/nurse\/appointments\/([^/]+)$/) && method === 'PATCH') {
    const id = pathname.split('/')[4];
    const apt = db.appointments.find(a => a.id === id);
    if (apt) {
      if (body.notes) apt.notes = body.notes;
      if (body.status) apt.status = body.status;
      saveLocalDB(db);
      return mockResponse({ success: true, appointment: apt });
    }
    return mockResponse({ success: false, error: 'Appointment not found' }, 404);
  }

  // 6. PAYMENTS ROUTES
  if (pathname === '/api/payments') {
    const patientId = searchParams.get('patientId');
    if (patientId) {
      return mockResponse(db.payments.filter(p => p.patientId === patientId));
    }
    return mockResponse(db.payments);
  }

  if (pathname === '/api/payments/income-summary') {
    const totalRevenue = db.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingDues = db.appointments
      .filter(a => a.paymentStatus === 'DUE')
      .reduce((acc, a) => acc + (a.amount || a.customAmount || 800), 0);

    const cashRevenue = db.payments
      .filter(p => p.paymentMethod === 'CLINIC_CASH')
      .reduce((acc, p) => acc + p.amount, 0);

    const upiRevenue = totalRevenue - cashRevenue;

    return mockResponse({
      totalRevenue,
      todayRevenue: 2400,
      monthlyRevenue: totalRevenue,
      pendingDues,
      paidAppointmentsCount: db.payments.length,
      unpaidAppointmentsCount: db.appointments.filter(a => a.paymentStatus === 'DUE').length,
      cashRevenue,
      upiRevenue,
      methodBreakdown: {
        cash: cashRevenue,
        upi: upiRevenue
      },
      recentSettlements: db.payments.slice(0, 5)
    });
  }

  if (pathname === '/api/payments/collect' || pathname === '/api/payments/process') {
    const aptId = body.appointmentId;
    const apt = db.appointments.find(a => a.id === aptId);
    const amount = Number(body.amount) || (apt ? apt.amount : 800);
    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnId = `TXN-HLX-${Math.floor(100000 + Math.random() * 900000)}`;
    const sig = `HLX-SHA256-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    const newPayment = {
      id: `pay-${Date.now()}`,
      txnId,
      invoiceNo,
      appointmentId: aptId,
      patientId: apt ? apt.patientId : 'usr_pat_1',
      patientName: apt ? apt.patientName : (body.patientName || 'Patient'),
      patientPhone: apt ? apt.patientPhone : '+91 73053 94549',
      serviceName: apt ? apt.serviceName : 'Physiotherapy Consultation',
      amount,
      currency: 'INR',
      paymentMethod: body.paymentMethod || 'CLINIC_CASH',
      methodLabel: body.paymentMethod === 'CLINIC_CASH' ? 'Cash at Clinic Reception' : 'Google Pay (UPI)',
      collectedBy: 'Dr. Joel Calvin C (Lead Physio)',
      notes: body.notes || 'Official physiotherapy session receipt',
      securitySignature: sig,
      complianceBadge: 'In-Clinic Official Settlement · GST Compliant · Verified',
      status: 'COMPLETED',
      paidAt: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
      isHomeVisit: apt ? apt.isHomeVisit : false,
      date: apt ? apt.date : new Date().toISOString().split('T')[0],
      timeSlot: apt ? apt.timeSlot : '10:00 AM - 11:00 AM'
    };

    if (apt) {
      apt.paymentStatus = 'PAID';
      apt.paymentId = newPayment.id;
      apt.paymentTxnId = txnId;
      apt.securitySignature = sig;
      apt.paidAt = newPayment.paidAt;
    }

    db.payments.unshift(newPayment);
    saveLocalDB(db);
    return mockResponse({ success: true, payment: newPayment });
  }

  return mockResponse({ success: false, error: `Unhandled mock endpoint: ${pathname}` }, 404);
}

// Global fetch interceptor: seamlessly proxies or falls back
export function setupMockApiInterceptor() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

    // Only intercept /api/ routes
    if (url.startsWith('/api') || url.includes('/api/')) {
      const isGitHubPages = window.location.hostname.includes('github.io');

      // If hosted on GitHub Pages, directly use mock API
      if (isGitHubPages) {
        return handleMockApiRequest(url, init);
      }

      // Otherwise try real API first, fall back if server is unreachable
      try {
        const response = await originalFetch(input, init);
        if (response.ok || (response.status !== 404 && response.status !== 502 && response.status !== 503)) {
          return response;
        }
        // If 404 on API endpoint, fall back to mock
        return handleMockApiRequest(url, init);
      } catch (networkErr) {
        console.warn(`[Healix Demo Interceptor] Network fetch failed for ${url}, switching to mock fallback:`, networkErr);
        return handleMockApiRequest(url, init);
      }
    }

    return originalFetch(input, init);
  };
}
