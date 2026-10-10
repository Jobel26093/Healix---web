import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, HelpCircle } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', title = null, duration = 4500) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, message, type, title, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const confirm = useCallback(({ 
    title = 'Action Confirmation', 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    isDanger = false, 
    onConfirm 
  }) => {
    setConfirmModal({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: () => {
        setConfirmModal(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmModal(null);
      }
    });
  }, []);

  const toast = {
    success: (msg, title) => addToast(msg, 'success', title),
    error: (msg, title) => addToast(msg, 'error', title),
    info: (msg, title) => addToast(msg, 'info', title),
    warning: (msg, title) => addToast(msg, 'warning', title),
    confirm,
    dismiss: removeToast
  };

  useEffect(() => {
    // Intercept native browser alert() to use the brand-aligned Healix toast!
    const originalAlert = window.alert;
    window.alert = (message) => {
      const msgStr = String(message || '');
      const isErr = /fail|error|unable|invalid|denied|wrong/i.test(msgStr);
      if (isErr) {
        addToast(msgStr, 'error', 'Action Notice');
      } else {
        addToast(msgStr, 'success', 'Confirmed');
      }
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          let IconComponent = CheckCircle2;
          let iconColor = 'var(--accent-gold, #fbbf24)';
          let badgeBorder = 'rgba(251, 191, 36, 0.45)';
          let badgeBg = 'rgba(251, 191, 36, 0.15)';
          let defaultTitle = 'Success';

          if (t.type === 'error') {
            IconComponent = AlertCircle;
            iconColor = 'var(--accent-red, #ef4444)';
            badgeBorder = 'rgba(239, 68, 68, 0.45)';
            badgeBg = 'rgba(239, 68, 68, 0.15)';
            defaultTitle = 'Notice';
          } else if (t.type === 'warning') {
            IconComponent = AlertTriangle;
            iconColor = 'var(--accent-amber, #f59e0b)';
            badgeBorder = 'rgba(245, 158, 11, 0.45)';
            badgeBg = 'rgba(245, 158, 11, 0.15)';
            defaultTitle = 'Warning';
          } else if (t.type === 'info') {
            IconComponent = Info;
            iconColor = 'var(--accent-magenta, #d91b76)';
            badgeBorder = 'rgba(217, 27, 118, 0.45)';
            badgeBg = 'rgba(217, 27, 118, 0.15)';
            defaultTitle = 'Information';
          }

          return (
            <div key={t.id} className={`healix-toast healix-toast-${t.type}`}>
              <div 
                className="toast-icon-wrap"
                style={{ 
                  background: badgeBg, 
                  border: `1px solid ${badgeBorder}`,
                  color: iconColor
                }}
              >
                <IconComponent size={20} />
              </div>
              <div className="toast-body">
                <div className="toast-title">
                  {t.title || defaultTitle}
                </div>
                <div className="toast-message">
                  {t.message}
                </div>
              </div>
              <button 
                onClick={() => removeToast(t.id)} 
                className="toast-close-btn"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
              <div 
                className="toast-progress-bar" 
                style={{ animationDuration: `${t.duration || 4500}ms` }}
              />
            </div>
          );
        })}
      </div>

      {/* Brand-Styled Confirmation Modal (Replacing native browser window.confirm) */}
      {confirmModal && (
        <div className="modal-overlay" style={{ zIndex: 1000000 }}>
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '460px', 
              border: confirmModal.isDanger 
                ? '1px solid rgba(239, 68, 68, 0.5)' 
                : '1px solid rgba(217, 27, 118, 0.45)',
              boxShadow: confirmModal.isDanger 
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.25)' 
                : '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(217, 27, 118, 0.25)',
              background: 'rgba(23, 13, 36, 0.98)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: confirmModal.isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  border: confirmModal.isDanger ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(251, 191, 36, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: confirmModal.isDanger ? 'var(--accent-red)' : 'var(--accent-gold)'
                }}>
                  {confirmModal.isDanger ? <AlertTriangle size={18} /> : <HelpCircle size={18} />}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#fdf8fe' }}>
                  {confirmModal.title}
                </h3>
              </div>
              <button 
                onClick={confirmModal.onCancel}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
                {confirmModal.message}
              </p>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)' }}>
              <button 
                type="button" 
                onClick={confirmModal.onCancel}
                className="btn btn-secondary btn-sm"
              >
                {confirmModal.cancelText}
              </button>
              <button 
                type="button" 
                onClick={confirmModal.onConfirm}
                className="btn btn-sm"
                style={{
                  background: confirmModal.isDanger 
                    ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' 
                    : 'var(--gradient-brand)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: confirmModal.isDanger
                    ? '0 4px 14px rgba(239, 68, 68, 0.35)'
                    : '0 4px 14px rgba(217, 27, 118, 0.35)'
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => window.alert(msg),
      error: (msg) => window.alert(msg),
      info: (msg) => window.alert(msg),
      warning: (msg) => window.alert(msg),
      confirm: ({ onConfirm }) => { if (window.confirm('Confirm action?')) onConfirm(); },
      dismiss: () => {}
    };
  }
  return context;
};
