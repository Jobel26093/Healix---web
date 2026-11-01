import React from 'react';
import { 
  X, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import healixLogo from '../assets/healix-logo.png';

export default function PortalSelectModal({
  isOpen,
  onClose,
  onSelectPortal,
  currentUser = null,
  onNavigateToUserHome = null
}) {
  if (!isOpen) return null;

  const handlePortalClick = (roleKey) => {
    onClose();
    if (onSelectPortal) {
      onSelectPortal(roleKey);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(8, 3, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #1d0f2f 0%, #12081e 100%)',
          border: '1.5px solid rgba(217, 27, 118, 0.45)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(217, 27, 118, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.15rem 1.25rem',
          borderBottom: '1px solid rgba(217, 27, 118, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(23, 13, 36, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img 
              src={healixLogo} 
              alt="Healix" 
              onError={(e) => {
                const fallbackUrl = `${import.meta.env.BASE_URL}healix-logo.png`;
                if (e.currentTarget.src !== fallbackUrl) e.currentTarget.src = fallbackUrl;
              }}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--accent-gold)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>Healix Clinical Portals</span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Unified</span>
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Select your authorized workspace to continue
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentUser && (
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                  Currently Signed In
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>
                  {currentUser.fullName} ({currentUser.role})
                </div>
              </div>
              {onNavigateToUserHome && (
                <button 
                  onClick={() => {
                    onClose();
                    onNavigateToUserHome();
                  }}
                  className="btn btn-admin btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <span>Dashboard ↗</span>
                </button>
              )}
            </div>
          )}

          {/* 1. Patient Portal Option */}
          <div 
            onClick={() => handlePortalClick('patient')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 1rem',
              borderRadius: '12px',
              background: 'rgba(217, 27, 118, 0.12)',
              border: '1.5px solid rgba(217, 27, 118, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            className="portal-select-item"
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(217, 27, 118, 0.25)',
              color: 'var(--accent-magenta, #d91b76)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>
                  Patient Portal
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>Personal</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: '1.3' }}>
                Book sessions, request home physio &amp; track your recovery plan.
              </p>
            </div>
            <ArrowRight size={16} color="var(--accent-magenta)" />
          </div>

          {/* 2. Junior Physiotherapist Option */}
          <div 
            onClick={() => handlePortalClick('nurse')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 1rem',
              borderRadius: '12px',
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1.5px solid rgba(20, 184, 166, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            className="portal-select-item"
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(20, 184, 166, 0.2)',
              color: 'var(--accent-teal, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Stethoscope size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>
                  Junior Physiotherapist
                </div>
                <span className="badge" style={{ fontSize: '0.62rem', background: 'rgba(20, 184, 166, 0.2)', color: 'var(--accent-teal, #14b8a6)', border: '1px solid var(--accent-teal, #14b8a6)' }}>
                  Clinical
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: '1.3' }}>
                Clinical therapy assistance, patient vitals &amp; attending physician notes.
              </p>
            </div>
            <ArrowRight size={16} color="var(--accent-teal, #14b8a6)" />
          </div>

          {/* 3. Doctor & Clinic Admin Option */}
          <div 
            onClick={() => handlePortalClick('admin')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 1rem',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1.5px solid rgba(168, 85, 247, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            className="portal-select-item"
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.25)',
              color: 'var(--accent-gold, #fbbf24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>
                  Clinic Admin &amp; Doctor
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Executive</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: '1.3' }}>
                Dr. Joel Calvin C - Full medical command, patient registry &amp; financials.
              </p>
            </div>
            <ArrowRight size={16} color="var(--accent-gold)" />
          </div>
        </div>
      </div>
    </div>
  );
}

