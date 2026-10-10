import React, { useState, useEffect, useCallback } from 'react';
import { Stethoscope, ShieldCheck, Calendar, Users, Home, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NURSE_STATUSES = ['Confirmed', 'Pending Dispatch', 'Completed'];

export default function NurseDashboardPage({ onOpenNurseAuth }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctor, setDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [noteDrafts, setNoteDrafts] = useState({});

  const isNurse = currentUser?.role === 'NURSE';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const headers = { 'x-user-id': currentUser?.id || '' };
    try {
      const [aptRes, patRes] = await Promise.all([
        fetch('/api/nurse/appointments', { headers }),
        fetch('/api/nurse/patients', { headers })
      ]);
      const aptData = await aptRes.json();
      const patData = await patRes.json();
      if (!aptRes.ok || !aptData.success) throw new Error(aptData.error || 'Failed to load appointments');
      setAppointments(aptData.appointments);
      setDoctor(aptData.supervisingDoctor);
      if (patRes.ok && patData.success) setPatients(patData.patients);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (isNurse) fetchData();
  }, [isNurse, fetchData]);

  const updateAppointment = async (id, payload) => {
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/nurse/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser?.id || '' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed');
      setMessage(data.message);
      toast.success(data.message, "Clinical Record Updated");
      setAppointments(prev => prev.map(a => (a.id === id ? data.appointment : a)));
    } catch (err) {
      setError(err.message);
      toast.error(err.message, "Update Failed");
    }
  };

  if (!isNurse) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', borderColor: 'var(--accent-teal)' }}>
        <ShieldCheck size={48} color="var(--accent-teal)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Junior Physiotherapist Authorization Required
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem auto', maxWidth: '520px' }}>
          This area is for clinic junior physiotherapists only. Please sign in through the Junior Physiotherapist Portal.
        </p>
        <button onClick={onOpenNurseAuth} className="btn btn-cyan">Access Junior Physiotherapist Portal</button>
      </div>
    );
  }

  const homeVisits = appointments.filter(a => a.isHomeVisit).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'var(--accent-teal)' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', color: '#fff',
          background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Stethoscope size={28} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge" style={{ background: 'rgba(20, 184, 166, 0.2)', color: '#2dd4bf', border: '1px solid #14b8a6', fontSize: '0.72rem' }}>
              🩺 Junior Physiotherapist Station
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
              Clinical Duty Active
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Junior Physiotherapist Station — {currentUser.fullName}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Clinical Rehabilitation &amp; Treatment Care &bull; Supervised by <strong style={{ color: 'var(--accent-teal)' }}>{doctor || currentUser.supervisingDoctor || 'Dr. Joel Calvin C'}</strong>
          </p>
        </div>
      </div>

      <div className="grid-cols-3">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
            <Calendar size={18} /><span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Total Appointments</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{appointments.length}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
            <Home size={18} /><span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Home Visits</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{homeVisits}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal)' }}>
            <Users size={18} /><span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Assigned Patients</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{patients.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('appointments')}
          style={{ borderColor: activeTab === 'appointments' ? 'var(--accent-teal)' : 'transparent' }}
        >
          <Calendar size={15} /><span>Appointments &amp; Visits</span>
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('patients')}
          style={{ borderColor: activeTab === 'patients' ? 'var(--accent-teal)' : 'transparent' }}
        >
          <Users size={15} /><span>Patients</span>
        </button>
      </div>

      {message && (
        <div style={{ color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: '600' }}>✔ {message}</div>
      )}
      {error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: '600' }}>⚠️ {error}</div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading junior physiotherapist station…</div>
      ) : activeTab === 'appointments' ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Date &amp; Time</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Physio Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No clinic appointments scheduled yet.
                    </td>
                  </tr>
                ) : (
                  appointments.map(apt => {
                    const draft = noteDrafts[apt.id] !== undefined ? noteDrafts[apt.id] : (apt.nurseNotes || '');
                    return (
                      <tr key={apt.id}>
                        <td>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{apt.patientName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patientPhone}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem', fontWeight: '600' }}>{apt.serviceName}</td>
                        <td>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{apt.date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.timeSlot}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {apt.isHomeVisit ? (
                            <div>
                              <div style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>
                                {apt.homeAddress}{apt.landmark ? ` (Landmark: ${apt.landmark})` : ''}
                              </div>
                              {apt.locationUrl && (
                                <div style={{ marginTop: '0.25rem' }}>
                                  <a
                                    href={apt.locationUrl.startsWith('http') ? apt.locationUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.locationUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--accent-teal)', fontSize: '0.72rem', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  >
                                    🗺️ Open House Map Pin ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>In-Clinic Session</span>
                          )}
                        </td>
                        <td>
                          {apt.status === 'Cancelled' ? (
                            <span className="badge badge-danger">Cancelled</span>
                          ) : (
                            <select
                              className="form-select"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', width: '150px' }}
                              value={apt.status}
                              onChange={(e) => updateAppointment(apt.id, { status: e.target.value })}
                            >
                              {NURSE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', minWidth: '160px' }}
                              placeholder="Treatment notes, exercises, vitals…"
                              value={draft}
                              onChange={(e) => setNoteDrafts({ ...noteDrafts, [apt.id]: e.target.value })}
                            />
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Save note"
                              onClick={() => updateAppointment(apt.id, { nurseNotes: draft })}
                            >
                              <Save size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age / Gender</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Medical Condition</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No patients assigned to {doctor} yet.
                    </td>
                  </tr>
                ) : (
                  patients.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.fullName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.age} / {p.gender}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.phone}</td>
                      <td style={{ fontSize: '0.8rem' }}>{p.address}</td>
                      <td style={{ fontSize: '0.8rem' }}>{p.medicalCondition}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
