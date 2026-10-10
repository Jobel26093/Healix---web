import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [authError, setAuthError] = useState(null);

  const parseJsonSafe = async (res) => {
    try {
      const text = await res.text();
      if (!text) {
        return { 
          success: false, 
          error: res.ok 
            ? "Empty response from server" 
            : `Server connection error (HTTP ${res.status}). Please ensure backend is running.` 
        };
      }
      return JSON.parse(text);
    } catch {
      return { 
        success: false, 
        error: `Invalid response from server (HTTP ${res.status}).` 
      };
    }
  };

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await parseJsonSafe(res);
      if (data && data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
    setLoading(false);
  };

  const patientLogin = async (usernameOrEmail, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Login failed");
        return false;
      }
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const adminLogin = async (usernameOrEmail, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Admin Login failed");
        return false;
      }
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const nurseLogin = async (usernameOrEmail, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/nurse-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Nurse Login failed");
        return false;
      }
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const sendOtp = async (identifier, portalType) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, portalType })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Failed to dispatch verification OTP");
        return { success: false, error: data.error || "Failed to dispatch verification OTP" };
      }
      return { 
        success: true, 
        message: data.message, 
        email: data.email, 
        maskedEmail: data.maskedEmail,
        userRole: data.userRole,
        devOtp: data.devOtp 
      };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const sendAdminOtp = async (identifier) => {
    return sendOtp(identifier, 'admin');
  };

  const updateAdminPassword = async (newPassword, confirmPassword, otp) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/update-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword, otp })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Failed to update administrator password");
        return { success: false, error: data.error || "Failed to update administrator password" };
      }
      return { success: true, message: data.message, email: data.email };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (identifier, newPassword, confirmPassword, portalType, otp) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, newPassword, confirmPassword, portalType, otp })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Password reset failed");
        return { success: false, error: data.error || "Password reset failed" };
      }
      return { success: true, message: data.message, username: data.username, email: data.email };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const patientRegister = async (formData) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Registration failed");
        return false;
      }
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // Always clear the local session, even if the server request fails
      setCurrentUser(null);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      theme,
      toggleTheme,
      patientLogin,
      adminLogin,
      nurseLogin,
      patientRegister,
      sendOtp,
      sendAdminOtp,
      updateAdminPassword,
      resetPassword,
      logout,
      authError,
      clearAuthError: () => setAuthError(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
