import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clock, 
  Home, 
  Plus, 
  CheckCircle, 
  MapPin, 
  Activity, 
  RotateCw, 
  ArrowRight, 
  UserCheck, 
  Stethoscope, 
  Sliders, 
  FileText,
  AlertTriangle,
  Zap,
  TrendingUp,
  KeyRound,
  Lock,
  CreditCard,
  Mail,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminHomePage({ 
  onViewAppointments, 
  onViewPatients, 
  onViewTimings, 
  onViewSecurity,
  onViewNurses,
  onViewIncome,
  onOpenBooking 
}) {
  const { currentUser, sendAdminOtp, updateAdminPassword } = useAuth();
  const toast = useToast();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [timings, setTimings] = useState([]);
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Doctor / Admin Security Password Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [secOtpSent, setSecOtpSent] = useState(false);
  const [secOtpLoading, setSecOtpLoading] = useState(false);
  const [secOtpCountdown, setSecOtpCountdown] = useState(0);
  const [secDevOtpPreview, setSecDevOtpPreview] = useState(null);
  const [secLoading, setSecLoading] = useState(false);
  const [secSuccessMsg, setSecSuccessMsg] = useState(null);
  const [secErrorMsg, setSecErrorMsg] = useState(null);

  useEffect(() => {
    let timer;
    if (secOtpCountdown > 0) {
      timer = setInterval(() => setSecOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [secOtpCountdown]);

  const handleSendSecurityOtp = async () => {
    if (!currentUser?.email) return;
    setSecOtpLoading(true);
    setSecErrorMsg(null);
    setSecSuccessMsg(null);

    const res = await sendAdminOtp(currentUser.email);
    setSecOtpLoading(false);

    if (res.success) {
      setSecOtpSent(true);
      setSecDevOtpPreview(res.devOtp || null);
      setSecOtpCountdown(30);
      toast.success(res.message, "OTP Sent to Email");
    } else {
      setSecErrorMsg(res.error || "Failed to dispatch verification OTP.");
      toast.error(res.error || "Failed to dispatch verification OTP.", "OTP Error");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecErrorMsg(null);
    setSecSuccessMsg(null);

    if (!secOtpSent) {
      const err = "Please click 'Send OTP to Email' to receive your verification code first.";
      setSecErrorMsg(err);
      toast.warning(err, "OTP Required");
      return;
    }

    if (!passwordForm.otp.trim()) {
      const err = "Please enter the 6-digit OTP code sent to your registered email.";
      setSecErrorMsg(err);
      toast.warning(err, "OTP Required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const err = "New password and password confirmation do not match.";
      setSecErrorMsg(err);
      toast.warning(err, "Password Mismatch");
      return;
    }

    setSecLoading(true);
    const res = await updateAdminPassword(
      passwordForm.newPassword,
      passwordForm.confirmPassword,
      passwordForm.otp
    );
    setSecLoading(false);

    if (res.success) {
      setSecSuccessMsg(res.message);
      toast.success(res.message, "Admin Credentials Updated");
      setPasswordForm({ otp: '', newPassword: '', confirmPassword: '' });
      setSecOtpSent(false);
      setSecDevOtpPreview(null);
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setSecSuccessMsg(null);
      }, 1400);
    } else {
      setSecErrorMsg(res.error || "Failed to update administrator password.");
      toast.error(res.error || "Failed to update administrator password.", "Update Error");
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const headers = { 'x-user-id': currentUser?.id || 'usr_admin_1' };
    try {
      const [patRes, aptRes, timeRes, incRes] = await Promise.all([
        fetch('/api/patients', { headers }),
        fetch('/api/appointments', { headers }),
        fetch('/api/timings', { headers }),
        fetch('/api/payments/income-summary', { headers })
      ]);
      const patData = await patRes.json();
      const aptData = await aptRes.json();
      const timeData = await timeRes.json();
      const incData = await incRes.json();

      if (patData.success) setPatients(patData.patients || []);
      if (aptData.success) setAppointments(aptData.appointments || []);
      if (timeData.success) setTimings(timeData.timings || []);
      if (incData.success) setIncomeData(incData);
    } catch (err) {
      console.error("Error loading admin home data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (!currentUser || currentUser.role !== 'ADMIN') return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const homeVisitsTotal = appointments.filter(a => a.isHomeVisit).length;
  const activeSessions = appointments.filter(a => a.status !== 'Cancelled').length;
  const completedSessions = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 1. Executive Banner */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(74, 14, 110, 0.45) 0%, rgba(121, 26, 156, 0.25) 50%, rgba(217, 27, 118, 0.15) 100%)',
          borderColor: 'rgba(168, 85, 247, 0.45)',
          padding: '2.25rem 2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <span className="badge badge-homevisit" style={{ fontSize: '0.72rem' }}>
                🛡️ Admin Home Cockpit
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                Chief Medical Officer
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                Live Clinic Operations
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
              Healix Clinic Executive Command Home
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.45rem', lineHeight: '1.5' }}>
              Logged in as <strong style={{ color: 'var(--text-main)' }}>{currentUser.fullName.startsWith('Dr.') ? currentUser.fullName : `Dr. ${currentUser.fullName}`}</strong> ({currentUser.email} &bull; <span style={{ color: 'var(--accent-gold)' }}>{currentUser.phone || '+91 73053 94549'}</span>). Full administrative oversight across outpatient appointments, junior physiotherapist home visit dispatches, and operating schedules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchAdminData} 
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <button 
              onClick={onViewIncome || onViewAppointments} 
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)', fontWeight: '800' }}
            >
              <CreditCard size={15} />
              <span>Income Portal (₹{incomeData ? incomeData.totalIncomeGenerated.toLocaleString() : '...'})</span>
            </button>
            <button 
              onClick={onViewAppointments} 
              className="btn btn-cyan btn-sm"
              style={{ fontWeight: '800' }}
            >
              <Calendar size={16} />
              <span>Manage Patient Bookings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Clinic Vitals & Operational Performance Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', marginBottom: '0.35rem' }}>
            <Users size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Total Patients</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>{patients.length}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Registered medical charts</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-magenta)', marginBottom: '0.35rem' }}>
            <Calendar size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Total Appointments</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--healix-magenta-light)' }}>{appointments.length}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>{activeSessions} Active &bull; {completedSessions} Completed</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '0.35rem' }}>
            <Clock size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Today's Sessions</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-gold)' }}>{todayAppointments.length}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Scheduled for today</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal)', marginBottom: '0.35rem' }}>
            <Home size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Home Visits</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#14b8a6' }}>{homeVisitsTotal}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Doorstep Physio Requests</p>
        </div>

        <div className="card" style={{ borderColor: 'var(--accent-gold)', cursor: 'pointer' }} onClick={onViewIncome || onViewAppointments}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '0.35rem' }}>
            <CreditCard size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Income Generated</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
            ₹{incomeData ? incomeData.totalIncomeGenerated.toLocaleString() : '...'}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
            ₹{incomeData ? incomeData.totalPendingIncome.toLocaleString() : '0'} pending receivables
          </p>
        </div>
      </div>

      {/* 3. Executive Action Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Module 1 */}
        <div 
          onClick={onViewAppointments}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--accent-magenta)' }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(217, 27, 118, 0.18)', border: '1px solid rgba(217, 27, 118, 0.4)',
            color: 'var(--accent-magenta)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
          }}>
            <Calendar size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Appointments Operations
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
            Review, confirm, or modify patient visits, assign attending physiotherapists, and manage doorstep dispatches.
          </p>
          <div style={{ color: 'var(--accent-magenta)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Open Appointments Desk <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 2 */}
        <div 
          onClick={onViewPatients}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--accent-purple)' }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(121, 26, 156, 0.18)', border: '1px solid rgba(121, 26, 156, 0.4)',
            color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
          }}>
            <Users size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Patient Records Directory
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
            Access medical records, patient diagnoses, age, emergency contact phone numbers, and registered addresses.
          </p>
          <div style={{ color: 'var(--accent-purple)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Open Patient Registry <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 3 */}
        <div 
          onClick={onViewTimings}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--accent-gold)' }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(251, 191, 36, 0.18)', border: '1px solid rgba(251, 191, 36, 0.4)',
            color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
          }}>
            <Clock size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Timetable &amp; Clinic Slots
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
            Configure clinic working hours, capacity quotas per slot, and dedicated evening home-visit therapist schedules.
          </p>
          <div style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Configure Operating Timings <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 4: Security & Password (Email OTP) */}
        <div 
          onClick={() => setIsSecurityModalOpen(true)}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--accent-gold)', background: 'linear-gradient(145deg, rgba(35, 14, 55, 0.6) 0%, rgba(20, 8, 32, 0.8) 100%)' }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(217, 27, 118, 0.18)', border: '1px solid rgba(251, 191, 36, 0.4)',
            color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
          }}>
            <KeyRound size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Security &amp; Password
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
            Update administrator credentials with 6-digit OTP verification dispatched to your registered email (<code>{currentUser.email}</code>).
          </p>
          <div style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Update Password via Email OTP <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 5: Nurse Staff & Portal Management */}
        <div 
          onClick={onViewNurses}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--accent-magenta, #d91b76)', background: 'linear-gradient(145deg, rgba(45, 12, 60, 0.6) 0%, rgba(20, 8, 32, 0.8) 100%)' }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(217, 27, 118, 0.18)', border: '1px solid rgba(217, 27, 118, 0.4)',
            color: 'var(--accent-magenta, #d91b76)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
          }}>
            <Stethoscope size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Nurse Staff &amp; Portal
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
            Onboard new incoming nurses, update shifts &amp; passwords, or revoke Nurse Station access when a nurse resigns.
          </p>
          <div style={{ color: 'var(--accent-magenta, #d91b76)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Manage Nurse Station Roster <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 6: Income Generated & Patient Billing Portal */}
        <div 
          onClick={onViewIncome || onViewAppointments}
          className="card"
          style={{ 
            cursor: 'pointer', 
            transition: 'all 0.2s ease', 
            borderColor: 'var(--accent-gold)', 
            background: 'linear-gradient(145deg, rgba(45, 30, 10, 0.6) 0%, rgba(20, 8, 32, 0.8) 100%)' 
          }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(251, 191, 36, 0.18)', border: '1px solid rgba(251, 191, 36, 0.4)',
            color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
          }}>
            <CreditCard size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--accent-gold)' }}>
            Income &amp; Revenue Portal
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '1rem' }}>
            Audited clinical income generated (₹{incomeData ? incomeData.totalIncomeGenerated.toLocaleString() : '0'}), list of patients paid vs not paid, and instant fee collection desk.
          </p>
          <div style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Open Income &amp; Billing Desk <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* 4. Live Today's Schedule Board */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
              Today's Session Schedule Board ({todayAppointments.length})
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Live patient roster for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onViewAppointments} className="btn btn-secondary btn-sm">
            <span>Manage All in Tables</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={36} color="var(--accent-purple)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.8 }} />
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>
              No sessions scheduled for today
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Upcoming bookings for later dates are active in the Appointment Operations desk.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayAppointments.map((apt) => (
              <div 
                key={apt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className={apt.isHomeVisit ? 'badge badge-homevisit' : 'badge badge-cyan'}>
                      {apt.isHomeVisit ? '🏡 Home Visit' : '🏥 In-Clinic'}
                    </span>
                    <strong style={{ fontSize: '1rem' }}>{apt.patientName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({apt.patientPhone})</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>{apt.serviceName}</span>
                    <span>&bull;</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{apt.timeSlot}</span>
                    {apt.assignedPhysio && <span>&bull; Physio: <strong style={{ color: 'var(--text-main)' }}>{apt.assignedPhysio}</strong></span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge" style={{
                    background: apt.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 27, 118, 0.15)',
                    color: apt.status === 'Completed' ? '#34d399' : '#f472b6',
                    border: apt.status === 'Completed' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(217, 27, 118, 0.35)'
                  }}>
                    {apt.status || 'Confirmed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Clinical Supervision & Staff Duty Log */}
      <div 
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'rgba(23, 13, 36, 0.85)',
          borderColor: 'var(--accent-purple)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)',
            color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem' }}>
              Clinic Duty Staff: Supervised by Dr. {currentUser.fullName}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Nurse Station &amp; Bedside Physio teams are active. Standard operating protocols &amp; home visit dispatches synchronized.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onViewNurses || onViewAppointments} 
            className="btn btn-cyan btn-sm"
            style={{ fontWeight: '800' }}
          >
            <Stethoscope size={14} />
            <span>Manage Nurse Staff &amp; Portal</span>
          </button>

          <button 
            onClick={onViewAppointments} 
            className="btn btn-secondary btn-sm"
          >
            <span>Open Appointments</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Doctor / Administrator Security Credentials & Password Modal */}
      {isSecurityModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSecurityModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', border: '1px solid var(--accent-gold)' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(251, 191, 36, 0.2)', color: 'var(--accent-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                    Doctor / Admin Security Credentials
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    HIPAA &amp; NABH Verified Security Controls for Chief Medical Authority
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSecurityModalOpen(false)} 
                className="btn-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Profile Overview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Authenticated Doctor</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '2px' }}>{currentUser.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Registered Email</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '2px' }}><code>{currentUser.email}</code></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Admin Clearance</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '2px' }}>Chief Physio &amp; Clinic Admin</div>
                </div>
              </div>

              {/* Status Messages */}
              {secErrorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{secErrorMsg}</span>
                </div>
              )}

              {secSuccessMsg && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{secSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Step 1: Send OTP Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={15} color="var(--accent-gold)" />
                        <span>Step 1: Request Security Verification OTP</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Send OTP to: <code>{currentUser.email}</code>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendSecurityOtp}
                      disabled={secOtpLoading || secOtpCountdown > 0}
                      className="btn btn-sm"
                      style={{
                        background: secOtpSent ? 'rgba(20, 184, 166, 0.2)' : 'linear-gradient(135deg, #791a9c 0%, #d91b76 100%)',
                        color: secOtpSent ? '#2dd4bf' : '#ffffff',
                        border: secOtpSent ? '1px solid rgba(20, 184, 166, 0.4)' : 'none',
                        fontWeight: '800',
                        padding: '0.45rem 1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        borderRadius: '8px'
                      }}
                    >
                      <Mail size={14} />
                      <span>
                        {secOtpLoading ? 'Dispatching...' : (secOtpCountdown > 0 ? `Resend Code in ${secOtpCountdown}s` : (secOtpSent ? 'Resend OTP to Email' : 'Send OTP to Email'))}
                      </span>
                    </button>
                  </div>

                  {secOtpSent && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(20, 184, 166, 0.1)',
                      border: '1px solid rgba(20, 184, 166, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: '#2dd4bf',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={14} />
                        <span>OTP dispatched to <strong>{currentUser.email}</strong>. Check inbox.</span>
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: '700' }}>⏱️ 10 Mins Expiry</span>
                    </div>
                  )}

                  {secDevOtpPreview && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.45rem 0.75rem',
                      background: 'rgba(251, 191, 36, 0.12)',
                      border: '1px dashed rgba(251, 191, 36, 0.5)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: '#fef08a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>🧪 Local Test Preview: Code is <strong style={{ letterSpacing: '2px', fontSize: '0.92rem', color: '#ffffff' }}>{secDevOtpPreview}</strong></span>
                      <button
                        type="button"
                        onClick={() => setPasswordForm(f => ({ ...f, otp: secDevOtpPreview }))}
                        className="btn btn-sm"
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', background: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', border: 'none', cursor: 'pointer' }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Enter OTP & New Password */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Step 2: Enter 6-Digit Verification Code (OTP) <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <div className="input-with-icon">
                    <div className="input-icon-left">
                      <Lock size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder={secOtpSent ? "Enter 6-digit code received on email" : "Click 'Send OTP to Email' above first"}
                      className="form-input"
                      style={{ letterSpacing: '4px', fontWeight: '800', fontFamily: 'monospace', fontSize: '1rem' }}
                      value={passwordForm.otp}
                      onChange={(e) => setPasswordForm({ ...passwordForm, otp: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">New Administrator Password</label>
                    <div className="input-with-icon">
                      <div className="input-icon-left">
                        <KeyRound size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        className="form-input"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-with-icon">
                      <div className="input-icon-left">
                        <KeyRound size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="Confirm new password"
                        className="form-input"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsSecurityModalOpen(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={secLoading}
                    className="btn btn-admin"
                    style={{ fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <ShieldCheck size={16} />
                    <span>{secLoading ? 'Verifying OTP & Updating...' : 'Verify OTP & Save Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
