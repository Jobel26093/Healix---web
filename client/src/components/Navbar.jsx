import React from 'react';
import { 
  Activity, 
  User, 
  ShieldCheck, 
  LogOut, 
  Calendar, 
  Home, 
  Sun, 
  Moon,
  Clock,
  Stethoscope,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import healixLogo from '../assets/healix-logo.png';

export default function Navbar({ 
  onOpenPatientAuth, 
  onOpenAdminAuth, 
  onOpenNurseAuth,
  onOpenBooking, 
  activeTab, 
  setActiveTab,
  adminTab,
  setAdminTab
}) {
  const { currentUser, logout, theme, toggleTheme } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.info("You have signed out of your account.", "Signed Out");
  };

  const handleLogoClick = () => {
    if (!currentUser) {
      setActiveTab('home');
    } else if (currentUser.role === 'ADMIN') {
      setActiveTab('admin-home');
    } else if (currentUser.role === 'NURSE') {
      setActiveTab('nurse-dashboard');
    } else {
      setActiveTab('patient-home');
    }
  };

  return (
    <header className="navbar">
      {/* Brand: Clicks to the user's specific Home Page */}
      <div 
        onClick={handleLogoClick}
        title={currentUser ? `Go to ${currentUser.role === 'ADMIN' ? 'Admin' : (currentUser.role === 'NURSE' ? 'Junior Physio' : 'Patient')} Home Page` : 'Healix Physiotherapy Home'}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
      >
        <img 
          src={healixLogo} 
          alt="Healix Physiotherapy Logo" 
          onError={(e) => {
            if (e.currentTarget.src !== '/healix-logo.png') {
              e.currentTarget.src = '/healix-logo.png';
            }
          }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            objectFit: 'contain',
            border: '2px solid rgba(251, 191, 36, 0.85)',
            boxShadow: '0 4px 12px rgba(219, 39, 119, 0.4)'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 
            className="healix-brand-title" 
            style={{ 
              fontSize: '1.55rem', 
              lineHeight: '1.05', 
              margin: 0, 
              whiteSpace: 'nowrap'
            }}
          >
            Healix
          </h1>
          <p style={{ fontSize: '0.62rem', color: 'var(--accent-gold, #fbbf24)', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, marginTop: '2px', whiteSpace: 'nowrap' }}>
            Physiotherapy &amp; Rehab
          </p>
        </div>
      </div>

      {/* Center Nav Items: Tailored to each role's Home Page */}
      <nav style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        {!currentUser ? (
          <>
            <button 
              onClick={() => setActiveTab('home')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'home' ? 'var(--accent-magenta, #d91b76)' : 'var(--border-color)',
                background: activeTab === 'home' ? 'rgba(217, 27, 118, 0.16)' : 'var(--bg-input)',
                color: activeTab === 'home' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'home' ? '700' : '600'
              }}
            >
              <Home size={14} />
              <span>Clinic Home</span>
            </button>

            <button 
              onClick={() => setActiveTab('login')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'login' ? 'var(--accent-gold, #fbbf24)' : 'var(--border-color)',
                background: activeTab === 'login' ? 'rgba(251, 191, 36, 0.16)' : 'var(--bg-input)',
                color: activeTab === 'login' ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontWeight: activeTab === 'login' ? '800' : '600'
              }}
            >
              <ShieldCheck size={14} />
              <span>Clinic Portals</span>
            </button>
          </>
        ) : currentUser?.role === 'ADMIN' ? (
          <>
            <button 
              onClick={() => setActiveTab('admin-home')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'admin-home' ? 'var(--accent-purple)' : 'var(--border-color)',
                background: activeTab === 'admin-home' ? 'rgba(121, 26, 156, 0.2)' : 'var(--bg-input)',
                color: 'var(--accent-purple)',
                fontWeight: '800'
              }}
            >
              <Home size={14} />
              <span>Admin Home</span>
            </button>

            <button 
              onClick={() => {
                if (setAdminTab) setAdminTab('appointments');
                setActiveTab('admin-dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'admin-dashboard' && adminTab !== 'income' ? 'var(--accent-magenta, #d91b76)' : 'var(--border-color)',
                background: activeTab === 'admin-dashboard' && adminTab !== 'income' ? 'rgba(217, 27, 118, 0.16)' : 'var(--bg-input)',
                color: activeTab === 'admin-dashboard' && adminTab !== 'income' ? 'var(--accent-magenta)' : 'var(--text-muted)',
                fontWeight: '700'
              }}
            >
              <Calendar size={14} />
              <span>Operations &amp; Data</span>
            </button>

            <button 
              onClick={() => {
                if (setAdminTab) setAdminTab('income');
                setActiveTab('admin-dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'admin-dashboard' && adminTab === 'income' ? 'var(--accent-gold, #fbbf24)' : 'var(--border-color)',
                background: activeTab === 'admin-dashboard' && adminTab === 'income' ? 'rgba(251, 191, 36, 0.22)' : 'var(--bg-input)',
                color: activeTab === 'admin-dashboard' && adminTab === 'income' ? 'var(--accent-gold, #fbbf24)' : 'var(--text-muted)',
                fontWeight: activeTab === 'admin-dashboard' && adminTab === 'income' ? '800' : '700'
              }}
            >
              <CreditCard size={14} />
              <span>Income Portal</span>
            </button>
          </>
        ) : currentUser?.role === 'NURSE' ? (
          <>
            <button 
              onClick={() => setActiveTab('nurse-dashboard')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'nurse-dashboard' ? 'var(--accent-teal)' : 'var(--border-color)',
                background: activeTab === 'nurse-dashboard' ? 'rgba(20, 184, 166, 0.18)' : 'var(--bg-input)',
                color: 'var(--accent-teal)',
                fontWeight: '800'
              }}
            >
              <Stethoscope size={14} />
              <span>Physiotherapist Station</span>
            </button>

            <button 
              onClick={() => setActiveTab('home')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'home' ? 'var(--accent-teal)' : 'var(--border-color)',
                background: activeTab === 'home' ? 'rgba(20, 184, 166, 0.12)' : 'var(--bg-input)',
                color: activeTab === 'home' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: '600'
              }}
            >
              <Activity size={14} />
              <span>Clinic Services</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab('patient-home')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'patient-home' ? 'var(--accent-magenta, #d91b76)' : 'var(--border-color)',
                background: activeTab === 'patient-home' ? 'rgba(217, 27, 118, 0.18)' : 'var(--bg-input)',
                color: activeTab === 'patient-home' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: '800'
              }}
            >
              <Home size={14} />
              <span>Patient Home</span>
            </button>

            <button 
              onClick={() => setActiveTab('patient-dashboard')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'patient-dashboard' ? 'var(--accent-gold, #fbbf24)' : 'var(--border-color)',
                background: activeTab === 'patient-dashboard' ? 'rgba(251, 191, 36, 0.16)' : 'var(--bg-input)',
                color: activeTab === 'patient-dashboard' ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontWeight: '700'
              }}
            >
              <Calendar size={14} />
              <span>My Sessions</span>
            </button>

            <button 
              onClick={() => setActiveTab('patient-payments')}
              className="btn btn-secondary btn-sm"
              style={{ 
                borderColor: activeTab === 'patient-payments' ? 'var(--accent-cyan)' : 'var(--border-color)',
                background: activeTab === 'patient-payments' ? 'rgba(6, 182, 212, 0.16)' : 'var(--bg-input)',
                color: activeTab === 'patient-payments' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: '700'
              }}
            >
              <CreditCard size={14} />
              <span>Payment Portal</span>
            </button>
          </>
        )}
      </nav>

      {/* Right Controls & Primary CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
        {/* Primary CTA (Patient self-booking, hidden for Doctor/Admin) */}
        {currentUser?.role !== 'ADMIN' && (
          <button 
            onClick={onOpenBooking} 
            className="btn btn-cyan btn-sm"
            style={{ fontWeight: '700', padding: '0.4rem 0.85rem' }}
          >
            <Calendar size={14} />
            <span>Book Appointment</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem 0.55rem' }}
          title="Toggle Light/Dark Theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.1rem' }} />

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', whiteSpace: 'nowrap' }}>{currentUser.fullName}</div>
              <span className={`badge ${currentUser.role === 'ADMIN' ? 'badge-homevisit' : 'badge-cyan'}`} style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem' }}>
                {currentUser.role === 'ADMIN' ? 'Admin' : (currentUser.role === 'NURSE' ? 'Physiotherapist' : 'Patient')}
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '0.4rem 0.55rem' }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setActiveTab('login')} 
            className="btn btn-secondary btn-sm" 
            title="Clinic Access Portals" 
            style={{ 
              padding: '0.4rem 0.85rem',
              borderColor: (activeTab === 'login' || activeTab === 'portal') ? 'var(--accent-gold)' : 'var(--border-color)',
              background: (activeTab === 'login' || activeTab === 'portal') ? 'rgba(251, 191, 36, 0.18)' : 'var(--bg-input)',
              color: (activeTab === 'login' || activeTab === 'portal') ? 'var(--accent-gold)' : 'var(--text-main)',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ShieldCheck size={14} color="var(--accent-gold)" />
            <span>Clinic Portals</span>
          </button>
        )}
      </div>
    </header>
  );
}
