import React, { useState, useEffect } from 'react';
import { Calendar, Home, Clock, MapPin, X, CheckCircle, ArrowRight, LocateFixed, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function BookAppointmentModal({ isOpen, onClose, defaultHomeVisit = false, onSuccess }) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [services, setServices] = useState([]);
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patientName: currentUser ? currentUser.fullName : '',
    patientPhone: currentUser ? (currentUser.phone || '') : '',
    serviceName: defaultHomeVisit ? 'Personalized Home Visit Physiotherapy' : 'Orthopedic Physiotherapy',
    date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 11:00 AM',
    isHomeVisit: defaultHomeVisit,
    homeAddress: currentUser ? (currentUser.address || '') : '',
    landmark: '',
    locationUrl: '',
    notes: ''
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser. You can paste your Google Maps link or coordinates manually.", "Location Notice");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        setFormData(prev => ({ ...prev, locationUrl: mapsLink }));
        setGeoLoading(false);
        setGeoSuccess(true);
        setTimeout(() => setGeoSuccess(false), 5000);
      },
      (err) => {
        setGeoLoading(false);
        toast.error("Unable to detect device location: " + err.message + ". You can paste your Google Maps link or coordinates manually.", "Location Error");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        patientName: currentUser.fullName || prev.patientName,
        patientPhone: currentUser.phone || prev.patientPhone,
        homeAddress: currentUser.address || prev.homeAddress
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTimings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/timings');
        const data = await res.json();
        if (data && data.success) {
          setTimings(data.timings);
          setServices(data.services);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTimings();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.warning("Please sign in to your Patient account to book a session.", "Login Required");
      onClose();
      return;
    }
    if (formData.isHomeVisit && (!formData.homeAddress || formData.homeAddress.trim() === '')) {
      toast.warning("Please provide complete Home Address for Home Visit requests.", "Address Required");
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify({
          ...formData,
          patientId: currentUser ? currentUser.id : undefined,
          patientName: formData.patientName || currentUser?.fullName,
          patientPhone: formData.patientPhone || currentUser?.phone,
          visitType: formData.isHomeVisit ? "Home-Visit" : "In-Clinic"
        })
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(data.message, "Booking Confirmed");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to book appointment", "Booking Failed");
      }
    } catch (err) {
      toast.error("Error submitting request: " + err.message, "Submission Error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
              Book Physiotherapy Session / Request Home Visit
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Consultation Type Selector */}
            <div className="form-group">
              <label className="form-label">Select Consultation Location Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isHomeVisit: false, serviceName: 'Orthopedic Physiotherapy' })}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: !formData.isHomeVisit ? 'var(--accent-cyan)' : 'var(--border-color)',
                    background: !formData.isHomeVisit ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-input)',
                    color: !formData.isHomeVisit ? 'var(--accent-cyan)' : 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar size={18} />
                  <span>In-Clinic Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isHomeVisit: true, serviceName: 'Personalized Home Visit Physiotherapy' })}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: formData.isHomeVisit ? 'var(--accent-purple)' : 'var(--border-color)',
                    background: formData.isHomeVisit ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-input)',
                    color: formData.isHomeVisit ? 'var(--accent-purple)' : 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Home size={18} />
                  <span>Request Home Visit (+ Bedside Therapy)</span>
                </button>
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Patient Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="+1 (555) 012-3456"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Physiotherapy Service</label>
                <select 
                  className="form-select"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                >
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input 
                  type="date" 
                  required 
                  className="form-input" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Available Time Slot</label>
              <select 
                className="form-select"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              >
                {timings.filter(t => t.isAvailable).map(t => (
                  <option key={t.id} value={t.timeSlot}>
                    {t.timeSlot} ({t.day})
                  </option>
                ))}
              </select>
            </div>

            {/* EXPANDED HOME VISIT COLUMN / FIELDS */}
            {formData.isHomeVisit && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', fontWeight: '800', marginBottom: '0.75rem' }}>
                  <MapPin size={18} />
                  <span>Home Visit Dispatch Address Details</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Residential Address (House/Flat No, Street, Sector, City)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. 12 Baker Street, Apartment 4B, West Avenue"
                    value={formData.homeAddress}
                    onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nearby Landmark / Metro Station (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Opposite City Park Mall"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      House Location / Google Maps Link (Share Location)
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={geoLoading}
                      style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        color: 'var(--accent-purple)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <LocateFixed size={12} />
                      <span>{geoLoading ? 'Detecting GPS...' : '📍 Share / Detect GPS Location'}</span>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Paste Google Maps link, Plus Code, or GPS coordinates (e.g. 12.9249, 80.1472)"
                    value={formData.locationUrl}
                    onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  />
                  {geoSuccess && (
                    <div style={{ color: 'var(--accent-green)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                      <CheckCircle size={13} />
                      <span>Current device GPS location pinned successfully!</span>
                    </div>
                  )}
                  {formData.locationUrl && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <a 
                        href={formData.locationUrl.startsWith('http') ? formData.locationUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.locationUrl)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
                      >
                        <ExternalLink size={12} />
                        <span>Preview House Location on Google Maps ↗</span>
                      </a>
                    </div>
                  )}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.35rem', marginBottom: 0 }}>
                    Enables the visiting physiotherapist or nurse to navigate directly to your house.
                  </p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Medical History / Specific Symptoms Note</label>
              <textarea 
                rows={2} 
                className="form-textarea" 
                placeholder="Describe stiffness, joint pain, or post-op instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className={formData.isHomeVisit ? "btn btn-admin" : "btn btn-cyan"}>
              <span>{formData.isHomeVisit ? "Submit Home Visit Request" : "Confirm Appointment"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
