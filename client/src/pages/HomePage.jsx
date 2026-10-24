import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Home, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  PhoneCall, 
  MapPin, 
  ArrowRight,
  Stethoscope,
  Brain,
  Bone,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  User
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import ClinicLocationMap from '../components/ClinicLocationMap';
import healixLogo from '../assets/healix-logo.png';

export default function HomePage({ onOpenBooking, onOpenPatientAuth, onOpenAdminAuth, onOpenNurseAuth }) {
  const toast = useToast();
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [activeNurses, setActiveNurses] = useState([]);

  useEffect(() => {
    fetch('/api/nurse/public-roster')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.nurses) {
          setActiveNurses(data.nurses);
        }
      })
      .catch(err => console.error("Error fetching nurse roster:", err));
  }, []);

  const handleCopyLocation = () => {
    navigator.clipboard.writeText('Healix Advance Physiotherapy and Rehabilitation Center, 8/207 Pillayar Koil St, Nookampalayam Main Rd, Sithalapakkam, Chennai - 600131. Google Maps: https://maps.app.goo.gl/9ZwbWzGo3AVLExwL9');
    setCopiedLocation(true);
    toast.success("Clinic address & GPS link copied to clipboard!", "Address Copied");
    setTimeout(() => setCopiedLocation(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Banner with Official Healix Logo */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(74, 14, 110, 0.4) 0%, rgba(217, 27, 118, 0.22) 55%, rgba(251, 191, 36, 0.1) 100%)',
        borderColor: 'rgba(217, 27, 118, 0.5)',
        padding: '3rem 2.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2.5rem', flexWrap: 'wrap-reverse' }}>
          <div style={{ maxWidth: '750px', flex: '1 1 480px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan" style={{ background: 'rgba(217, 27, 118, 0.2)', color: '#f472b6', borderColor: '#d91b76' }}>
                🏥 Official Rehabilitation Center
              </span>
              <span className="badge badge-gold">
                ⭐ Certified Physio Specialists
              </span>
            </div>
            
            <h1 style={{ fontSize: '2.85rem', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Restore Mobility &amp; Reclaim Your Active Life with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                Healix Physiotherapy
              </span>
            </h1>
            
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: '1.25rem 0 2rem 0', lineHeight: '1.6' }}>
              Evidence-based orthopedic rehabilitation, sports injury reconditioning, post-surgical mobility recovery, and personalized <strong>Home Visit Rehabilitation Services</strong>.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => onOpenBooking(false)} className="btn btn-cyan" style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}>
                <Calendar size={20} />
                <span>Book Clinic Visit</span>
              </button>

              <button 
                onClick={() => onOpenBooking(true)} 
                className="btn btn-admin" 
                style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
              >
                <Home size={20} />
                <span>Request Home Visit</span>
              </button>

              <button 
                onClick={onOpenPatientAuth} 
                className="btn btn-secondary" 
                style={{ padding: '0.85rem 1.4rem', fontSize: '1rem', borderColor: 'rgba(251, 191, 36, 0.45)', color: 'var(--accent-gold)' }}
              >
                <ShieldCheck size={20} color="var(--accent-gold)" />
                <span>Clinic Portals</span>
              </button>

              <a 
                href="#clinic-location" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('clinic-location')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-secondary" 
                style={{ padding: '0.85rem 1.35rem', fontSize: '1rem', textDecoration: 'none' }}
              >
                <MapPin size={20} color="var(--accent-magenta)" />
                <span>Clinic Map</span>
              </a>
            </div>
          </div>

          {/* Logo Emblem Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img 
              src={healixLogo} 
              alt="Healix Physiotherapy Official Logo" 
              onError={(e) => {
                const fallbackUrl = `${import.meta.env.BASE_URL}healix-logo.png`;
                if (e.currentTarget.src !== fallbackUrl) {
                  e.currentTarget.src = fallbackUrl;
                }
              }}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                objectFit: 'contain',
                border: '4px solid rgba(251, 191, 36, 0.85)',
                boxShadow: '0 12px 35px rgba(219, 39, 119, 0.45), 0 0 25px rgba(121, 26, 156, 0.4)'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', marginTop: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Healix Care &amp; Rehab
            </span>
          </div>
        </div>
      </div>

      {/* 2. Clinic Portals Hub */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.45rem' }}>
            🔐 Dedicated Role Workspaces
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Healix Clinic Portals</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Direct access to personalized home workspaces for Patients, Junior Physiotherapists, and Clinic Administrators
          </p>
        </div>

        <div className="grid-cols-3">
          {/* Patient Portal Card */}
          <div 
            onClick={onOpenPatientAuth}
            className="card"
            style={{ 
              cursor: 'pointer', 
              borderColor: 'rgba(217, 27, 118, 0.4)', 
              background: 'linear-gradient(135deg, rgba(23, 13, 36, 0.85) 0%, rgba(217, 27, 118, 0.1) 100%)',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'rgba(217, 27, 118, 0.2)', border: '1px solid rgba(217, 27, 118, 0.45)',
              color: 'var(--accent-magenta)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
            }}>
              <User size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Patient Portal</h3>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Personal</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Track recovery progress, view upcoming therapy sessions, and request certified home physio visits.
            </p>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', borderColor: 'rgba(217, 27, 118, 0.4)', color: 'var(--accent-magenta)', fontWeight: '700' }}>
              <span>Access Patient Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Junior Physiotherapist Portal Card */}
          <div 
            onClick={onOpenNurseAuth}
            className="card"
            style={{ 
              cursor: 'pointer', 
              borderColor: 'rgba(20, 184, 166, 0.4)', 
              background: 'linear-gradient(135deg, rgba(23, 13, 36, 0.85) 0%, rgba(20, 184, 166, 0.1) 100%)',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.45)',
              color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
            }}>
              <Stethoscope size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Junior Physiotherapist</h3>
              <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(20, 184, 166, 0.2)', color: 'var(--accent-teal)', border: '1px solid rgba(20, 184, 166, 0.4)' }}>Clinical</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Clinical therapy assistance, session queue monitoring, exercise rehabilitation notes, and attending care under supervising doctor.
            </p>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', borderColor: 'rgba(20, 184, 166, 0.4)', color: 'var(--accent-teal)', fontWeight: '700' }}>
              <span>Access Junior Physiotherapist Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Admin Command Portal Card */}
          <div 
            onClick={onOpenAdminAuth}
            className="card"
            style={{ 
              cursor: 'pointer', 
              borderColor: 'rgba(168, 85, 247, 0.4)', 
              background: 'linear-gradient(135deg, rgba(23, 13, 36, 0.85) 0%, rgba(121, 26, 156, 0.15) 100%)',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'rgba(121, 26, 156, 0.2)', border: '1px solid rgba(168, 85, 247, 0.45)',
              color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Admin Portal</h3>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Executive</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Doctor &amp; CMO command cockpit. Manage appointments, patient registry, and clinic operating slots.
            </p>
            <button className="btn btn-admin btn-sm" style={{ width: '100%', fontWeight: '700' }}>
              <span>Access Admin Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Doctor & Nursing Care Profile */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Our Clinical Doctor &amp; Nursing Staff</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lead medical consultant and clinical rehabilitation nursing care team</p>
        </div>

        <div className="grid-cols-2">
          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', borderColor: 'var(--border-color)' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #791a9c, #d91b76)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.75rem',
              fontWeight: '800',
              boxShadow: '0 4px 14px rgba(219, 39, 119, 0.35)'
            }}>
              JC
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Dr. Joel Calvin C</h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Chief Physio &amp; Doctor</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Specializes in Sports Medicine, Joint Mobilization, and Post-ACL Surgical Recovery.
              </p>
            </div>
          </div>

          {/* Dynamic Clinical Nurse Card (Reflects Nurse Added by Doctor) */}
          {activeNurses.length > 0 ? (
            activeNurses.slice(0, 1).map(n => {
              const initials = n.fullName
                .replace(/^Nurse\s+/i, '')
                .split(' ')
                .map(part => part[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'RN';

              return (
                <div key={n.id} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', borderColor: 'var(--border-color)' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d91b76, #fbbf24)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    boxShadow: '0 4px 14px rgba(251, 191, 36, 0.35)'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{n.fullName}</h3>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Lead Clinical Nurse</span>
                      {n.shift && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{n.shift}</span>}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Expert in Patient Vital Monitoring, Post-Operative Care, Bedside Mobilization, and Home Visits. Supervised by Dr. Joel Calvin C.
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', borderColor: 'var(--border-color)' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(217, 27, 118, 0.4), rgba(251, 191, 36, 0.3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.75rem',
                fontWeight: '800'
              }}>
                🩺
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Clinical Duty Nursing Station</h3>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Direct Doctor Supervision</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Appointed directly by Dr. Joel Calvin C for in-clinic care, post-operative rehabilitation, and bedside vital monitoring.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED HOME VISIT FEATURE HIGHLIGHT */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(74, 14, 110, 0.35), rgba(251, 191, 36, 0.12))', borderColor: 'rgba(251, 191, 36, 0.45)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
              🚗 Special Home Visit Column &amp; Care Unit
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>
              Can't Travel to Clinic? We Bring Bedside Physiotherapy to Your Doorstep
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Our dedicated Home Visit Division brings portable ultrasound units, electrical muscle stimulators, and specialized exercise equipment right to your residence for senior citizens, post-surgery patients, and bedridden individuals.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="var(--accent-gold)" />
                <span>Doorstep Dispatch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="var(--accent-gold)" />
                <span>Custom Home Address Column</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="var(--accent-gold)" />
                <span>Evening Slots Available</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Home size={38} color="var(--accent-gold)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem' }}>Request Home Visit</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Provide your address and landmark for instant therapist assignment
            </p>
            <button onClick={() => onOpenBooking(true)} className="btn btn-admin" style={{ width: '100%' }}>
              <span>Book Home Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinic Services Offered */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.25rem' }}>Comprehensive Treatments</h2>
        <div className="grid-cols-3">
          <div className="card">
            <Activity size={28} color="var(--healix-magenta)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Sports Injury Rehab</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Ligament tear rehabilitation, hamstring strain recovery, and high-performance return-to-sport therapy.
            </p>
          </div>

          <div className="card">
            <Bone size={28} color="var(--healix-purple-light)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Orthopedic Care</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Spinal decompression, lumbar spondylosis treatment, shoulder frozen joint mobilization, and arthritis care.
            </p>
          </div>

          <div className="card">
            <Brain size={28} color="var(--healix-gold)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Neurological Physio</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Stroke recovery, Parkinson's gait training, balance re-education, and nerve injury rehabilitation.
            </p>
          </div>
        </div>
      </div>

      {/* DEDICATED CLINIC LOCATION & DIRECTIONS */}
      <div id="clinic-location" className="card" style={{
        background: 'linear-gradient(135deg, rgba(74, 14, 110, 0.35), rgba(217, 27, 118, 0.18))',
        borderColor: 'rgba(217, 27, 118, 0.45)',
        padding: '2.5rem 2rem'
      }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
                📍 Physical Clinic &amp; Location
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                Visit Healix Advance Physiotherapy Center
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Walk into our state-of-the-art clinic or navigate directly via Google Maps.
              </p>
            </div>

            <a
              href="https://maps.app.goo.gl/9ZwbWzGo3AVLExwL9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-cyan"
              style={{ textDecoration: 'none' }}
            >
              <Navigation size={18} />
              <span>Open Google Maps</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {/* Clinic Details Card */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  background: 'rgba(217, 27, 118, 0.2)',
                  color: 'var(--healix-magenta)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(219, 39, 119, 0.3)'
                }}>
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.35rem' }}>
                    Healix Advance Physiotherapy and Rehabilitation Center
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Comprehensive center for specialized Orthopedic rehabilitation, Sports Medicine, Post-Surgical recovery, and Pediatric Physiotherapy.
                  </p>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginTop: '0.5rem', marginBottom: 0, fontWeight: '600' }}>
                    📍 8/207 Pillayar Koil St, Nookampalayam Main Rd, Sithalapakkam, Chennai - 600131
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>● Open Today</span>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} /> 09:00 AM – 07:00 PM
                    </span>
                    <a 
                      href="tel:+917305394549" 
                      style={{ fontSize: '0.825rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}
                    >
                      <PhoneCall size={14} /> Doctor: +91 73053 94549
                    </a>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--accent-cyan)" />
                  <span>Dedicated Patient Parking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--accent-cyan)" />
                  <span>Wheelchair &amp; Ramp Access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--accent-cyan)" />
                  <span>Advanced Laser &amp; Ultrasound</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--accent-cyan)" />
                  <span>Home Visit Team Hub</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://maps.app.goo.gl/9ZwbWzGo3AVLExwL9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cyan"
                style={{ flex: 1, minWidth: '180px', textDecoration: 'none' }}
              >
                <Navigation size={18} />
                <span>Get Driving Directions</span>
                <ExternalLink size={14} />
              </a>

              <a
                href="tel:+917305394549"
                className="btn btn-secondary"
                style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: '700' }}
                title="Call Admin / Doctor Direct"
              >
                <PhoneCall size={18} />
                <span>Call Doctor (+91 73053 94549)</span>
              </a>

              <button
                onClick={handleCopyLocation}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                title="Copy Google Maps link"
              >
                {copiedLocation ? <Check size={18} color="var(--accent-green)" /> : <Copy size={18} />}
                <span>{copiedLocation ? 'Link Copied!' : 'Copy Maps Link'}</span>
              </button>

              <button
                onClick={() => onOpenBooking(false)}
                className="btn btn-secondary"
                style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
              >
                <Calendar size={18} />
                <span>Book Slot</span>
              </button>
            </div>
          </div>

          {/* Right: Interactive Clinic Location Map */}
          <ClinicLocationMap height="100%" minHeight="360px" />
        </div>
      </div>

      {/* Operating Hours Banner */}
      <div className="card" style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--healix-magenta)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock size={28} color="var(--healix-gold)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Clinic Timings & Working Hours</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Monday – Saturday: 09:00 AM – 07:00 PM | Evening Home Visits: 05:00 PM – 07:00 PM
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="#clinic-location"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('clinic-location')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <MapPin size={15} color="var(--healix-magenta)" />
            <span>Clinic Map</span>
          </a>
          <button onClick={() => onOpenBooking(false)} className="btn btn-cyan btn-sm">
            <span>Book Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
}

