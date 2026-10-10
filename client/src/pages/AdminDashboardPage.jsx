import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  Search,
  Trash2,
  Edit,
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard,
  Sliders,
  CalendarCheck,
  Download,
  Printer,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Stethoscope,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// -------------------------------------------------------------
// REUSABLE SUB-COMPONENTS FOR DRY & MAINTAINABLE CODE
// -------------------------------------------------------------

function ModalOverlay({ isOpen, onClose, maxWidth = '600px', borderColor = 'rgba(255,255,255,0.15)', icon: Icon, iconColor = 'var(--accent-cyan)', title, subtitle, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth, border: `1.5px solid ${borderColor}`, background: '#0e0618' }}>
        <div className="modal-header" style={{ borderBottom: `1px solid ${borderColor}`, paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {Icon && (
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>{title}</h3>
              {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PresetFeeChips({ onSelect }) {
  const chips = [
    { label: 'Standard Clinic', val: '1200' },
    { label: 'Home Visit', val: '1875' },
    { label: '₹800', val: '800' },
    { label: '₹1,000', val: '1000' },
    { label: '₹1,500', val: '1500' },
    { label: '₹0 (Free / Follow-up)', val: '0' }
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
      {chips.map(chip => (
        <button
          key={chip.val}
          type="button"
          onClick={() => onSelect(chip.val)}
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.08)', color: 'var(--accent-gold)', fontWeight: '700', cursor: 'pointer' }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

function PatientFormModal({ isOpen, onClose, initialData, onSubmit, isEditing }) {
  const [form, setForm] = useState(initialData || {});
  useEffect(() => { setForm(initialData || {}); }, [initialData]);
  if (!isOpen) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Medical Chart: ${initialData.fullName}` : "Register New Patient Record"}
      subtitle={isEditing ? "Update patient clinical notes, phone contact, or address" : "Create new clinic patient chart"}
      icon={UserPlus}
      iconColor="var(--accent-cyan)"
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', padding: '1rem 0' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name *</label>
            <input required className="form-input" value={form.fullName || ''} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="e.g. John Doe" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address *</label>
              <input type="email" required className="form-input" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="patient@example.com" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Contact *</label>
              <input required className="form-input" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Age</label>
              <input type="number" min="1" max="120" className="form-input" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender || 'Male'} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Residential Address</label>
            <input className="form-input" value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="House no, Street, Area, City" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Chief Medical Complaint / Condition</label>
            <input className="form-input" value={form.medicalCondition || ''} onChange={e => setForm(p => ({ ...p, medicalCondition: e.target.value }))} placeholder="e.g. Chronic Low Back Pain (L4-L5)" />
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-cyan">{isEditing ? 'Save Changes' : 'Register Patient'}</button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function NurseFormModal({ isOpen, onClose, initialData, onSubmit, isEditing }) {
  const [form, setForm] = useState(initialData || {});
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { setForm(initialData || {}); }, [initialData]);
  if (!isOpen) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Nurse Profile: ${initialData.fullName}` : "Onboard New Nurse Station Personnel"}
      subtitle={isEditing ? "Update shift, credentials, contact, and duty status" : "Create clinical credentials for nursing staff"}
      icon={Stethoscope}
      iconColor="var(--accent-magenta, #d91b76)"
      borderColor="var(--accent-magenta, #d91b76)"
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem 0', maxHeight: '68vh', overflowY: 'auto' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name *</label>
            <input required className="form-input" value={form.fullName || ''} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="e.g. Sister Pauline T" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Work Email *</label>
              <input type="email" required className="form-input" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="nurse@healix.com" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Portal Username *</label>
              <input required className="form-input" value={form.username || ''} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="e.g. nurse_pauline" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Assigned Shift *</label>
              <select className="form-select" value={form.shift || 'Morning (08:00 AM - 02:00 PM)'} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}>
                <option value="Morning (08:00 AM - 02:00 PM)">Morning (08:00 AM - 02:00 PM)</option>
                <option value="Evening (02:00 PM - 08:00 PM)">Evening (02:00 PM - 08:00 PM)</option>
                <option value="Full Day (08:00 AM - 08:00 PM)">Full Day (08:00 AM - 08:00 PM)</option>
                <option value="Night Rotation (On-Call)">Night Rotation (On-Call)</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Contact *</label>
              <input required className="form-input" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Supervising Doctor *</label>
            <input required className="form-input" value={form.supervisingDoctor || 'Dr. Calvin Joel (Chief Physiotherapist)'} onChange={e => setForm(p => ({ ...p, supervisingDoctor: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{isEditing ? 'New Password (leave blank to keep current)' : 'Account Password *'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required={!isEditing}
                className="form-input"
                style={{ paddingRight: '40px' }}
                value={isEditing ? (form.newPassword || '') : (form.password || '')}
                onChange={e => setForm(p => isEditing ? ({ ...p, newPassword: e.target.value, password: e.target.value || p.password }) : ({ ...p, password: e.target.value }))}
                placeholder={isEditing ? `Current: ${form.password || '••••••'}` : 'Min 6 characters'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Clinical Specialization & Notes</label>
            <input className="form-input" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Post-op triage & electrotherapy assist" />
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-cyan" style={{ background: 'linear-gradient(135deg, #d91b76, #9333ea)', border: 'none' }}>
            {isEditing ? 'Update Nurse Profile' : 'Onboard Nurse Personnel'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// -------------------------------------------------------------
// MAIN ADMIN DASHBOARD COMPONENT
// -------------------------------------------------------------

export default function AdminDashboardPage({ onOpenAdminAuth, defaultTab = 'appointments' }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const initialTab = (defaultTab === 'security' || !defaultTab) ? 'appointments' : defaultTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab === 'security' ? 'appointments' : defaultTab);
    }
  }, [defaultTab]);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [timings, setTimings] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisitType, setFilterVisitType] = useState('All');

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ day: 'Monday - Saturday', timeSlot: '', maxCapacity: '4', isHomeVisitSlot: false });

  const [isAddNurseOpen, setIsAddNurseOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [quittingNurse, setQuittingNurse] = useState(null);
  const [quitReason, setQuitReason] = useState('');
  const [showNursePasswords, setShowNursePasswords] = useState({});

  // Doctor Set Individual Patient Fee Modal State
  const [feeModalApt, setFeeModalApt] = useState(null);
  const [feeInput, setFeeInput] = useState('');
  const [feeNoteInput, setFeeNoteInput] = useState('');
  const [feePaymentStatus, setFeePaymentStatus] = useState('DUE');
  const [feeSaving, setFeeSaving] = useState(false);

  // Income & Revenue Portal State
  const [incomeSubTab, setIncomeSubTab] = useState('calendar');
  const [incomeSearch, setIncomeSearch] = useState('');
  const [incomeModeFilter, setIncomeModeFilter] = useState('All');
  const [collectModalApt, setCollectModalApt] = useState(null);
  const [collectForm, setCollectForm] = useState({ amount: '', paymentMethod: 'CLINIC_CASH', referenceNo: '', notes: '' });
  const [collectSubmitting, setCollectSubmitting] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Financial Calendar State
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarViewMode, setCalendarViewMode] = useState('grid');

  // Admin Book Patient Slot & Set Fee State
  const [isBookSlotOpen, setIsBookSlotOpen] = useState(false);
  const [adminBookingForm, setAdminBookingForm] = useState({
    patientMode: 'existing',
    patientId: '',
    patientName: '',
    patientPhone: '+91 ',
    serviceName: 'General Physiotherapy Consultation',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '',
    visitType: 'In-Clinic',
    homeAddress: '',
    landmark: '',
    locationUrl: '',
    assignedPhysio: 'Dr. Joel Calvin C',
    notes: '',
    customFee: '1200',
    feeNote: 'Standard Consultation Rate',
    paymentStatus: 'DUE'
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Manage & Reschedule Slot State
  const [managingSlotApt, setManagingSlotApt] = useState(null);
  const [manageSlotForm, setManageSlotForm] = useState({
    date: '',
    timeSlot: '',
    serviceName: '',
    visitType: 'In-Clinic',
    homeAddress: '',
    landmark: '',
    locationUrl: '',
    assignedPhysio: 'Dr. Joel Calvin C',
    status: 'Confirmed',
    notes: '',
    customAmount: '',
    feeNote: '',
    paymentStatus: 'DUE'
  });
  const [manageSlotSubmitting, setManageSlotSubmitting] = useState(false);

  // API Call helper with auto user ID header
  const authHeaders = useMemo(() => ({
    'x-user-id': currentUser?.id || 'usr_admin_1',
    'Content-Type': 'application/json'
  }), [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    const headers = { 'x-user-id': currentUser?.id || 'usr_admin_1' };
    try {
      const [resP, resA, resT, resN, resI] = await Promise.all([
        fetch('/api/patients', { headers }),
        fetch('/api/appointments', { headers }),
        fetch('/api/timings', { headers }),
        fetch('/api/admin/nurses', { headers }),
        fetch('/api/payments/income-summary', { headers })
      ]);
      const dataP = await resP.json();
      const dataA = await resA.json();
      const dataT = await resT.json();
      const dataN = await resN.json();
      const dataI = await resI.json();

      if (dataP.success) setPatients(dataP.patients || []);
      if (dataA.success) setAppointments(dataA.appointments || []);
      if (dataT.success) setTimings(dataT.timings || []);
      if (dataN.success) setNurses(dataN.nurses || []);
      if (dataI.success) setIncomeData(dataI);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', borderColor: 'var(--accent-red)' }}>
        <ShieldCheck size={48} color="var(--accent-red)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--accent-red)' }}>
          Access Denied: Admin Authorization Required
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          This portal is restricted exclusively to authorized Clinic Administrators.
        </p>
        <button onClick={onOpenAdminAuth} className="btn btn-admin">
          Access Admin Portal
        </button>
      </div>
    );
  }

  // --- HANDLERS ---

  const handleAddPatientSubmit = async (formData) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddPatientOpen(false);
        toast.success("Patient record added successfully!", "Patient Added");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to add patient record", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Error");
    }
  };

  const handleEditPatientSubmit = async (formData) => {
    try {
      const res = await fetch(`/api/patients/${formData.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setEditingPatient(null);
        toast.success("Patient record updated successfully!", "Record Updated");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update patient record", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Error");
    }
  };

  const handleDeletePatient = (id, name) => {
    toast.confirm({
      title: 'Remove Patient Record',
      message: `Are you sure you want to remove the medical record for ${name}? This action cannot be undone.`,
      confirmText: 'Yes, Delete Record',
      cancelText: 'Keep Record',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/patients/${id}`, { method: 'DELETE', headers: authHeaders });
          const data = await res.json();
          if (data.success) {
            toast.success(`Patient record for ${name} removed successfully.`, "Record Deleted");
            fetchAdminData();
          } else {
            toast.error(data.error || "Failed to remove patient", "Delete Error");
          }
        } catch (err) {
          toast.error(err.message, "Delete Error");
        }
      }
    });
  };

  const handleAddNurseSubmit = async (formData) => {
    try {
      const res = await fetch('/api/admin/nurses', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddNurseOpen(false);
        toast.success(data.message, "Nurse Registered");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to register nurse.", "Registration Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    }
  };

  const handleUpdateNurseSubmit = async (formData) => {
    try {
      const res = await fetch(`/api/admin/nurses/${formData.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setEditingNurse(null);
        toast.success(data.message, "Nurse Updated");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update nurse profile.", "Update Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    }
  };

  const handleConfirmResignNurse = async () => {
    if (!quittingNurse) return;
    try {
      const res = await fetch(`/api/admin/nurses/${quittingNurse.id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setQuittingNurse(null);
        setQuitReason('');
        toast.warning(data.message, "Nurse Resigned / Access Revoked");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to process resignation.", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    }
  };

  const handleReactivateNurse = async (nurse) => {
    try {
      const res = await fetch(`/api/admin/nurses/${nurse.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: 'Active' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Nurse ${nurse.fullName} has been reactivated to Active duty.`, "Duty Restored");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to reactivate nurse.", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    }
  };

  const handlePermanentDeleteNurse = async (nurse) => {
    if (!window.confirm(`Are you completely sure you want to permanently delete all records for ${nurse.fullName}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/nurses/${nurse.id}?permanent=true`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        toast.info(data.message, "Nurse Record Deleted");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to delete nurse.", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    }
  };

  const handleUpdateAptStatus = async (id, status, assignedPhysio) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status, assignedPhysio })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Appointment status updated to "${status}"${assignedPhysio ? ` · Physio: ${assignedPhysio}` : ''}`, "Status Updated");
        fetchAdminData();
        if (status === 'Completed') {
          const targetApt = appointments.find(a => a.id === id);
          if (targetApt && targetApt.customAmount === undefined && targetApt.amount === undefined) {
            handleOpenFeeModal({ ...targetApt, status: 'Completed' });
            toast.info("Treatment marked Completed. Please set the post-treatment fee for the patient.", "Set Fee After Treatment");
          }
        }
      } else {
        toast.error(data.error || "Failed to update appointment status", "Update Error");
      }
    } catch (err) {
      toast.error(err.message, "Update Error");
    }
  };

  const handleDeleteAppointment = (id, name) => {
    toast.confirm({
      title: 'Delete Appointment Record',
      message: `Are you sure you want to delete the appointment for ${name}? This action cannot be undone.`,
      confirmText: 'Yes, Delete Appointment',
      cancelText: 'Keep Appointment',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE', headers: authHeaders });
          const data = await res.json();
          if (data.success) {
            toast.success(`Appointment for ${name} was deleted successfully.`, "Appointment Deleted");
            fetchAdminData();
          } else {
            toast.error(data.error || "Failed to delete appointment", "Delete Error");
          }
        } catch (err) {
          toast.error(err.message, "Delete Error");
        }
      }
    });
  };

  const handleOpenFeeModal = (apt) => {
    setFeeModalApt(apt);
    const hasExistingFee = apt.customAmount !== undefined || apt.amount !== undefined;
    const defaultVal = hasExistingFee ? String(apt.customAmount !== undefined ? apt.customAmount : apt.amount) : (apt.isHomeVisit ? '1500' : '800');
    setFeeInput(defaultVal);
    setFeeNoteInput(apt.feeNote || '');
    setFeePaymentStatus(apt.paymentStatus || 'DUE');
  };

  const handleAdjustFee = (delta) => {
    const cur = parseFloat(feeInput) || 0;
    setFeeInput(String(Math.max(0, cur + delta)));
  };

  const handleResetToStandardFee = async () => {
    if (!feeModalApt) return;
    setFeeSaving(true);
    try {
      const res = await fetch(`/api/appointments/${feeModalApt.id}/amount`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ resetToDefault: true })
      });
      const data = await res.json();
      if (data.success) {
        toast.info(data.message, "Fee Reset");
        setFeeModalApt(null);
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to reset fee to standard clinic schedule.", "Reset Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    } finally {
      setFeeSaving(false);
    }
  };

  const handleSaveIndividualFee = async (e) => {
    e.preventDefault();
    if (!feeModalApt) return;
    const num = parseFloat(feeInput);
    if (isNaN(num) || num < 0) {
      toast.warning("Please enter a valid individual fee in ₹ INR (>= 0).", "Invalid Amount");
      return;
    }
    setFeeSaving(true);
    try {
      const res = await fetch(`/api/appointments/${feeModalApt.id}/amount`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          amount: num,
          feeNote: feeNoteInput,
          paymentStatus: feePaymentStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Post-treatment fee for ${feeModalApt.patientName} set to ₹${num.toLocaleString()} (${feePaymentStatus === 'PAID' ? 'Paid' : 'Payment Due'})!`, "Fee Configured");
        setFeeModalApt(null);
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update individual fee.", "Update Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    } finally {
      setFeeSaving(false);
    }
  };

  const handleOpenCollectModal = (apt) => {
    setCollectModalApt(apt);
    const defaultAmount = apt.amount !== undefined ? String(apt.amount) : (apt.customAmount !== undefined ? String(apt.customAmount) : '800');
    setCollectForm({
      amount: defaultAmount,
      paymentMethod: 'CLINIC_CASH',
      referenceNo: '',
      notes: `Settled consultation fee for ${apt.patientName}`
    });
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!collectModalApt) return;
    const num = parseFloat(collectForm.amount);
    if (isNaN(num) || num <= 0) {
      toast.warning("Please enter a valid payment amount in ₹ INR.", "Invalid Amount");
      return;
    }
    setCollectSubmitting(true);
    try {
      const res = await fetch('/api/payments/collect', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          appointmentId: collectModalApt.appointmentId || collectModalApt.id,
          patientId: collectModalApt.patientId,
          patientName: collectModalApt.patientName,
          serviceName: collectModalApt.serviceName,
          amount: num,
          paymentMethod: collectForm.paymentMethod,
          referenceNo: collectForm.referenceNo,
          notes: collectForm.notes,
          collectorName: currentUser?.fullName ? (currentUser.fullName.startsWith('Dr.') ? currentUser.fullName : `Dr. ${currentUser.fullName}`) : 'Dr. Joel Calvin C'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Payment Collected & Recorded");
        setCollectModalApt(null);
        fetchAdminData();
        if (data.transaction) setViewingReceipt(data.transaction);
      } else {
        toast.error(data.error || "Failed to record payment.", "Payment Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    } finally {
      setCollectSubmitting(false);
    }
  };

  const handleDownloadReceiptHtml = (receipt) => {
    if (!receipt) return;
    const invNo = receipt.invoiceNo || 'INV-2026';
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Healix Clinical Receipt - ${invNo}</title><style>body{font-family:'Segoe UI',sans-serif;background:#0c0512;color:#f1f5f9;padding:40px;margin:0}.card{max-width:600px;margin:0 auto;background:#170d24;border:2px solid #a855f7;border-radius:16px;padding:32px}.row{display:flex;justify-content:space-between;margin:12px 0;font-size:14px}.label{color:#94a3b8}.value{font-weight:bold;color:#f8fafc}.amount-box{background:rgba(168,85,247,0.15);border:1px solid #a855f7;border-radius:10px;padding:16px;margin:20px 0;display:flex;justify-content:space-between;align-items:center}.amount{font-size:26px;font-weight:900;color:#34d399}</style></head><body><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(168,85,247,0.3);padding-bottom:16px"><div><h1 style="margin:0;font-size:22px;color:#f472b6">Healix Physiotherapy</h1><p style="margin:4px 0 0;font-size:11px;color:#fbbf24">Official Patient Clinical Receipt</p></div><span style="background:rgba(16,185,129,0.2);color:#34d399;padding:6px 14px;border-radius:999px;font-weight:bold;font-size:12px">PAID &bull; VERIFIED</span></div><div style="margin-top:20px"><div class="row"><span class="label">Invoice No:</span><span class="value">${receipt.invoiceNo || 'INV-2026-HLX'}</span></div><div class="row"><span class="label">Patient Name:</span><span class="value">${receipt.patientName}</span></div><div class="row"><span class="label">Therapy Service:</span><span class="value">${receipt.serviceName}</span></div><div class="row"><span class="label">Attending Physio:</span><span class="value">${receipt.assignedPhysio || receipt.collectedBy || 'Dr. Joel Calvin C'}</span></div><div class="row"><span class="label">Payment Mode:</span><span class="value">${receipt.methodLabel || receipt.paymentMethod || 'Clinic Desk'}</span></div><div class="row"><span class="label">Date & Time:</span><span class="value">${receipt.timestamp || receipt.paidAt || new Date().toLocaleString()}</span></div></div><div class="amount-box"><div><div style="font-size:13px;color:#e2e8f0;font-weight:600">Net Settled Amount</div><div style="font-size:11px;color:#94a3b8">Doctor Post-Treatment Fee</div></div><div class="amount">&#8377;${Number(receipt.amount || 0).toLocaleString()}</div></div><div style="text-align:center;font-size:11px;color:#94a3b8;border-top:1px dashed rgba(255,255,255,0.15);padding-top:14px">Cryptographic Seal: <code style="color:#fbbf24">${receipt.securitySignature || 'HLX-SHA256-VERIFIED'}</code></div></div></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Healix_Receipt_${invNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Receipt for ${receipt.patientName} (${invNo}) downloaded!`, "Receipt Downloaded");
  };

  const handleOpenBookSlotModal = () => {
    const firstAvailSlot = timings.find(t => t.isAvailable && t.booked < t.maxCapacity)?.timeSlot || (timings[0]?.timeSlot || '09:00 AM - 10:00 AM');
    setAdminBookingForm({
      patientMode: patients.length > 0 ? 'existing' : 'new',
      patientId: patients[0]?.id || '',
      patientName: patients[0]?.fullName || '',
      patientPhone: patients[0]?.phone || '+91 ',
      serviceName: 'General Physiotherapy Consultation',
      date: new Date().toISOString().split('T')[0],
      timeSlot: firstAvailSlot,
      visitType: 'In-Clinic',
      homeAddress: patients[0]?.address || '',
      landmark: '',
      locationUrl: '',
      assignedPhysio: 'Dr. Joel Calvin C',
      notes: '',
      customFee: '1200',
      feeNote: 'Standard Consultation Rate',
      paymentStatus: 'DUE'
    });
    setIsBookSlotOpen(true);
  };

  const handlePatientSelectChange = (patId) => {
    if (!patId) {
      setAdminBookingForm(prev => ({ ...prev, patientId: '', patientName: '', patientPhone: '+91 ' }));
      return;
    }
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setAdminBookingForm(prev => ({
        ...prev,
        patientId: pat.id,
        patientName: pat.fullName,
        patientPhone: pat.phone || '+91 ',
        homeAddress: prev.visitType === 'Home-Visit' && !prev.homeAddress ? (pat.address || '') : prev.homeAddress
      }));
    }
  };

  const handleSubmitAdminBooking = async (e) => {
    e.preventDefault();
    if (!adminBookingForm.patientName.trim()) {
      toast.warning("Please provide patient name.", "Validation Error");
      return;
    }
    if (!adminBookingForm.date || !adminBookingForm.timeSlot) {
      toast.warning("Please select appointment date and time slot.", "Validation Error");
      return;
    }
    if (adminBookingForm.visitType === 'Home-Visit' && !adminBookingForm.homeAddress.trim()) {
      toast.warning("Home visit address is mandatory for home visit bookings.", "Address Required");
      return;
    }

    setBookingSubmitting(true);
    try {
      const isHome = adminBookingForm.visitType === 'Home-Visit';
      const feeNum = parseFloat(adminBookingForm.customFee);
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          patientId: adminBookingForm.patientId || undefined,
          patientName: adminBookingForm.patientName.trim(),
          patientPhone: adminBookingForm.patientPhone.trim(),
          serviceName: adminBookingForm.serviceName,
          date: adminBookingForm.date,
          timeSlot: adminBookingForm.timeSlot,
          visitType: isHome ? 'Home-Visit' : 'In-Clinic',
          isHomeVisit: isHome,
          homeAddress: isHome ? adminBookingForm.homeAddress.trim() : '',
          landmark: isHome ? adminBookingForm.landmark.trim() : '',
          locationUrl: isHome ? adminBookingForm.locationUrl.trim() : '',
          assignedPhysio: adminBookingForm.assignedPhysio,
          notes: adminBookingForm.notes.trim(),
          amount: !isNaN(feeNum) && feeNum >= 0 ? feeNum : (isHome ? 1875 : 1200),
          customAmount: !isNaN(feeNum) && feeNum >= 0 ? feeNum : (isHome ? 1875 : 1200),
          feeNote: adminBookingForm.feeNote,
          paymentStatus: adminBookingForm.paymentStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Slot booked for ${adminBookingForm.patientName} on ${adminBookingForm.date} (${adminBookingForm.timeSlot})! Session fee set: ₹${Number(adminBookingForm.customFee || 0).toLocaleString()}`, "Patient Slot Booked");
        setIsBookSlotOpen(false);
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to book slot.", "Booking Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleOpenManageSlotModal = (apt) => {
    setManagingSlotApt(apt);
    setManageSlotForm({
      date: apt.date || '',
      timeSlot: apt.timeSlot || '',
      serviceName: apt.serviceName || 'General Physiotherapy Consultation',
      visitType: apt.isHomeVisit ? 'Home-Visit' : 'In-Clinic',
      isHomeVisit: apt.isHomeVisit || false,
      homeAddress: apt.homeAddress || '',
      landmark: apt.landmark || '',
      locationUrl: apt.locationUrl || '',
      assignedPhysio: apt.assignedPhysio || 'Dr. Joel Calvin C',
      status: apt.status || 'Confirmed',
      notes: apt.notes || '',
      customAmount: apt.customAmount !== undefined ? String(apt.customAmount) : (apt.isHomeVisit ? '1875' : '1200'),
      feeNote: apt.feeNote || '',
      paymentStatus: apt.paymentStatus || 'DUE'
    });
  };

  const handleSubmitManageSlot = async (e) => {
    e.preventDefault();
    if (!managingSlotApt) return;
    if (!manageSlotForm.date || !manageSlotForm.timeSlot) {
      toast.warning("Date and time slot are required.", "Validation Error");
      return;
    }
    if (manageSlotForm.visitType === 'Home-Visit' && !manageSlotForm.homeAddress.trim()) {
      toast.warning("Home visit address is mandatory.", "Address Required");
      return;
    }

    setManageSlotSubmitting(true);
    try {
      const isHome = manageSlotForm.visitType === 'Home-Visit';
      const feeNum = parseFloat(manageSlotForm.customAmount);
      const res = await fetch(`/api/appointments/${managingSlotApt.id}/manage`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          date: manageSlotForm.date,
          timeSlot: manageSlotForm.timeSlot,
          serviceName: manageSlotForm.serviceName,
          homeAddress: isHome ? manageSlotForm.homeAddress.trim() : '',
          landmark: isHome ? manageSlotForm.landmark.trim() : '',
          locationUrl: isHome ? manageSlotForm.locationUrl.trim() : '',
          assignedPhysio: manageSlotForm.assignedPhysio,
          status: manageSlotForm.status,
          notes: manageSlotForm.notes.trim(),
          amount: !isNaN(feeNum) && feeNum >= 0 ? feeNum : undefined,
          customAmount: !isNaN(feeNum) && feeNum >= 0 ? feeNum : undefined,
          feeNote: manageSlotForm.feeNote,
          paymentStatus: manageSlotForm.paymentStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Patient slot updated & rescheduled: ${manageSlotForm.date} (${manageSlotForm.timeSlot})`, "Slot Managed");
        setManagingSlotApt(null);
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update slot booking.", "Update Error");
      }
    } catch (err) {
      toast.error(err.message, "Network Error");
    } finally {
      setManageSlotSubmitting(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(slotForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddSlotOpen(false);
        setSlotForm({ day: 'Monday - Saturday', timeSlot: '', maxCapacity: '4', isHomeVisitSlot: false });
        toast.success("Timetable slot added successfully!", "Slot Created");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to add slot", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Error");
    }
  };

  const handleToggleSlot = async (id) => {
    try {
      const res = await fetch(`/api/timings/${id}/toggle`, { method: 'PATCH', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        toast.info("Timetable slot availability updated.", "Slot Updated");
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update slot", "Error");
      }
    } catch (err) {
      toast.error(err.message, "Error");
    }
  };

  // --- FILTERS & COMPUTATIONS ---

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.patientPhone.includes(searchTerm) ||
                            (a.homeAddress && a.homeAddress.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterVisitType === 'All' || 
                          (filterVisitType === 'Home-Visit' && a.isHomeVisit) ||
                          (filterVisitType === 'In-Clinic' && !a.isHomeVisit);
      return matchesSearch && matchesType;
    });
  }, [appointments, searchTerm, filterVisitType]);

  const homeVisitsTotal = useMemo(() => appointments.filter(a => a.isHomeVisit).length, [appointments]);
  const allPaidPatients = useMemo(() => incomeData?.paidPatients || [], [incomeData]);
  const allUnpaidPatients = useMemo(() => incomeData?.unpaidPatients || [], [incomeData]);

  const filteredPaidPatients = useMemo(() => {
    return allPaidPatients.filter(p => {
      const s = incomeSearch.toLowerCase();
      const matchesSearch = !incomeSearch || 
        (p.patientName && p.patientName.toLowerCase().includes(s)) ||
        (p.patientPhone && p.patientPhone.includes(s)) ||
        (p.serviceName && p.serviceName.toLowerCase().includes(s)) ||
        (p.txnId && p.txnId.toLowerCase().includes(s)) ||
        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(s));
      const matchesMode = incomeModeFilter === 'All' ||
        (incomeModeFilter === 'Home-Visit' && p.isHomeVisit) ||
        (incomeModeFilter === 'In-Clinic' && !p.isHomeVisit);
      return matchesSearch && matchesMode;
    });
  }, [allPaidPatients, incomeSearch, incomeModeFilter]);

  const filteredUnpaidPatients = useMemo(() => {
    return allUnpaidPatients.filter(u => {
      const s = incomeSearch.toLowerCase();
      const matchesSearch = !incomeSearch || 
        (u.patientName && u.patientName.toLowerCase().includes(s)) ||
        (u.patientPhone && u.patientPhone.includes(s)) ||
        (u.serviceName && u.serviceName.toLowerCase().includes(s));
      const matchesMode = incomeModeFilter === 'All' ||
        (incomeModeFilter === 'Home-Visit' && u.isHomeVisit) ||
        (incomeModeFilter === 'In-Clinic' && !u.isHomeVisit);
      return matchesSearch && matchesMode;
    });
  }, [allUnpaidPatients, incomeSearch, incomeModeFilter]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dailyPaidMap = useMemo(() => {
    const map = {};
    allPaidPatients.forEach(p => {
      let d = "";
      if (p.paidAt && typeof p.paidAt === 'string') {
        const m = p.paidAt.match(/^(\d{4}-\d{2}-\d{2})/);
        if (m) d = m[1];
      }
      if (!d && p.date && typeof p.date === 'string') {
        const m = p.date.match(/^(\d{4}-\d{2}-\d{2})/);
        if (m) d = m[1];
      }
      if (!d) d = new Date().toISOString().split('T')[0];

      if (!map[d]) {
        map[d] = { date: d, total: 0, count: 0, items: [] };
      }
      map[d].total += (Number(p.amount) || 0);
      map[d].count++;
      map[d].items.push(p);
    });
    return map;
  }, [allPaidPatients]);

  const monthPrefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;

  const currentMonthStats = useMemo(() => {
    let total = 0;
    let count = 0;
    let activeDays = 0;
    let peakDay = null;
    let peakAmount = 0;
    const daysInMonthList = [];

    Object.entries(dailyPaidMap).forEach(([dateStr, data]) => {
      if (dateStr.startsWith(monthPrefix)) {
        total += data.total;
        count += data.count;
        activeDays++;
        if (data.total > peakAmount) {
          peakAmount = data.total;
          peakDay = dateStr;
        }
        daysInMonthList.push(data);
      }
    });

    daysInMonthList.sort((a, b) => b.date.localeCompare(a.date));

    return {
      total,
      count,
      activeDays,
      dailyAverage: activeDays > 0 ? Math.round(total / activeDays) : 0,
      peakDay,
      peakAmount,
      daysInMonthList
    };
  }, [dailyPaidMap, monthPrefix]);

  const selectedDayData = dailyPaidMap[selectedCalendarDate] || {
    date: selectedCalendarDate,
    total: 0,
    count: 0,
    items: []
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
    setSelectedCalendarDate(today.toISOString().split('T')[0]);
  };

  // Command Tiles Data
  const commandTiles = [
    {
      id: 'appointments',
      title: 'Bookings',
      icon: Calendar,
      color: 'var(--accent-cyan)',
      mainVal: `${appointments.length} Sessions`,
      subText: `${homeVisitsTotal} Home Visits • ${appointments.filter(a => a.status === 'Confirmed').length} Confirmed`,
      tooltip: 'Click to view and manage patient appointments and home visit dispatches'
    },
    {
      id: 'income',
      title: 'Income Portal',
      icon: CreditCard,
      color: 'var(--accent-gold, #fbbf24)',
      mainVal: `₹${incomeData ? incomeData.totalIncomeGenerated.toLocaleString() : '...'}`,
      subText: `₹${incomeData ? incomeData.totalPendingIncome.toLocaleString() : '0'} Pending Fees • ${allUnpaidPatients.length} Due`,
      tooltip: 'Click to view total income generated, paid patients ledger, and unpaid dues'
    },
    {
      id: 'patients',
      title: 'Patients',
      icon: Users,
      color: 'var(--accent-purple)',
      mainVal: `${patients.length} Charts`,
      subText: 'Registered clinic patient profiles',
      tooltip: 'Click to view patient medical roster, charts, and histories'
    },
    {
      id: 'timings',
      title: 'Clinic Slots',
      icon: Clock,
      color: 'var(--accent-green)',
      mainVal: `${timings.filter(t => t.isAvailable).length} Active`,
      subText: `${timings.filter(t => !t.isAvailable).length} Blocked • ${timings.length} Total Slots`,
      tooltip: 'Click to view clinic operating schedule and consultation hours'
    },
    {
      id: 'nurses',
      title: 'Nurse Station',
      icon: Stethoscope,
      color: 'var(--healix-magenta-light)',
      mainVal: `${nurses.filter(n => n.status === 'Active').length} Active`,
      subText: `${nurses.length} Total Registered Personnel`,
      tooltip: 'Click to view nursing staff and roster'
    }
  ];

  // Nav Tabs Data
  const navTabs = [
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length, color: '#f472b6', bg: 'rgba(217, 27, 118, 0.4)' },
    { id: 'income', label: 'Income Portal', icon: CreditCard, count: `₹${(incomeData?.totalIncomeGenerated || 0).toLocaleString()}`, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.28)' },
    { id: 'patients', label: 'Patient Roster', icon: Users, count: patients.length, color: '#c084fc', bg: 'rgba(168, 85, 247, 0.35)' },
    { id: 'timings', label: 'Clinic Slots', icon: Clock, count: timings.length, color: '#34d399', bg: 'rgba(16, 185, 129, 0.3)' },
    { id: 'nurses', label: 'Nurse Staff', icon: Stethoscope, count: nurses.filter(n => n.status === 'Active').length, color: '#f472b6', bg: 'rgba(236, 72, 153, 0.35)' }
  ];

  // Financial KPI Cards Data
  const kpiCards = [
    {
      label: 'Total Income (Settled)',
      badge: '● All-Time',
      badgeClass: 'badge-success',
      color: '#34d399',
      bg: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(20, 8, 32, 0.85) 100%)',
      border: 'rgba(16, 185, 129, 0.45)',
      value: `₹${incomeData ? incomeData.totalIncomeGenerated.toLocaleString() : '0'}`,
      icon: CheckCircle2,
      subText: `${allPaidPatients.length} Completed Payments`
    },
    {
      label: "Today's Income",
      badge: '● Today (IST)',
      badgeClass: 'badge-cyan',
      color: 'var(--accent-cyan)',
      bg: 'linear-gradient(145deg, rgba(217, 27, 118, 0.14) 0%, rgba(20, 8, 32, 0.85) 100%)',
      border: 'rgba(217, 27, 118, 0.45)',
      value: `₹${(dailyPaidMap[new Date().toISOString().split('T')[0]]?.total || 0).toLocaleString()}`,
      icon: Clock,
      subText: `${dailyPaidMap[new Date().toISOString().split('T')[0]]?.count || 0} Settled Sessions Today`
    },
    {
      label: `${monthNames[calendarMonth]} Income`,
      badge: 'Monthly Total',
      badgeClass: 'badge-gold',
      color: 'var(--accent-gold, #fbbf24)',
      bg: 'linear-gradient(145deg, rgba(251, 191, 36, 0.14) 0%, rgba(20, 8, 32, 0.85) 100%)',
      border: 'rgba(251, 191, 36, 0.45)',
      value: `₹${currentMonthStats.total.toLocaleString()}`,
      icon: Calendar,
      subText: `${currentMonthStats.count} Payments in ${monthNames[calendarMonth]}`
    },
    {
      label: 'Pending Dues (Unpaid)',
      badge: '● Dues',
      badgeClass: 'badge-gold',
      color: 'var(--accent-gold)',
      bg: 'linear-gradient(145deg, rgba(245, 158, 11, 0.12) 0%, rgba(20, 8, 32, 0.85) 100%)',
      border: allUnpaidPatients.length > 0 ? 'rgba(251, 191, 36, 0.5)' : 'var(--border-color)',
      value: `₹${incomeData ? incomeData.totalPendingIncome.toLocaleString() : '0'}`,
      icon: Clock,
      subText: `${allUnpaidPatients.length} Patients Awaiting Settlement`
    },
    {
      label: 'Gross Clinical Billed',
      badge: 'Total Evaluated',
      badgeClass: 'badge-cyan',
      color: 'var(--accent-cyan)',
      bg: 'linear-gradient(145deg, rgba(6, 182, 212, 0.12) 0%, rgba(20, 8, 32, 0.85) 100%)',
      border: 'rgba(6, 182, 212, 0.35)',
      value: `₹${incomeData ? incomeData.grossBilled.toLocaleString() : '0'}`,
      icon: TrendingUp,
      subText: 'Evaluated Doctor Fees'
    },
    {
      label: 'Recovery Ratio',
      badge: 'Health',
      badgeClass: 'badge-homevisit',
      color: 'var(--accent-purple)',
      bg: 'linear-gradient(145deg, rgba(168, 85, 247, 0.12) 0%, rgba(20, 8, 32, 0.85) 100%)',
      border: 'rgba(168, 85, 247, 0.35)',
      value: `${incomeData ? incomeData.collectionRate : 100}%`,
      progressBar: true
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Whitelist Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1))', borderColor: 'var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-homevisit" style={{ fontSize: '0.72rem' }}>
                🛡️ Admin Home Page
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                Chief Medical Authority
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', fontWeight: '800' }}>
              <ShieldCheck size={22} />
              <h2 style={{ fontSize: '1.4rem' }}>Healix Clinic Admin &amp; Doctor Home Portal</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Authenticated Doctor: <strong style={{ color: 'var(--text-main)' }}>{currentUser.fullName}</strong> (<code>{currentUser.email}</code>)
            </p>
          </div>
          <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 1. Symmetrical Executive Command Grid */}
      <div className="admin-command-grid">
        {commandTiles.map(tile => {
          const Icon = tile.icon;
          const isActive = activeTab === tile.id;
          return (
            <div 
              key={tile.id}
              className={`admin-command-tile ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tile.id)}
              style={{
                borderColor: isActive ? tile.color : (tile.id === 'income' ? 'rgba(251, 191, 36, 0.35)' : 'var(--border-color)'),
                background: isActive ? `linear-gradient(145deg, rgba(217, 27, 118, 0.16) 0%, rgba(20, 8, 32, 0.95) 100%)` : undefined
              }}
              title={tile.tooltip}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: tile.color }}>
                  <Icon size={17} />
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {tile.title}
                  </span>
                </div>
                {isActive ? (
                  <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem' }}>
                    Active ●
                  </span>
                ) : (
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Manage &rarr;</span>
                )}
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: '900', color: tile.color, marginTop: '0.35rem', lineHeight: '1.2' }}>
                {tile.mainVal}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {tile.subText}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Unified Navigation Bar */}
      <div className="card" style={{ padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`admin-nav-pill ${isActive ? 'active' : ''}`}
                style={isActive ? {
                  background: tab.id === 'income' ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.35) 100%)' : tab.bg,
                  borderColor: tab.color,
                  color: tab.id === 'income' ? '#fbbf24' : '#ffffff'
                } : (tab.id === 'income' ? { color: 'var(--accent-gold)' } : undefined)}
              >
                <Icon size={15} color={isActive ? tab.color : 'var(--text-muted)'} />
                <span>{tab.label}</span>
                <span 
                  className="badge" 
                  style={{ 
                    fontSize: '0.68rem', 
                    padding: '0.1rem 0.45rem', 
                    background: isActive ? tab.bg : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Active Section:</span>
            <strong style={{ color: '#ffffff' }}>
              {activeTab === 'appointments' && 'Bookings & Dispatches'}
              {activeTab === 'income' && 'Income & Revenue Portal'}
              {activeTab === 'patients' && 'Patient Medical Charts'}
              {activeTab === 'timings' && 'Clinic Operating Schedule'}
              {activeTab === 'nurses' && 'Nurse Station Personnel'}
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: APPOINTMENTS & SESSIONS                            */}
      {/* ========================================================= */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '350px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search patient, phone, or address..." 
                className="form-input"
                style={{ padding: '0.4rem 0.75rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Treatment Mode Filter:</span>
                <select 
                  className="form-select"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                  value={filterVisitType}
                  onChange={(e) => setFilterVisitType(e.target.value)}
                >
                  <option value="All">All Visit Types</option>
                  <option value="In-Clinic">In-Clinic Visits Only</option>
                  <option value="Home-Visit">Home Visit Requests Only</option>
                </select>
              </div>

              <button 
                onClick={handleOpenBookSlotModal}
                className="btn btn-cyan btn-sm"
                style={{ fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
                title="Directly book a patient appointment slot and configure session fee"
              >
                <Plus size={16} />
                <span>Book Patient Slot &amp; Set Fee</span>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Treatment Way</th>
                    <th>Patient Name & Phone</th>
                    <th>Treatment Service</th>
                    <th>Booked Date & Timing Slot</th>
                    <th style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', minWidth: '220px' }}>
                      📍 Home Visit Address Column
                    </th>
                    <th>Assigned Physio</th>
                    <th style={{ minWidth: '130px', color: 'var(--accent-gold)' }}>Session Fee (₹)</th>
                    <th>Status Action</th>
                    <th style={{ minWidth: '120px' }}>Manage Slot</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No appointment records match filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map(apt => (
                      <tr key={apt.id}>
                        <td>
                          <span className={`badge ${apt.isHomeVisit ? 'badge-homevisit' : 'badge-cyan'}`}>
                            {apt.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{apt.patientName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patientPhone}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {apt.serviceName}
                          {apt.nurseNotes && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: '600', marginTop: '0.2rem' }}>
                              🩺 Nurse note: {apt.nurseNotes}
                            </div>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', minWidth: '135px' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{apt.date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.timeSlot}</div>
                          <button
                            type="button"
                            onClick={() => handleOpenManageSlotModal(apt)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              marginTop: '0.35rem',
                              padding: '0.18rem 0.45rem',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              color: 'var(--accent-cyan)',
                              borderColor: 'rgba(6, 182, 212, 0.35)',
                              background: 'rgba(6, 182, 212, 0.08)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Reschedule slot date or time for patient"
                          >
                            <Clock size={11} />
                            <span>Reschedule</span>
                          </button>
                        </td>

                        <td style={{ background: apt.isHomeVisit ? 'rgba(168, 85, 247, 0.04)' : 'transparent' }}>
                          {apt.isHomeVisit ? (
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-purple)' }}>
                                {apt.homeAddress}
                              </div>
                              {apt.landmark && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  Landmark: <strong>{apt.landmark}</strong>
                                </div>
                              )}
                              {apt.locationUrl && (
                                <div style={{ marginTop: '0.25rem' }}>
                                  <a
                                    href={apt.locationUrl.startsWith('http') ? apt.locationUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.locationUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  >
                                    📍 Open Google Maps Directions ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                              In-Clinic Session (Healix Clinic Center)
                            </span>
                          )}
                        </td>

                        <td>
                          <select 
                            className="form-select"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', width: '160px' }}
                            value={apt.assignedPhysio || 'Dr. Joel Calvin C'}
                            onChange={(e) => handleUpdateAptStatus(apt.id, apt.status, e.target.value)}
                          >
                            <option value="Dr. Joel Calvin C">Dr. Joel Calvin C (Doctor)</option>
                            {nurses.filter(n => n.status !== 'Resigned' && n.status !== 'Inactive').map(n => (
                              <option key={n.id} value={n.fullName}>
                                {n.fullName} ({n.shift ? n.shift.split(' ')[0] : 'Nurse'})
                              </option>
                            ))}
                            {apt.assignedPhysio && apt.assignedPhysio !== 'Dr. Joel Calvin C' && !nurses.some(n => n.fullName === apt.assignedPhysio) && (
                              <option value={apt.assignedPhysio}>{apt.assignedPhysio}</option>
                            )}
                          </select>
                        </td>

                        <td style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>
                          {(apt.customAmount !== undefined || apt.amount !== undefined) ? (
                            <>
                              <div style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '1rem', letterSpacing: '0.01em' }}>
                                ₹{Number(apt.customAmount !== undefined ? apt.customAmount : apt.amount).toLocaleString()}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', whiteSpace: 'nowrap', fontWeight: '700' }}>
                                  🩺 Doctor Set
                                </span>
                                <span className={`badge ${apt.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', whiteSpace: 'nowrap' }}>
                                  {apt.paymentStatus === 'PAID' ? '✓ Paid' : '● Due'}
                                </span>
                              </div>
                              {apt.feeNote && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', opacity: 0.9, marginTop: '0.2rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apt.feeNote}>
                                  📝 {apt.feeNote}
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenFeeModal(apt)}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  marginTop: '0.35rem',
                                  padding: '0.22rem 0.55rem',
                                  fontSize: '0.74rem',
                                  fontWeight: '700',
                                  color: 'var(--accent-gold)',
                                  borderColor: 'rgba(251, 191, 36, 0.45)',
                                  background: 'rgba(251, 191, 36, 0.08)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Edit patient session fee"
                              >
                                <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>₹</span>
                                <span>Edit Fee (₹)</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ color: 'var(--accent-gold)', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span>⏳ Fee Pending</span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                Set after treatment
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenFeeModal(apt)}
                                className="btn btn-sm"
                                style={{
                                  marginTop: '0.35rem',
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.74rem',
                                  fontWeight: '800',
                                  color: '#0e0618',
                                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer'
                                }}
                                title="Set consultation fee after treatment"
                              >
                                <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>₹</span>
                                <span>Set Fee Post-Treatment</span>
                              </button>
                            </>
                          )}
                        </td>

                        <td>
                          <select 
                            className="form-select"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', width: '150px' }}
                            value={apt.status}
                            onChange={(e) => handleUpdateAptStatus(apt.id, e.target.value, apt.assignedPhysio)}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending Dispatch">Pending Dispatch</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenManageSlotModal(apt)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '0.32rem 0.65rem',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              color: '#ffffff',
                              borderColor: 'var(--accent-purple)',
                              background: 'rgba(121, 26, 156, 0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              whiteSpace: 'nowrap'
                            }}
                            title="Manage patient slot booking, reschedule date/time, or configure fee"
                          >
                            <Sliders size={13} color="var(--accent-purple)" />
                            <span>Manage Slot</span>
                          </button>
                        </td>

                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Delete appointment"
                            style={{ color: 'var(--accent-red)' }}
                            onClick={() => handleDeleteAppointment(apt.id, apt.patientName)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PATIENT MEDICAL ROSTER                             */}
      {/* ========================================================= */}
      {activeTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Patient Records & Booking Roster</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Admin management for patient records, contact details, treatment mode, and booked timings.
              </p>
            </div>

            <button onClick={() => setIsAddPatientOpen(true)} className="btn btn-cyan btn-sm">
              <Plus size={14} /> Add Patient Record
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Phone Contact Number</th>
                    <th>Treatment Way (Way of Treatment)</th>
                    <th>Booked Date & Timing Slot</th>
                    <th style={{ textAlign: 'right' }}>Admin Management</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => {
                    const patientApt = appointments.find(a => a.patientId === p.id || a.patientName === p.fullName);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.fullName}</td>
                        <td>{p.age} yrs / {p.gender}</td>
                        <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.phone}</td>
                        <td>
                          <span className={`badge ${patientApt?.isHomeVisit ? 'badge-homevisit' : 'badge-cyan'}`}>
                            {patientApt?.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                          </span>
                        </td>
                        <td>
                          {patientApt ? (
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                                {patientApt.date}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {patientApt.timeSlot}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Active Booking</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => setEditingPatient(p)} 
                              className="btn btn-secondary btn-sm"
                              title="Edit Patient Details"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeletePatient(p.id, p.fullName)} 
                              className="btn btn-danger btn-sm"
                              title="Remove Patient Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TIMINGS MANAGER                                    */}
      {/* ========================================================= */}
      {activeTab === 'timings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Clinic Timings & Operating Schedule Manager</h3>
            <button onClick={() => setIsAddSlotOpen(true)} className="btn btn-cyan btn-sm">
              <Plus size={14} /> Add Timing Slot
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Schedule Day</th>
                    <th>Time Slot Label</th>
                    <th>Max Patient Capacity</th>
                    <th>Booked Count</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Toggle Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {timings.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: '600' }}>{t.day}</td>
                      <td style={{ fontWeight: '800', color: 'var(--accent-cyan)' }}>{t.timeSlot}</td>
                      <td>{t.maxCapacity} Patients</td>
                      <td>{t.booked} Booked</td>
                      <td>
                        <span className={`badge ${t.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                          {t.isAvailable ? 'Available' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleToggleSlot(t.id)} className="btn btn-secondary btn-sm">
                          {t.isAvailable ? 'Block Slot' : 'Unblock Slot'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: NURSE STAFF & PORTAL MANAGEMENT                    */}
      {/* ========================================================= */}
      {activeTab === 'nurses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--accent-magenta, #d91b76)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <Stethoscope size={18} color="var(--accent-magenta, #d91b76)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Nurse Station Staff Management &amp; Portal
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Onboard, manage duty schedules, view portal access passwords, and govern clinical nursing staff.
              </p>
            </div>
            <button 
              onClick={() => setIsAddNurseOpen(true)}
              className="btn btn-cyan btn-sm"
              style={{ background: 'linear-gradient(135deg, #d91b76, #9333ea)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
            >
              <Plus size={15} />
              <span>Onboard New Nurse</span>
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Portal Username & Email</th>
                    <th>Assigned Shift</th>
                    <th>Supervising Doctor</th>
                    <th>Portal Credentials</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Duty Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nurses.map(nurse => {
                    const isResigned = nurse.status === 'Resigned' || nurse.status === 'Inactive';
                    const showPass = showNursePasswords[nurse.id];
                    return (
                      <tr key={nurse.id} style={{ opacity: isResigned ? 0.6 : 1 }}>
                        <td>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: isResigned ? 'var(--text-muted)' : '#ffffff' }}>
                            {nurse.fullName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{nurse.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>@{nurse.username}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{nurse.email}</div>
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>{nurse.shift}</span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{nurse.supervisingDoctor}</td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8rem', letterSpacing: showPass ? '0' : '2px' }}>
                              {showPass ? (nurse.password || '1234') : '••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowNursePasswords(p => ({ ...p, [nurse.id]: !p[nurse.id] }))}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                            >
                              {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${nurse.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                            {nurse.status === 'Active' ? '● On Active Duty' : '● Resigned'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => setEditingNurse(nurse)}
                              className="btn btn-secondary btn-sm"
                              title="Edit nurse profile"
                            >
                              <Edit size={13} />
                              <span>Edit</span>
                            </button>
                            {isResigned ? (
                              <button
                                onClick={() => handleReactivateNurse(nurse)}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#34d399', borderColor: '#10b981' }}
                                title="Reactivate duty"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => setQuittingNurse(nurse)}
                                className="btn btn-danger btn-sm"
                                title="Process nurse exit/resignation"
                              >
                                Resign
                              </button>
                            )}
                            <button
                              onClick={() => handlePermanentDeleteNurse(nurse)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#f87171' }}
                              title="Delete permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: INCOME & REVENUE PORTAL                            */}
      {/* ========================================================= */}
      {activeTab === 'income' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header Banner */}
          <div 
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 14, 110, 0.45) 0%, rgba(121, 26, 156, 0.25) 50%, rgba(251, 191, 36, 0.12) 100%)',
              borderColor: 'rgba(251, 191, 36, 0.45)',
              padding: '1.75rem 2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>💰 Clinical Financial Accounts</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>🔒 Real-Time Audited Revenue</span>
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CreditCard size={28} color="var(--accent-gold, #fbbf24)" />
                  <span>Healix Clinic Income &amp; Revenue Portal</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem', maxWidth: '850px', lineHeight: '1.5' }}>
                  Complete audit of clinical revenue generated, list of patients paid and pending dues, supervised by <strong>{currentUser.fullName}</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button onClick={fetchAdminData} disabled={loading} className="btn btn-secondary btn-sm" title="Refresh financial ledger">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Sync Ledger</span>
                </button>
                <button onClick={() => window.print()} className="btn btn-secondary btn-sm" title="Print official financial summary">
                  <Printer size={14} />
                  <span>Print Summary</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {kpiCards.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="card" style={{ background: kpi.bg, borderColor: kpi.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: kpi.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {kpi.label}
                    </span>
                    <span className={`badge ${kpi.badgeClass}`} style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem' }}>
                      {kpi.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.95rem', fontWeight: '900', color: kpi.color, marginTop: '0.4rem', lineHeight: '1.1' }}>
                    {kpi.value}
                  </div>
                  {kpi.progressBar ? (
                    <div style={{ marginTop: '0.45rem' }}>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${incomeData ? incomeData.collectionRate : 100}%`, height: '100%', background: 'linear-gradient(90deg, #34d399, #a855f7)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {Icon && <Icon size={12} color={kpi.color} />}
                      <span>{kpi.subText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="card" style={{ padding: '0.9rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'calendar', label: '📅 Revenue Calendar (Daily & Monthly)', icon: CalendarDays, color: 'var(--accent-gold)' },
                  { id: 'paid', label: `🟢 Patients Paid (${allPaidPatients.length})`, icon: CheckCircle2, color: '#34d399' },
                  { id: 'unpaid', label: `🔴 Patients Not Paid (${allUnpaidPatients.length})`, icon: Clock, color: 'var(--accent-gold)' },
                  { id: 'all', label: `All Invoices (${allPaidPatients.length + allUnpaidPatients.length})`, icon: FileText, color: 'var(--accent-cyan)' },
                  { id: 'analytics', label: '📊 Revenue Analytics', icon: TrendingUp, color: 'var(--accent-purple)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setIncomeSubTab(tab.id)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      borderColor: incomeSubTab === tab.id ? tab.color : 'var(--border-color)',
                      background: incomeSubTab === tab.id ? 'rgba(255, 255, 255, 0.12)' : 'var(--bg-input)',
                      color: incomeSubTab === tab.id ? tab.color : 'var(--text-muted)',
                      fontWeight: incomeSubTab === tab.id ? '800' : '600'
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '260px' }}>
                  <Search size={15} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search patient, phone, service..."
                    className="form-input"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    value={incomeSearch}
                    onChange={(e) => setIncomeSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                  value={incomeModeFilter}
                  onChange={(e) => setIncomeModeFilter(e.target.value)}
                >
                  <option value="All">All Visit Modes</option>
                  <option value="In-Clinic">In-Clinic Only</option>
                  <option value="Home-Visit">Home Visit Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: REVENUE CALENDAR */}
          {incomeSubTab === 'calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={handlePrevMonth} className="btn btn-secondary btn-sm"><ChevronLeft size={16} /></button>
                  <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--accent-gold)', minWidth: '180px', textAlign: 'center' }}>
                    {monthNames[calendarMonth]} {calendarYear}
                  </div>
                  <button onClick={handleNextMonth} className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
                  <button onClick={handleJumpToToday} className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem', fontSize: '0.74rem' }}>Today</button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setCalendarViewMode('grid')} className="btn btn-secondary btn-sm" style={{ background: calendarViewMode === 'grid' ? 'rgba(251, 191, 36, 0.2)' : undefined, color: calendarViewMode === 'grid' ? 'var(--accent-gold)' : undefined }}>Grid</button>
                  <button onClick={() => setCalendarViewMode('ledger')} className="btn btn-secondary btn-sm" style={{ background: calendarViewMode === 'ledger' ? 'rgba(251, 191, 36, 0.2)' : undefined, color: calendarViewMode === 'ledger' ? 'var(--accent-gold)' : undefined }}>Monthly Table</button>
                </div>
              </div>

              {calendarViewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.45rem' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem 0' }}>{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const dayNum = i - firstDay + 1;
                    if (dayNum < 1 || dayNum > daysInMonth) {
                      return <div key={i} style={{ minHeight: '75px', opacity: 0.15, background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} />;
                    }
                    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayData = dailyPaidMap[dateStr];
                    const isSelected = selectedCalendarDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        style={{
                          minHeight: '80px',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--accent-gold)' : (isToday ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.06)'),
                          background: isSelected ? 'rgba(251, 191, 36, 0.15)' : (dayData ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)'),
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.85rem', color: isToday ? 'var(--accent-cyan)' : '#ffffff' }}>{dayNum}</span>
                          {isToday && <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: '800' }}>TODAY</span>}
                        </div>
                        {dayData ? (
                          <div>
                            <div style={{ fontWeight: '900', fontSize: '0.85rem', color: '#34d399' }}>₹{dayData.total.toLocaleString()}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{dayData.count} sessions</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.1)' }}>—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card">
                  <div className="table-container">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Total Revenue Settled</th>
                          <th>Number of Sessions</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMonthStats.daysInMonthList.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No settled payments recorded for {monthNames[calendarMonth]} {calendarYear}.</td></tr>
                        ) : (
                          currentMonthStats.daysInMonthList.map(item => (
                            <tr key={item.date}>
                              <td style={{ fontWeight: '700' }}>{item.date}</td>
                              <td style={{ fontWeight: '900', color: '#34d399' }}>₹{item.total.toLocaleString()}</td>
                              <td>{item.count} Paid Sessions</td>
                              <td><span className="badge badge-success">● Audited</span></td>
                              <td style={{ textAlign: 'right' }}>
                                <button onClick={() => setSelectedCalendarDate(item.date)} className="btn btn-secondary btn-sm">Inspect Day</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Selected Day Ledger */}
              <div className="card" style={{ borderColor: 'var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--accent-gold)' }}>
                      Daily Financial Ledger: {selectedCalendarDate}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      Itemized breakdown of patients treated and fees settled on this date
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#34d399' }}>₹{selectedDayData.total.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedDayData.count} Completed Sessions</div>
                  </div>
                </div>

                {selectedDayData.items.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No patient transactions recorded on {selectedCalendarDate}.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Patient Name &amp; Phone</th>
                          <th>Therapy Service</th>
                          <th>Treatment Mode</th>
                          <th>Settled Amount</th>
                          <th>Payment Method</th>
                          <th style={{ textAlign: 'right' }}>Digital Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDayData.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: '800' }}>{item.patientName}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.patientPhone}</div>
                            </td>
                            <td>{item.serviceName}</td>
                            <td>
                              <span className={`badge ${item.isHomeVisit ? 'badge-homevisit' : 'badge-cyan'}`}>
                                {item.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                              </span>
                            </td>
                            <td style={{ fontWeight: '900', color: '#34d399', fontSize: '0.95rem' }}>
                              ₹{Number(item.amount || 0).toLocaleString()}
                            </td>
                            <td>
                              <span className="badge badge-gold">{item.methodLabel || item.paymentMethod}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button onClick={() => setViewingReceipt(item)} className="btn btn-secondary btn-sm">
                                <FileText size={13} /> View Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: PATIENTS PAID */}
          {incomeSubTab === 'paid' && (
            <div className="card">
              <div className="table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Patient Name &amp; Phone</th>
                      <th>Service &amp; Mode</th>
                      <th>Date &amp; Time Settled</th>
                      <th>Method</th>
                      <th>Settled Fee (₹)</th>
                      <th>Transaction ID / Invoice</th>
                      <th style={{ textAlign: 'right' }}>Receipt Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPaidPatients.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No paid patient records match filter.</td></tr>
                    ) : (
                      filteredPaidPatients.map((p, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: '800' }}>{p.patientName}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.patientPhone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{p.serviceName}</div>
                            <span className={`badge ${p.isHomeVisit ? 'badge-homevisit' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                              {p.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{p.paidAt ? p.paidAt.split('T')[0] : p.date}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.timeSlot || 'Settled'}</div>
                          </td>
                          <td><span className="badge badge-gold">{p.methodLabel || p.paymentMethod}</span></td>
                          <td style={{ fontWeight: '900', color: '#34d399', fontSize: '1rem' }}>₹{Number(p.amount || 0).toLocaleString()}</td>
                          <td>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>{p.txnId || 'TXN-SETTLED'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.invoiceNo || 'INV-2026'}</div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => setViewingReceipt(p)} className="btn btn-secondary btn-sm" title="View receipt">
                                <FileText size={13} />
                              </button>
                              <button onClick={() => handleDownloadReceiptHtml(p)} className="btn btn-cyan btn-sm" title="Download HTML">
                                <Download size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: PATIENTS NOT PAID */}
          {incomeSubTab === 'unpaid' && (
            <div className="card">
              <div className="table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Patient Name &amp; Phone</th>
                      <th>Treatment Service</th>
                      <th>Booked Date &amp; Slot</th>
                      <th>Post-Treatment Fee (₹)</th>
                      <th>Doctor Note</th>
                      <th style={{ textAlign: 'right' }}>Front Desk Collection Desk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnpaidPatients.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No unpaid patients with pending fee dues found.</td></tr>
                    ) : (
                      filteredUnpaidPatients.map((u, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: '800' }}>{u.patientName}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.patientPhone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{u.serviceName}</div>
                            <span className={`badge ${u.isHomeVisit ? 'badge-homevisit' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                              {u.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{u.date}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.timeSlot}</div>
                          </td>
                          <td style={{ fontWeight: '900', color: 'var(--accent-gold)', fontSize: '1.05rem' }}>
                            ₹{Number(u.amount || 0).toLocaleString()}
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {u.feeNote || 'Consultation fee active'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenCollectModal(u)}
                              className="btn btn-gold btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '800' }}
                            >
                              <CreditCard size={14} />
                              <span>Collect Payment Desk</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: ALL INVOICES */}
          {incomeSubTab === 'all' && (
            <div className="card">
              <div className="table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...allPaidPatients, ...allUnpaidPatients].map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700' }}>{item.patientName}</td>
                        <td>{item.serviceName}</td>
                        <td>{item.date || item.paidAt?.split('T')[0]}</td>
                        <td style={{ fontWeight: '800', color: item.status === 'PAID' ? '#34d399' : 'var(--accent-gold)' }}>
                          ₹{Number(item.amount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${item.status === 'PAID' ? 'badge-success' : 'badge-gold'}`}>
                            {item.status === 'PAID' ? '✓ Paid' : '● Due'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {item.status === 'PAID' ? (
                            <button onClick={() => setViewingReceipt(item)} className="btn btn-secondary btn-sm">Receipt</button>
                          ) : (
                            <button onClick={() => handleOpenCollectModal(item)} className="btn btn-gold btn-sm">Collect</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 5: ANALYTICS */}
          {incomeSubTab === 'analytics' && incomeData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div className="card">
                <h4 style={{ fontWeight: '800', marginBottom: '0.85rem' }}>Breakdown by Therapy Service</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(incomeData.breakdownByService || []).map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{s.serviceName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.paidCount} paid sessions</div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: '900', color: '#34d399' }}>₹{s.paidRevenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 style={{ fontWeight: '800', marginBottom: '0.85rem' }}>Breakdown by Treatment Mode</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {Object.entries(incomeData.breakdownByMode || {}).map(([mode, data]) => (
                    <div key={mode} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{mode}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.paidCount} completed visits</div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: '900', color: 'var(--accent-cyan)' }}>₹{data.paidRevenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* MODAL 1: ADD PATIENT */}
      <PatientFormModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        initialData={{ fullName: '', email: '', phone: '+91 ', age: '30', gender: 'Male', address: '', medicalCondition: '' }}
        onSubmit={handleAddPatientSubmit}
        isEditing={false}
      />

      {/* MODAL 2: EDIT PATIENT */}
      <PatientFormModal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        initialData={editingPatient}
        onSubmit={handleEditPatientSubmit}
        isEditing={true}
      />

      {/* MODAL 3: ADD TIMING SLOT */}
      <ModalOverlay
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Add Clinic Operating Slot"
        subtitle="Configure consultation timetable"
        icon={Clock}
        iconColor="var(--accent-green)"
      >
        <form onSubmit={handleAddSlot}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem 0' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Operating Day Range *</label>
              <input required className="form-input" value={slotForm.day} onChange={e => setSlotForm(p => ({ ...p, day: e.target.value }))} placeholder="Monday - Saturday" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Time Slot Label *</label>
              <input required className="form-input" value={slotForm.timeSlot} onChange={e => setSlotForm(p => ({ ...p, timeSlot: e.target.value }))} placeholder="09:00 AM - 10:00 AM" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Max Patient Capacity</label>
              <input type="number" min="1" max="20" className="form-input" value={slotForm.maxCapacity} onChange={e => setSlotForm(p => ({ ...p, maxCapacity: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
            <button type="button" onClick={() => setIsAddSlotOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-cyan">Add Slot</button>
          </div>
        </form>
      </ModalOverlay>

      {/* MODAL 4: ONBOARD NURSE */}
      <NurseFormModal
        isOpen={isAddNurseOpen}
        onClose={() => setIsAddNurseOpen(false)}
        initialData={{ fullName: '', email: '', username: '', password: '', phone: '+91 ', shift: 'Morning (08:00 AM - 02:00 PM)', supervisingDoctor: 'Dr. Calvin Joel (Chief Physiotherapist)', notes: '' }}
        onSubmit={handleAddNurseSubmit}
        isEditing={false}
      />

      {/* MODAL 5: EDIT NURSE */}
      <NurseFormModal
        isOpen={!!editingNurse}
        onClose={() => setEditingNurse(null)}
        initialData={editingNurse}
        onSubmit={handleUpdateNurseSubmit}
        isEditing={true}
      />

      {/* MODAL 6: RESIGN NURSE */}
      <ModalOverlay
        isOpen={!!quittingNurse}
        onClose={() => setQuittingNurse(null)}
        title="Confirm Nurse Exit / Revoke Access"
        subtitle={`Process resignation for ${quittingNurse?.fullName}`}
        icon={Trash2}
        iconColor="var(--accent-red)"
        borderColor="var(--accent-red)"
      >
        <div className="modal-body" style={{ padding: '1rem 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Are you sure you want to revoke portal credentials and mark <strong>{quittingNurse?.fullName}</strong> as Resigned?
          </p>
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Reason for Resignation</label>
            <input className="form-input" value={quitReason} onChange={e => setQuitReason(e.target.value)} placeholder="e.g. Relocating, Personal reasons" />
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
          <button type="button" onClick={() => setQuittingNurse(null)} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleConfirmResignNurse} className="btn btn-danger">Confirm Resignation</button>
        </div>
      </ModalOverlay>

      {/* MODAL 7: DOCTOR POST-TREATMENT FEE */}
      <ModalOverlay
        isOpen={!!feeModalApt}
        onClose={() => setFeeModalApt(null)}
        title="🩺 Set Post-Treatment Patient Fee (₹ INR)"
        subtitle="Configure consultation fee and payment status once treatment is conducted"
        icon={CreditCard}
        iconColor="var(--accent-gold)"
        borderColor="var(--accent-gold)"
      >
        {feeModalApt && (
          <form onSubmit={handleSaveIndividualFee}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 0' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: '#ffffff' }}>{feeModalApt.patientName}</span>
                  <span className={`badge ${feeModalApt.isHomeVisit ? 'badge-homevisit' : 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                    {feeModalApt.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>{feeModalApt.serviceName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Date: {feeModalApt.date} • Slot: {feeModalApt.timeSlot}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>Individual Session Fee (₹ INR) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: 'var(--accent-gold)', fontSize: '1.25rem' }}>₹</span>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="50"
                    className="form-input"
                    style={{ paddingLeft: '34px', fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-gold)' }}
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: '700' }}>Quick Adjust Amount</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {[-200, -100, 100, 200, 500].map(delta => (
                    <button key={delta} type="button" onClick={() => handleAdjustFee(delta)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                      {delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Clinical Fee Note / Diagnosis</label>
                <input className="form-input" value={feeNoteInput} onChange={e => setFeeNoteInput(e.target.value)} placeholder="e.g. Post-treatment lumbar therapy fee" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Patient Payment Settlement Status</label>
                <select className="form-select" value={feePaymentStatus} onChange={e => setFeePaymentStatus(e.target.value)}>
                  <option value="DUE">● Payment Due (Patient will settle fee)</option>
                  <option value="PAID">✓ Already Settled &amp; Paid</option>
                </select>
              </div>

              {feeModalApt.customAmount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.06)', border: '1px dashed rgba(239, 68, 68, 0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revert back to standard rate: ₹{(feeModalApt.isHomeVisit ? 1875 : 1200).toLocaleString()}</div>
                  <button type="button" onClick={handleResetToStandardFee} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>↺ Reset</button>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid rgba(251, 191, 36, 0.25)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
              <button type="button" onClick={() => setFeeModalApt(null)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={feeSaving} className="btn btn-gold">
                {feeSaving ? 'Saving Fee...' : `Save Fee: ₹${Number(feeInput || 0).toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </ModalOverlay>

      {/* MODAL 8: ADMIN BOOK PATIENT SLOT & SET FEE */}
      <ModalOverlay
        isOpen={isBookSlotOpen}
        onClose={() => setIsBookSlotOpen(false)}
        title="Book Patient Slot & Set Session Fee"
        subtitle="Direct clinical slot booking & pricing configuration by Attending Doctor"
        icon={CalendarCheck}
        iconColor="var(--accent-cyan)"
        borderColor="var(--accent-cyan)"
        maxWidth="650px"
      >
        <form onSubmit={handleSubmitAdminBooking}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ fontWeight: '700', margin: 0 }}>Patient Details *</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setAdminBookingForm(p => ({ ...p, patientMode: 'existing' }))}
                  className="btn btn-secondary btn-sm"
                  style={{ color: adminBookingForm.patientMode === 'existing' ? 'var(--accent-cyan)' : undefined }}
                >
                  Registered Patient ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminBookingForm(p => ({ ...p, patientMode: 'new', patientId: '' }))}
                  className="btn btn-secondary btn-sm"
                  style={{ color: adminBookingForm.patientMode === 'new' ? 'var(--accent-cyan)' : undefined }}
                >
                  + New Walk-In
                </button>
              </div>
            </div>

            {adminBookingForm.patientMode === 'existing' && patients.length > 0 ? (
              <select className="form-select" value={adminBookingForm.patientId} onChange={(e) => handlePatientSelectChange(e.target.value)} required>
                <option value="">-- Choose Patient from Chart Registry --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} • {p.phone}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input required className="form-input" placeholder="Full Name *" value={adminBookingForm.patientName} onChange={e => setAdminBookingForm(p => ({ ...p, patientName: e.target.value }))} />
                <input required className="form-input" placeholder="Phone Number *" value={adminBookingForm.patientPhone} onChange={e => setAdminBookingForm(p => ({ ...p, patientPhone: e.target.value }))} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Appointment Date *</label>
                <input type="date" required className="form-input" value={adminBookingForm.date} onChange={e => setAdminBookingForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Operating Time Slot *</label>
                <select className="form-select" value={adminBookingForm.timeSlot} onChange={e => setAdminBookingForm(p => ({ ...p, timeSlot: e.target.value }))} required>
                  <option value="">-- Select Time Slot --</option>
                  {timings.map(t => (
                    <option key={t.id} value={t.timeSlot} disabled={!t.isAvailable || t.booked >= t.maxCapacity}>
                      {t.timeSlot} ({t.booked}/{t.maxCapacity} booked){!t.isAvailable ? ' - BLOCKED' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Visit Type</label>
                <select className="form-select" value={adminBookingForm.visitType} onChange={e => setAdminBookingForm(p => ({ ...p, visitType: e.target.value }))}>
                  <option value="In-Clinic">🏥 In-Clinic Session</option>
                  <option value="Home-Visit">🚗 Home Visit Session</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Attending Physio</label>
                <select className="form-select" value={adminBookingForm.assignedPhysio} onChange={e => setAdminBookingForm(p => ({ ...p, assignedPhysio: e.target.value }))}>
                  <option value="Dr. Joel Calvin C">Dr. Joel Calvin C (Lead Physio)</option>
                  {nurses.filter(n => n.status === 'Active').map(n => (
                    <option key={n.id} value={n.fullName}>{n.fullName} (Nurse)</option>
                  ))}
                </select>
              </div>
            </div>

            {adminBookingForm.visitType === 'Home-Visit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.08)', padding: '0.75rem', borderRadius: '8px' }}>
                <input required className="form-input" placeholder="Home Address *" value={adminBookingForm.homeAddress} onChange={e => setAdminBookingForm(p => ({ ...p, homeAddress: e.target.value }))} />
                <input className="form-input" placeholder="Landmark (e.g. Near Metro)" value={adminBookingForm.landmark} onChange={e => setAdminBookingForm(p => ({ ...p, landmark: e.target.value }))} />
                <input className="form-input" placeholder="Google Maps URL" value={adminBookingForm.locationUrl} onChange={e => setAdminBookingForm(p => ({ ...p, locationUrl: e.target.value }))} />
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: 'var(--accent-gold)' }}>Doctor-Configured Session Fee (₹ INR) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: 'var(--accent-gold)' }}>₹</span>
                <input type="number" required min="0" step="50" className="form-input" style={{ paddingLeft: '32px', color: 'var(--accent-gold)', fontWeight: '900' }} value={adminBookingForm.customFee} onChange={e => setAdminBookingForm(p => ({ ...p, customFee: e.target.value }))} />
              </div>
            </div>
            <PresetFeeChips onSelect={(val) => setAdminBookingForm(p => ({ ...p, customFee: val }))} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input className="form-input" placeholder="Fee note (e.g. Standard consultation)" value={adminBookingForm.feeNote} onChange={e => setAdminBookingForm(p => ({ ...p, feeNote: e.target.value }))} />
              <select className="form-select" value={adminBookingForm.paymentStatus} onChange={e => setAdminBookingForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                <option value="DUE">● Payment Due</option>
                <option value="PAID">✓ Paid in Advance</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
            <button type="button" onClick={() => setIsBookSlotOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={bookingSubmitting} className="btn btn-cyan">
              {bookingSubmitting ? 'Booking Slot...' : `Confirm Booking • Fee: ₹${Number(adminBookingForm.customFee || 0).toLocaleString()}`}
            </button>
          </div>
        </form>
      </ModalOverlay>

      {/* MODAL 9: MANAGE & RESCHEDULE SLOT */}
      <ModalOverlay
        isOpen={!!managingSlotApt}
        onClose={() => setManagingSlotApt(null)}
        title="Manage Patient Slot & Reschedule"
        subtitle={`Update timing slot, session fee, or clinical dispatch for ${managingSlotApt?.patientName}`}
        icon={Sliders}
        iconColor="var(--accent-purple)"
        borderColor="var(--accent-purple)"
        maxWidth="640px"
      >
        {managingSlotApt && (
          <form onSubmit={handleSubmitManageSlot}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '70vh', overflowY: 'auto', padding: '1rem 0' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '800' }}>{managingSlotApt.patientName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{managingSlotApt.patientPhone}</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold)' }}>
                  Current Fee: ₹{(managingSlotApt.customAmount !== undefined ? managingSlotApt.customAmount : (managingSlotApt.isHomeVisit ? 1875 : 1200)).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reschedule Date *</label>
                  <input type="date" required className="form-input" value={manageSlotForm.date} onChange={e => setManageSlotForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reschedule Time Slot *</label>
                  <select className="form-select" value={manageSlotForm.timeSlot} onChange={e => setManageSlotForm(p => ({ ...p, timeSlot: e.target.value }))} required>
                    {timings.map(t => (
                      <option key={t.id} value={t.timeSlot} disabled={!t.isAvailable || (t.booked >= t.maxCapacity && t.timeSlot !== managingSlotApt.timeSlot)}>
                        {t.timeSlot} ({t.booked}/{t.maxCapacity} booked)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Attending Physio</label>
                  <select className="form-select" value={manageSlotForm.assignedPhysio} onChange={e => setManageSlotForm(p => ({ ...p, assignedPhysio: e.target.value }))}>
                    <option value="Dr. Joel Calvin C">Dr. Joel Calvin C (Lead Physio)</option>
                    {nurses.filter(n => n.status === 'Active').map(n => (
                      <option key={n.id} value={n.fullName}>{n.fullName} (Nurse)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Appointment Status</label>
                  <select className="form-select" value={manageSlotForm.status} onChange={e => setManageSlotForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending Dispatch">Pending Dispatch</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--accent-gold)' }}>Adjust Session Fee (₹ INR)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: 'var(--accent-gold)' }}>₹</span>
                  <input type="number" min="0" step="50" className="form-input" style={{ paddingLeft: '32px', color: 'var(--accent-gold)', fontWeight: '900' }} value={manageSlotForm.customAmount} onChange={e => setManageSlotForm(p => ({ ...p, customAmount: e.target.value }))} />
                </div>
              </div>
              <PresetFeeChips onSelect={(val) => setManageSlotForm(p => ({ ...p, customAmount: val }))} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input className="form-input" placeholder="Fee note" value={manageSlotForm.feeNote} onChange={e => setManageSlotForm(p => ({ ...p, feeNote: e.target.value }))} />
                <select className="form-select" value={manageSlotForm.paymentStatus} onChange={e => setManageSlotForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                  <option value="DUE">● Payment Due</option>
                  <option value="PAID">✓ Settled &amp; Paid</option>
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
              <button type="button" onClick={() => setManagingSlotApt(null)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={manageSlotSubmitting} className="btn btn-cyan" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none' }}>
                {manageSlotSubmitting ? 'Saving...' : 'Update & Reschedule'}
              </button>
            </div>
          </form>
        )}
      </ModalOverlay>

      {/* MODAL 10: COLLECT PAYMENT DESK */}
      <ModalOverlay
        isOpen={!!collectModalApt}
        onClose={() => setCollectModalApt(null)}
        title="Front Desk Payment Collection"
        subtitle={`Record payment for ${collectModalApt?.patientName}`}
        icon={CreditCard}
        iconColor="#34d399"
        borderColor="#10b981"
      >
        {collectModalApt && (
          <form onSubmit={handleCollectPayment}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', padding: '1rem 0' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '800' }}>{collectModalApt.patientName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{collectModalApt.serviceName}</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: '900', color: '#34d399', fontSize: '1.1rem' }}>
                  ₹{Number(collectModalApt.amount || 0).toLocaleString()}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Settlement Amount (₹ INR) *</label>
                <input type="number" required min="1" step="50" className="form-input" value={collectForm.amount} onChange={e => setCollectForm(p => ({ ...p, amount: e.target.value }))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment Channel *</label>
                <select className="form-select" value={collectForm.paymentMethod} onChange={e => setCollectForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="CLINIC_CASH">💵 Clinic Front Desk Cash</option>
                  <option value="CLINIC_UPI">📱 Front Desk UPI QR Code</option>
                  <option value="CLINIC_POS_CARD">💳 Reception POS Card Terminal</option>
                  <option value="DIRECT_BANK_TRANSFER">🏦 Direct IMPS / NEFT Transfer</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Transaction Reference No (Optional)</label>
                <input className="form-input" placeholder="e.g. UPI Ref / Card Last 4" value={collectForm.referenceNo} onChange={e => setCollectForm(p => ({ ...p, referenceNo: e.target.value }))} />
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.85rem' }}>
              <button type="button" onClick={() => setCollectModalApt(null)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={collectSubmitting} className="btn btn-gold">
                {collectSubmitting ? 'Recording...' : `Collect: ₹${Number(collectForm.amount || 0).toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </ModalOverlay>

      {/* MODAL 11: RECEIPT VIEWER */}
      <ModalOverlay
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Official Clinical Payment Receipt"
        subtitle={`Invoice Ref: ${viewingReceipt?.invoiceNo || 'INV-2026'}`}
        icon={FileText}
        iconColor="#34d399"
        borderColor="#a855f7"
        maxWidth="620px"
      >
        {viewingReceipt && (
          <div className="modal-body" style={{ padding: '1rem 0' }}>
            <div style={{ background: '#130a1e', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#f472b6', fontSize: '1.1rem' }}>Healix Care &amp; Rehab</h4>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Official Clinical Receipt</div>
                </div>
                <span className="badge badge-success">PAID &bull; VERIFIED</span>
              </div>

              <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                  <strong style={{ color: '#ffffff' }}>{viewingReceipt.patientName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Therapy Service:</span>
                  <span>{viewingReceipt.serviceName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{viewingReceipt.methodLabel || viewingReceipt.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date &amp; Time Settled:</span>
                  <span>{viewingReceipt.timestamp || viewingReceipt.paidAt}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '700' }}>Net Settled Amount</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Doctor-Verified Post-Treatment Fee</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#34d399' }}>₹{Number(viewingReceipt.amount || 0).toLocaleString()}</div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.1)', marginTop: '1rem', paddingTop: '0.75rem' }}>
                Security Seal: <code style={{ color: 'var(--accent-gold)' }}>{viewingReceipt.securitySignature || 'HLX-SHA256-VERIFIED'}</code>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-sm"><Printer size={14} /> Print</button>
              <button type="button" onClick={() => handleDownloadReceiptHtml(viewingReceipt)} className="btn btn-cyan btn-sm"><Download size={14} /> Download HTML</button>
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
}
