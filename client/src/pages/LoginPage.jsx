import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Stethoscope, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Activity,
  HeartPulse,
  Home,
  Calendar,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import healixLogo from '../assets/healix-logo.png';

export default function LoginPage({ onLoginSuccess, onGoHome, initialRole = 'patient', bookingNotice = null }) {
  const { 
    patientLogin, 
    patientRegister, 
    adminLogin, 
    nurseLogin, 
    sendOtp,
    sendAdminOtp,
    resetPassword, 
    authError, 
    clearAuthError 
  } = useAuth();
  const toast = useToast();

  const [activePortal, setActivePortal] = useState(initialRole); // 'patient' | 'nurse' | 'admin'

  useEffect(() => {
    if (initialRole) {
      setActivePortal(initialRole);
    }
  }, [initialRole]);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState(null);

  // OTP state (Universal for all roles: Patient, Nurse, Admin)
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSentToEmail, setOtpSentToEmail] = useState('');
  const [devOtpPreview, setDevOtpPreview] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Forms
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    age: '30',
    gender: 'Male',
    address: '',
    medicalCondition: ''
  });
  const [forgotForm, setForgotForm] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setAuthMode('login');
    setLocalError(null);
    setResetSuccessMsg(null);
    clearAuthError();
    setOtpSent(false);
    setDevOtpPreview(null);
    setOtpCountdown(0);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    clearAuthError();

    let success = false;
    if (activePortal === 'patient') {
      success = await patientLogin(loginForm.usernameOrEmail, loginForm.password);
      if (success) {
        toast.success("Welcome back to your Patient Home Page!", "Patient Sign In");
        if (onLoginSuccess) onLoginSuccess('patient');
      } else {
        const err = authError || "Invalid patient credentials.";
        setLocalError(err);
        toast.error(err, "Sign In Failed");
      }
    } else if (activePortal === 'nurse') {
      success = await nurseLogin(loginForm.usernameOrEmail, loginForm.password);
      if (success) {
        toast.success("Welcome, Junior Physiotherapist Authorized!", "Staff Sign In");
        if (onLoginSuccess) onLoginSuccess('nurse');
      } else {
        const err = authError || "Invalid junior physiotherapist credentials.";
        setLocalError(err);
        toast.error(err, "Sign In Failed");
      }
    } else if (activePortal === 'admin') {
      success = await adminLogin(loginForm.usernameOrEmail, loginForm.password);
      if (success) {
        toast.success("Authorized as Doctor / Clinic Administrator!", "Admin Sign In");
        if (onLoginSuccess) onLoginSuccess('admin');
      } else {
        const err = authError || "Invalid administrator credentials.";
        setLocalError(err);
        toast.error(err, "Access Denied");
      }
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    clearAuthError();

    const success = await patientRegister(registerForm);
    if (success) {
      toast.success("Welcome to Healix! Your patient account is now active.", "Registration Complete");
      if (onLoginSuccess) onLoginSuccess('patient');
    } else {
      const err = authError || "Could not register account. Please check inputs.";
      setLocalError(err);
      toast.error(err, "Registration Failed");
    }
    setLoading(false);
  };

  // Password strength calculation helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '', percent: '0%' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444', percent: '33%' };
    if (score <= 3) return { score: 2, label: 'Medium', color: '#f59e0b', percent: '66%' };
    return { score: 3, label: 'Strong & Secure', color: '#10b981', percent: '100%' };
  };

  const handleSendOtp = async () => {
    const rawId = forgotForm.identifier.trim();
    if (!rawId) {
      const portalLabel = activePortal === 'admin' ? 'doctor / administrator' : (activePortal === 'nurse' ? 'junior physiotherapist' : 'patient');
      const err = `Please enter your registered ${portalLabel} username or email address first.`;
      setLocalError(err);
      toast.warning(err, "Missing Identifier");
      return;
    }

    setOtpLoading(true);
    setLocalError(null);
    clearAuthError();

    const res = await sendOtp(rawId, activePortal);
    setOtpLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpSentToEmail(res.maskedEmail || res.email);
      setDevOtpPreview(res.devOtp || null);
      setOtpCountdown(30);
      toast.success(res.message || "Security OTP dispatched to registered email!", "OTP Sent");
    } else {
      setLocalError(res.error || "Failed to dispatch verification OTP.");
      toast.error(res.error || "Failed to dispatch verification OTP.", "OTP Error");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setResetSuccessMsg(null);
    clearAuthError();

    const rawId = forgotForm.identifier.trim();
    if (!rawId) {
      const err = "Please enter your registered username or email address.";
      setLocalError(err);
      toast.warning(err, "Missing Identifier");
      return;
    }

    if (!otpSent) {
      // Automatic OTP request if not sent yet
      setLocalError("Requesting verification code for your registered email...");
      await handleSendOtp();
      return;
    }

    const cleanOtp = (forgotForm.otp || '').trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      const err = "Please enter the complete 6-digit OTP verification code sent to your registered email.";
      setLocalError(err);
      toast.warning(err, "OTP Required");
      return;
    }

    if (!forgotForm.newPassword || !forgotForm.newPassword.trim()) {
      const err = "Please enter your new password.";
      setLocalError(err);
      toast.warning(err, "Password Required");
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      const err = "New password and password confirmation do not match.";
      setLocalError(err);
      toast.warning(err, "Passwords Mismatch");
      return;
    }

    setLoading(true);

    const res = await resetPassword(
      rawId,
      forgotForm.newPassword,
      forgotForm.confirmPassword,
      activePortal,
      cleanOtp
    );
    setLoading(false);

    if (res.success) {
      setResetSuccessMsg(res.message);
      toast.success(res.message, "Password Reset Complete");
      setLoginForm((prev) => ({ ...prev, usernameOrEmail: res.username || rawId }));
      setOtpSent(false);
      setDevOtpPreview(null);
      setForgotForm({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });
    } else {
      setLocalError(res.error || "Password reset failed");
      toast.error(res.error || "Password reset failed", "Reset Error");
    }
  };


  // Dynamic Theme Colors based on Role
  const roleThemeMap = {
    patient: {
      color: 'var(--accent-magenta)',
      borderColor: 'rgba(217, 27, 118, 0.45)',
      glow: '0 16px 45px -10px rgba(217, 27, 118, 0.35)',
      gradient: 'linear-gradient(135deg, #64118a 0%, #d91b76 100%)',
      badgeBg: 'rgba(217, 27, 118, 0.2)',
      title: 'Patient Recovery Portal',
      subtitle: 'Personal therapy dashboard, appointment bookings & certified doorstep home visits.'
    },
    nurse: {
      color: 'var(--accent-teal, #14b8a6)',
      borderColor: 'rgba(20, 184, 166, 0.45)',
      glow: '0 16px 45px -10px rgba(20, 184, 166, 0.35)',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      badgeBg: 'rgba(20, 184, 166, 0.2)',
      title: 'Junior Physiotherapist Portal',
      subtitle: 'Clinical therapy assistance, session queue monitoring, exercise rehabilitation notes & attending care.'
    },
    admin: {
      color: 'var(--accent-gold, #fbbf24)',
      borderColor: 'rgba(168, 85, 247, 0.55)',
      glow: '0 16px 45px -10px rgba(121, 26, 156, 0.4)',
      gradient: 'linear-gradient(135deg, #791a9c 0%, #9333ea 50%, #d91b76 100%)',
      badgeBg: 'rgba(251, 191, 36, 0.2)',
      title: 'Doctor & Admin Executive Desk',
      subtitle: 'Chief Medical Officer command center for clinical oversight, patient charts & timetable slots.'
    }
  };

  const roleTheme = roleThemeMap[activePortal] || roleThemeMap.patient;

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* 1. Header Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button 
          onClick={onGoHome} 
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Clinic &amp; Services</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.72rem', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', borderColor: 'rgba(20, 184, 166, 0.4)' }}>
            ● Clinic Hours: Mon–Sat 09:00 AM – 07:00 PM
          </span>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
            🔒 HIPAA &amp; NABH Encrypted
          </span>
        </div>
      </div>

      {/* 2. Unified 2-Column Split Portal Console */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {/* LEFT COLUMN: Clinical Ecosystem Showcase & Role Switcher */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(145deg, rgba(28, 14, 46, 0.85) 0%, rgba(18, 8, 30, 0.95) 100%)',
            borderColor: roleTheme.borderColor,
            padding: '2.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.75rem'
          }}
        >
          <div>
            {/* Brand Intro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img 
                src={healixLogo} 
                alt="Healix Logo" 
                onError={(e) => {
                  const fallbackUrl = `${import.meta.env.BASE_URL}healix-logo.png`;
                  if (e.currentTarget.src !== fallbackUrl) {
                    e.currentTarget.src = fallbackUrl;
                  }
                }}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  border: '2px solid rgba(251, 191, 36, 0.75)',
                  boxShadow: '0 4px 15px rgba(217, 27, 118, 0.35)'
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="healix-brand-title" style={{ color: '#ffffff', fontSize: '1.35rem' }}>Healix</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>Physiotherapy</span>
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Unified Clinical Portals
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.95rem', fontWeight: '900', lineHeight: '1.2', letterSpacing: '-0.02em', margin: '0 0 0.65rem 0' }}>
              Select Your Clinical Role
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
              Healix provides role-tailored digital workspaces for patients, attending junior physiotherapists, and executive medical directors. Click below to switch:
            </p>

            {/* 3 Interactive Role Selection Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
              {/* 1. Patient Role Card */}
              <div
                onClick={() => handlePortalSwitch('patient')}
                style={{
                  cursor: 'pointer',
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: activePortal === 'patient' ? 'rgba(217, 27, 118, 0.16)' : 'var(--bg-input)',
                  border: `1.5px solid ${activePortal === 'patient' ? 'var(--accent-magenta)' : 'var(--border-color)'}`,
                  boxShadow: activePortal === 'patient' ? '0 0 20px rgba(217, 27, 118, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(217, 27, 118, 0.22)',
                  border: '1px solid rgba(217, 27, 118, 0.45)',
                  color: 'var(--accent-magenta)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.98rem', color: activePortal === 'patient' ? '#fff' : 'var(--text-main)' }}>
                      Patient Portal
                    </div>
                    {activePortal === 'patient' && (
                      <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: '1.35' }}>
                    In-clinic &amp; home sessions, recovery tracker &amp; exercises.
                  </p>
                </div>
              </div>

              {/* 2. Junior Physiotherapy Role Card */}
              <div
                onClick={() => handlePortalSwitch('nurse')}
                style={{
                  cursor: 'pointer',
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: activePortal === 'nurse' ? 'rgba(20, 184, 166, 0.16)' : 'var(--bg-input)',
                  border: `1.5px solid ${activePortal === 'nurse' ? 'var(--accent-teal, #14b8a6)' : 'var(--border-color)'}`,
                  boxShadow: activePortal === 'nurse' ? '0 0 20px rgba(20, 184, 166, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(20, 184, 166, 0.22)',
                  border: '1px solid rgba(20, 184, 166, 0.45)',
                  color: 'var(--accent-teal, #14b8a6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Stethoscope size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.98rem', color: activePortal === 'nurse' ? '#fff' : 'var(--text-main)' }}>
                      Junior Physiotherapist
                    </div>
                    {activePortal === 'nurse' && (
                      <span className="badge" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', background: 'rgba(20, 184, 166, 0.2)', color: 'var(--accent-teal, #14b8a6)', border: '1px solid var(--accent-teal, #14b8a6)' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: '1.35' }}>
                    Session queue, therapy exercises &amp; recovery progress updates.
                  </p>
                </div>
              </div>

              {/* 3. Admin Role Card */}
              <div
                onClick={() => handlePortalSwitch('admin')}
                style={{
                  cursor: 'pointer',
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: activePortal === 'admin' ? 'rgba(168, 85, 247, 0.16)' : 'var(--bg-input)',
                  border: `1.5px solid ${activePortal === 'admin' ? 'var(--accent-purple, #9333ea)' : 'var(--border-color)'}`,
                  boxShadow: activePortal === 'admin' ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.22)',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  color: 'var(--accent-gold, #fbbf24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.98rem', color: activePortal === 'admin' ? '#fff' : 'var(--text-main)' }}>
                      Clinic Admin &amp; Doctor
                    </div>
                    {activePortal === 'admin' && (
                      <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: '1.35' }}>
                    Executive CMO command, patient registry &amp; timetable slots.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Glassmorphic Auth Console */}
        <div 
          className="card"
          style={{
            background: 'var(--bg-card)',
            borderColor: roleTheme.borderColor,
            boxShadow: roleTheme.glow,
            padding: '2.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Subtle Role Gradient Glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: roleTheme.gradient
          }} />

          <div>
            {/* Booking Continuation Notice */}
            {bookingNotice && activePortal === 'patient' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(217, 27, 118, 0.22) 0%, rgba(251, 191, 36, 0.15) 100%)',
                border: '1.5px solid var(--accent-magenta, #d91b76)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'rgba(217, 27, 118, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-gold)'
                }}>
                  <Calendar size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '0.9rem' }}>
                    Patient Sign-In Required to Book Treatment
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Please sign in or create an account. You will automatically be returned to book your {bookingNotice.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'} session!
                  </div>
                </div>
              </div>
            )}

            {/* Console Header Banner */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge" style={{ background: roleTheme.badgeBg, color: roleTheme.color, border: `1px solid ${roleTheme.borderColor}`, fontSize: '0.72rem' }}>
                  {activePortal === 'admin' ? '🛡️ Administrator Clearance' : (activePortal === 'nurse' ? '🩺 Junior Physiotherapist Staff Roster' : '🏠 Personal Patient Gateway')}
                </span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
                {authMode === 'register' 
                  ? 'Register Patient Account' 
                  : (authMode === 'forgot' ? 'Reset Portal Password' : roleTheme.title)}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                {authMode === 'register' 
                  ? 'Create your permanent clinical record to book in-clinic visits and home physiotherapy.'
                  : (authMode === 'forgot' 
                      ? 'Confirm your registered username or email to restore your portal access.'
                      : roleTheme.subtitle)}
              </p>
            </div>

            {/* Auth Mode Switcher */}
            <div style={{ 
              display: 'flex', 
              gap: '0.4rem', 
              borderBottom: '1px solid var(--border-color)', 
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap'
            }}>
              <button 
                type="button"
                onClick={() => { setAuthMode('login'); setLocalError(null); setResetSuccessMsg(null); }}
                className="btn btn-sm"
                style={{
                  background: authMode === 'login' ? roleTheme.gradient : 'var(--bg-input)',
                  color: authMode === 'login' ? '#fff' : 'var(--text-muted)',
                  border: authMode === 'login' ? 'none' : '1px solid var(--border-color)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                Sign In
              </button>

              {activePortal === 'patient' && (
                <button 
                  type="button"
                  onClick={() => { setAuthMode('register'); setLocalError(null); setResetSuccessMsg(null); }}
                  className="btn btn-sm"
                  style={{
                    background: authMode === 'register' ? roleTheme.gradient : 'var(--bg-input)',
                    color: authMode === 'register' ? '#fff' : 'var(--text-muted)',
                    border: authMode === 'register' ? 'none' : '1px solid var(--border-color)',
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}
                >
                  Create Patient Account
                </button>
              )}

              <button 
                type="button"
                onClick={() => { setAuthMode('forgot'); setLocalError(null); setResetSuccessMsg(null); }}
                className="btn btn-sm"
                style={{
                  background: authMode === 'forgot' ? roleTheme.gradient : 'var(--bg-input)',
                  color: authMode === 'forgot' ? '#fff' : 'var(--text-muted)',
                  border: authMode === 'forgot' ? 'none' : '1px solid var(--border-color)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                Reset Password
              </button>
            </div>

            {/* Messages */}
            {localError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{localError}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    {activePortal === 'patient' 
                      ? 'Patient Username or Registered Email' 
                      : (activePortal === 'nurse' ? 'Junior Physio ID or Registered Email' : 'Doctor / Admin Username or Email')}
                  </label>
                  <div className="input-with-icon">
                    <div className="input-icon-left">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={activePortal === 'patient' ? 'e.g. demo_patient or patient@example.com' : (activePortal === 'nurse' ? 'e.g. junior_physio or email' : 'e.g. admin or email')}
                      className="form-input"
                      value={loginForm.usernameOrEmail}
                      onChange={(e) => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: roleTheme.color,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '700',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-with-icon">
                    <div className="input-icon-left">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your account password"
                      className="form-input"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="input-icon-right"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-lg"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.5rem',
                    background: roleTheme.gradient,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.98rem',
                    letterSpacing: '-0.01em',
                    boxShadow: roleTheme.glow,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    marginTop: '0.35rem',
                    minHeight: '50px'
                  }}
                >
                  <span style={{ lineHeight: 1.2 }}>
                    {loading 
                      ? 'Authenticating...' 
                      : `Access ${activePortal === 'admin' ? 'Clinic Admin' : (activePortal === 'nurse' ? 'Junior Physiotherapist' : 'Patient')} Portal Home`}
                  </span>
                  <ArrowRight size={19} />
                </button>
              </form>
            )}

            {/* 2. REGISTRATION FORM (PATIENT ONLY) */}
            {authMode === 'register' && activePortal === 'patient' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul_k"
                      className="form-input"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      className="form-input"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Patient Full Name"
                      className="form-input"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      className="form-input"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="patient@example.com"
                      className="form-input"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Age &amp; Gender</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="number"
                        placeholder="30"
                        className="form-input"
                        style={{ width: '85px' }}
                        value={registerForm.age}
                        onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                      />
                      <select
                        className="form-select"
                        value={registerForm.gender}
                        onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Home Address (For Doorstep Physio Visits)</label>
                  <input
                    type="text"
                    placeholder="Full street address, apartment / door no."
                    className="form-input"
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Primary Health / Physiotherapy Concern</label>
                  <input
                    type="text"
                    placeholder="e.g. Lumbar disc ache, knee pain, stroke recovery"
                    className="form-input"
                    value={registerForm.medicalCondition}
                    onChange={(e) => setRegisterForm({ ...registerForm, medicalCondition: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-cyan btn-lg"
                  style={{ fontWeight: '800', marginTop: '0.35rem', minHeight: '50px' }}
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Patient Registration & Enter'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* 3. PASSWORD RESET FORM (UNIVERSAL MANDATORY EMAIL OTP VERIFICATION) */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Security Shield Banner */}
                <div style={{
                  background: 'rgba(20, 184, 166, 0.08)',
                  border: '1px solid rgba(20, 184, 166, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  fontSize: '0.8rem',
                  lineHeight: '1.45',
                  color: '#99f6e4',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}>
                  <ShieldCheck size={20} style={{ color: 'var(--accent-teal, #14b8a6)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px', fontSize: '0.82rem' }}>
                      Mandatory Email OTP Identity Verification
                    </strong>
                    <div style={{ color: '#ccfbf1' }}>
                      To protect patient records and clinical credentials, a 6-digit One-Time Password (OTP) must be verified against your registered email before changing your password.
                    </div>
                  </div>
                </div>

                {/* Step 1: Username / Email & Send OTP */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Registered {activePortal === 'patient' ? 'Patient' : (activePortal === 'nurse' ? 'Junior Physiotherapist' : 'Doctor / Admin')} Username or Email <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div className="input-with-icon" style={{ flex: '1 1 240px' }}>
                      <div className="input-icon-left">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={
                          activePortal === 'admin' 
                            ? 'e.g. drcalvin or calvinjoelc@gmail.com' 
                            : (activePortal === 'nurse' ? 'Enter registered junior physio username or email' : 'Enter registered username or email')
                        }
                        className="form-input"
                        value={forgotForm.identifier}
                        onChange={(e) => setForgotForm({ ...forgotForm, identifier: e.target.value })}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || otpCountdown > 0 || !forgotForm.identifier.trim()}
                      className="btn btn-sm"
                      style={{
                        background: otpSent ? 'rgba(20, 184, 166, 0.2)' : 'linear-gradient(135deg, #791a9c 0%, #d91b76 100%)',
                        color: otpSent ? '#2dd4bf' : '#ffffff',
                        border: otpSent ? '1px solid rgba(20, 184, 166, 0.4)' : 'none',
                        fontWeight: '800',
                        padding: '0 1.15rem',
                        whiteSpace: 'nowrap',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        borderRadius: '8px',
                        cursor: (otpLoading || otpCountdown > 0 || !forgotForm.identifier.trim()) ? 'not-allowed' : 'pointer',
                        opacity: !forgotForm.identifier.trim() ? 0.6 : 1,
                        minHeight: '42px'
                      }}
                      title="Send verification code to registered email"
                    >
                      <Mail size={15} />
                      <span>
                        {otpLoading ? 'Sending OTP...' : (otpCountdown > 0 ? `Resend (${otpCountdown}s)` : (otpSent ? 'Resend OTP' : 'Send OTP to Email'))}
                      </span>
                    </button>
                  </div>
                </div>

                {/* OTP Dispatch Status Notice */}
                {otpSent && (
                  <div style={{
                    background: 'rgba(20, 184, 166, 0.12)',
                    border: '1px solid rgba(20, 184, 166, 0.45)',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: '#2dd4bf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={17} color="#2dd4bf" />
                      <span>Security OTP dispatched to registered inbox: <strong>{otpSentToEmail}</strong></span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: '700' }}>⏱️ Valid for 10 mins</span>
                  </div>
                )}

                {/* Local Dev OTP helper */}
                {devOtpPreview && (
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.12)',
                    border: '1px dashed rgba(251, 191, 36, 0.5)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#fef08a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <span>🧪 Local Test Preview: Verification OTP is <strong style={{ letterSpacing: '2px', fontSize: '1rem', color: '#ffffff' }}>{devOtpPreview}</strong></span>
                    <button
                      type="button"
                      onClick={() => setForgotForm((f) => ({ ...f, otp: devOtpPreview }))}
                      className="btn btn-sm"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', background: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                )}

                {/* Step 2: 6-Digit OTP Input */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      6-Digit Security Verification Code (OTP) <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>
                    {otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || otpCountdown > 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: otpCountdown > 0 ? 'var(--text-muted)' : 'var(--accent-gold)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: otpCountdown > 0 ? 'default' : 'pointer',
                          padding: 0
                        }}
                      >
                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                      </button>
                    )}
                  </div>
                  <div className="input-with-icon">
                    <div className="input-icon-left">
                      <Lock size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder={otpSent ? "Enter 6-digit OTP from email" : "Click 'Send OTP to Email' above first"}
                      className="form-input"
                      style={{ 
                        letterSpacing: '5px', 
                        fontWeight: '800', 
                        fontFamily: 'monospace', 
                        fontSize: '1.1rem',
                        borderColor: forgotForm.otp.length === 6 ? 'var(--accent-teal, #14b8a6)' : undefined
                      }}
                      value={forgotForm.otp}
                      onChange={(e) => setForgotForm({ ...forgotForm, otp: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                    {forgotForm.otp.length === 6 && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}>
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: New Password */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    New Password <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <div className="input-icon-left">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password (any format accepted)"
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={forgotForm.newPassword}
                      onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      tabIndex={-1}
                      title={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {forgotForm.newPassword && (
                    <div style={{ marginTop: '0.45rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                        <span style={{ color: getPasswordStrength(forgotForm.newPassword).color, fontWeight: '700' }}>
                          {getPasswordStrength(forgotForm.newPassword).label}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: getPasswordStrength(forgotForm.newPassword).percent,
                          background: getPasswordStrength(forgotForm.newPassword).color,
                          transition: 'width 0.25s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        ✓ Accepts any password (Weak, Medium, or Strong). Verification is secured by your Email OTP.
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Confirm Password */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Confirm New Password <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <div className="input-icon-left">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter your new password"
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={forgotForm.confirmPassword}
                      onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      tabIndex={-1}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {forgotForm.confirmPassword && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.72rem' }}>
                      {forgotForm.newPassword === forgotForm.confirmPassword ? (
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                          <Check size={13} /> Passwords match
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>
                          Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-secondary btn-lg"
                  style={{
                    fontWeight: '800',
                    marginTop: '0.35rem',
                    borderColor: 'var(--accent-teal, #14b8a6)',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(217, 27, 118, 0.3) 100%)',
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ShieldCheck size={19} color="var(--accent-teal, #14b8a6)" />
                  <span>
                    {loading ? 'Verifying OTP & Updating...' : 'Verify OTP & Reset Password'}
                  </span>
                </button>

                {/* Back to Sign In Link */}
                <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setLocalError(null); setResetSuccessMsg(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.5rem'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Remembered your password? Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Bottom Security / Direct Support Note */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-dim)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="var(--accent-gold)" />
              <span>Restricted medical communications gateway</span>
            </div>
            <span>Need help? Call Doctor / Admin Desk: <a href="tel:+917305394549" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: '700' }}>+91 73053 94549</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}
