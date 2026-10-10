import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X, CheckCircle, AlertTriangle, ArrowRight, LocateFixed, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ManageAppointmentModal({ isOpen, onClose, appointment, onUpdateSuccess }) {
  const toast = useToast();
  if (!isOpen || !appointment) return null;

  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: appointment.date || '',
    timeSlot: appointment.timeSlot || '',
    homeAddress: appointment.homeAddress || '',
    landmark: appointment.landmark || '',
    locationUrl: appointment.locationUrl || '',
    notes: appointment.notes || ''
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        date: appointment.date || '',
        timeSlot: appointment.timeSlot || '',
        homeAddress: appointment.homeAddress || '',
        landmark: appointment.landmark || '',
        locationUrl: appointment.locationUrl || '',
        notes: appointment.notes || ''
      });
      setError(null);
      setSuccessMsg(null);
    }
  }, [appointment]);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const res = await fetch('/api/timings');
        const data = await res.json();
        if (data && data.success) {
          setTimings(data.timings || []);
        }
      } catch (err) {
        console.error("Failed to load clinic timings:", err);
      }
    };
    fetchTimings();
  }, [isOpen]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser.", "Location Notice");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        setFormData(prev => ({ ...prev, locationUrl: mapsLink }));
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        toast.error("Unable to detect device location: " + err.message, "Location Error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/appointments/${appointment.id}/manage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errTxt = data.error || "Failed to update appointment";
        setError(errTxt);
        toast.error(errTxt, "Update Failed");
        setLoading(false);
        return;
      }

      const msg = data.message || "Appointment updated successfully!";
      setSuccessMsg(msg);
      toast.success(msg, "Appointment Updated");
      setLoading(false);
      if (onUpdateSuccess) onUpdateSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message, "Update Failed");
      setLoading(false);
    }
  };

  const handleCancelAppointment = () => {
    toast.confirm({
      title: 'Cancel Appointment Session',
      message: `Are you sure you want to cancel your ${appointment.serviceName} session on ${appointment.date} at ${appointment.timeSlot}? The slot will be released for other patients.`,
      confirmText: 'Yes, Cancel Session',
      cancelText: 'Keep Session',
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/appointments/${appointment.id}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            const errTxt = data.error || "Failed to cancel appointment";
            setError(errTxt);
            toast.error(errTxt, "Cancellation Failed");
            setLoading(false);
            return;
          }

          toast.success("Your session has been cancelled. The time slot has been freed up.", "Session Cancelled");
          setLoading(false);
          if (onUpdateSuccess) onUpdateSuccess();
          onClose();
        } catch (err) {
          setError(err.message);
          toast.error(err.message, "Cancellation Error");
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                Manage & Reschedule Appointment
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {appointment.serviceName} • {appointment.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--accent-red)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-green)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Current Status Banner */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Status</span>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                  <span className={`badge ${appointment.status === 'Confirmed' ? 'badge-success' : (appointment.status === 'Cancelled' ? 'badge-danger' : 'badge-warning')}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Specialist</span>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                  {appointment.assignedPhysio || 'Dr. Joel Calvin C'}
                </div>
              </div>
            </div>

            {/* Date & Time Reschedule */}
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Reschedule Date</label>
                <input 
                  type="date"
                  required
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Time Slot</label>
                <select
                  className="form-select"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                >
                  {timings.filter(t => t.isAvailable || t.timeSlot === appointment.timeSlot).map(t => (
                    <option key={t.id} value={t.timeSlot}>
                      {t.timeSlot} ({t.day})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Home Visit Address & Location Details (if Home Visit) */}
            {appointment.isHomeVisit && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', fontWeight: '800', marginBottom: '0.75rem' }}>
                  <MapPin size={18} />
                  <span>Update Home Visit Address & GPS Location</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input 
                    type="text"
                    required
                    className="form-input"
                    value={formData.homeAddress}
                    onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nearby Landmark (Optional)</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      House GPS Location / Map Link
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
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <LocateFixed size={12} />
                      <span>{geoLoading ? 'Detecting...' : '📍 Share / Detect GPS Location'}</span>
                    </button>
                  </div>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Paste Google Maps pin link or coordinates"
                    value={formData.locationUrl}
                    onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  />
                  {formData.locationUrl && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <a 
                        href={formData.locationUrl.startsWith('http') ? formData.locationUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.locationUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <ExternalLink size={12} />
                        <span>Preview Location on Google Maps ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Medical Symptoms & Visit Notes</label>
              <textarea 
                rows={2}
                className="form-textarea"
                placeholder="Update symptoms, pain notes, or instructions for the physiotherapist..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {appointment.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{
                    color: 'var(--accent-red)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Trash2 size={15} />
                  <span>Cancel Session</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Close
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-cyan"
              >
                <span>{loading ? 'Saving...' : 'Save & Reschedule'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
