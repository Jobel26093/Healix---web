import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Home, 
  Clock, 
  MapPin, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  PhoneCall, 
  ExternalLink,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  ChevronRight,
  RotateCw,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PatientHomePage({ 
  onOpenBooking, 
  onViewAppointments, 
  onViewPayments,
  onViewServices 
}) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?patientId=${currentUser.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        }
      });
      const data = await res.json();
      if (data && data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatientData();
  }, [currentUser]);

  if (!currentUser) return null;

  // Find next upcoming active appointment
  const activeAppointments = appointments.filter(a => a.status !== 'Cancelled');
  const nextAppointment = activeAppointments.length > 0 ? activeAppointments[0] : null;

  const totalSessions = appointments.length;
  const homeVisits = appointments.filter(a => a.isHomeVisit).length;
  const completedSessions = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 1. Hero Greeting Banner */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(74, 14, 110, 0.45) 0%, rgba(217, 27, 118, 0.22) 55%, rgba(251, 191, 36, 0.1) 100%)',
          borderColor: 'rgba(217, 27, 118, 0.45)',
          padding: '2.25rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem', background: 'rgba(217, 27, 118, 0.25)', color: '#f472b6', borderColor: '#d91b76' }}>
                🏠 Patient Personal Home
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                ID: {currentUser.id || 'PT-2026'}
              </span>
              {currentUser.medicalCondition && (
                <span className="badge" style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', border: '1px solid #9333ea', fontSize: '0.72rem' }}>
                  🩺 {currentUser.medicalCondition}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.02em', margin: 0 }}>
              Welcome Home, <span style={{ color: 'var(--accent-gold)' }}>{currentUser.fullName}</span>!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
              Your dedicated recovery space. Track your upcoming therapy sessions, request certified home visit physiotherapists, and access doctor-recommended mobility guidelines.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onOpenBooking(false)} 
              className="btn btn-cyan btn-sm"
              style={{ fontWeight: '800' }}
            >
              <Plus size={16} />
              <span>Book In-Clinic</span>
            </button>
            <button 
              onClick={() => onOpenBooking(true)} 
              className="btn btn-gold btn-sm"
              style={{ fontWeight: '800' }}
            >
              <Home size={16} />
              <span>Request Home Visit</span>
            </button>
            <button 
              onClick={onViewPayments} 
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: '800', borderColor: 'rgba(6, 182, 212, 0.45)', color: 'var(--accent-cyan)' }}
            >
              <CreditCard size={16} />
              <span>Payment Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Spotlight: Next Scheduled Session */}
      <div 
        className="card"
        style={{
          border: '1px solid rgba(251, 191, 36, 0.45)',
          background: 'rgba(23, 13, 36, 0.95)',
          boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.7), 0 0 20px rgba(251, 191, 36, 0.15)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(251, 191, 36, 0.18)', border: '1px solid rgba(251, 191, 36, 0.4)',
              color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                Next Upcoming Session
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Confirmed Physiotherapy Schedule
              </p>
            </div>
          </div>

          <button 
            onClick={fetchPatientData} 
            className="btn btn-secondary btn-sm" 
            title="Refresh"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {nextAppointment ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span className={nextAppointment.isHomeVisit ? 'badge badge-homevisit' : 'badge badge-cyan'}>
                  {nextAppointment.isHomeVisit ? '🏡 Home Visit Service' : '🏥 In-Clinic Session'}
                </span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  ● {nextAppointment.status || 'Confirmed'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: '0.2rem 0' }}>
                {nextAppointment.serviceName}
              </h4>
              <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--accent-gold)" />
                  <strong style={{ color: 'var(--text-main)' }}>{nextAppointment.date}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={15} color="var(--accent-magenta)" />
                  {nextAppointment.timeSlot}
                </span>
                {nextAppointment.isHomeVisit && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} color="var(--accent-gold)" />
                    {nextAppointment.homeAddress || currentUser.address || 'Address registered'}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {nextAppointment.paymentStatus !== 'PAID' && (
                <button 
                  onClick={onViewPayments} 
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.22), rgba(217, 27, 118, 0.22))',
                    border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold)',
                    fontWeight: '800'
                  }}
                >
                  <CreditCard size={14} />
                  <span>Pay Session Online</span>
                </button>
              )}
              <button 
                onClick={onViewAppointments} 
                className="btn btn-secondary btn-sm"
              >
                <span>View Full Schedule</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Activity size={36} color="var(--accent-gold)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.85 }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.3rem' }}>
              No upcoming appointments booked
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
              Need physiotherapy care or post-injury rehabilitation? Schedule your clinic appointment or request a physiotherapist at your home.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={() => onOpenBooking(false)} className="btn btn-cyan btn-sm">
                Book In-Clinic Session
              </button>
              <button onClick={() => onOpenBooking(true)} className="btn btn-gold btn-sm">
                Request Home Visit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Patient Vitals & Health Summary Counters */}
      <div className="grid-cols-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-magenta)', marginBottom: '0.35rem' }}>
            <Calendar size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Total Bookings</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '900' }}>{totalSessions}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>All sessions registered</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '0.35rem' }}>
            <Clock size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Active Sessions</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--accent-gold)' }}>{activeAppointments.length}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Scheduled &amp; In progress</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', marginBottom: '0.35rem' }}>
            <Home size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Home Dispatches</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--healix-magenta-light)' }}>{homeVisits}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Doorstep Physio Visits</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', marginBottom: '0.35rem' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Completed</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#10b981' }}>{completedSessions}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Successful Rehabilitations</p>
        </div>
      </div>

      {/* 4. Quick Action Modules */}
      <div className="grid-cols-4">
        <div 
          onClick={() => onOpenBooking(false)}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--border-color)' }}
        >
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(217, 27, 118, 0.18)', border: '1px solid rgba(217, 27, 118, 0.4)',
            color: 'var(--accent-magenta)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem'
          }}>
            <Calendar size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Book Clinic Therapy
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
            Schedule an in-clinic consultation with state-of-the-art rehabilitation equipment.
          </p>
          <div style={{ color: 'var(--accent-magenta)', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Book In-Clinic Now <ArrowRight size={14} />
          </div>
        </div>

        <div 
          onClick={() => onOpenBooking(true)}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'rgba(251, 191, 36, 0.4)' }}
        >
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(251, 191, 36, 0.18)', border: '1px solid rgba(251, 191, 36, 0.4)',
            color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem'
          }}>
            <Home size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Request Home Visit
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
            Doorstep physiotherapist visit tailored for elderly care, post-op recovery &amp; stroke rehabilitation.
          </p>
          <div style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Request Home Physio <ArrowRight size={14} />
          </div>
        </div>

        <div 
          onClick={onViewAppointments}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'var(--border-color)' }}
        >
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(121, 26, 156, 0.18)', border: '1px solid rgba(121, 26, 156, 0.4)',
            color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem'
          }}>
            <Clock size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Manage Appointments
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
            View your complete history, modify session notes, update your address, or cancel bookings.
          </p>
          <div style={{ color: 'var(--accent-purple)', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Open Appointments Table <ArrowRight size={14} />
          </div>
        </div>

        <div 
          onClick={onViewPayments}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: 'rgba(6, 182, 212, 0.45)' }}
        >
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.18)', border: '1px solid rgba(6, 182, 212, 0.4)',
            color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem'
          }}>
            <CreditCard size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Payment &amp; Invoices
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
            Settle session fees via UPI apps, Card, Net Banking, or Insurance &amp; download GST receipts.
          </p>
          <div style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Open Payment Desk <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* 5. Doctor's Recovery Tips & Home Care Guidelines */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(23, 13, 36, 0.95) 0%, rgba(32, 19, 50, 0.95) 100%)',
          borderColor: 'rgba(147, 51, 234, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--accent-purple)' }}>
          <HeartPulse size={22} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            Doctor's Recovery Guidelines &amp; At-Home Physio Advice
          </h3>
        </div>

        <div className="grid-cols-3">
          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '800', color: 'var(--accent-magenta)', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              🧘 1. Spinal Decompression &amp; Mobility
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Perform 10 minutes of gentle pelvic tilts and prone press-ups daily. Avoid sudden flexion or twisting while bending forward.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              🧊 2. Contrast Ice &amp; Heat Protocol
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Apply cold packs for 15 minutes after high mobility sessions to prevent inflammation. Use warm heat packs for chronic stiffness.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '800', color: 'var(--accent-teal)', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              💧 3. Hydration &amp; Cartilage Recovery
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Maintain 2.5L to 3L daily hydration. Synovial joint fluid depends on steady hydration for frictionless joint mobilization.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Emergency Helpline & Clinic Direct Support */}
      <div 
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.75rem',
          background: 'rgba(23, 13, 36, 0.75)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
              Need Assistance or Emergency Physiotherapy Support?
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Call Clinic / Doctor Desk at <a href="tel:+917305394549" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: '800' }}>+91 73053 94549</a> &bull; Open Mon-Sat 9:00 AM – 8:00 PM
            </p>
          </div>
        </div>

        <a 
          href="https://maps.app.goo.gl/9ZwbWzGo3AVLExwL9" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-secondary btn-sm"
        >
          <MapPin size={14} color="var(--accent-gold)" />
          <span>Get Clinic Directions</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
