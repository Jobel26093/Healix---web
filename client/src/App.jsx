import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import BookAppointmentModal from './components/BookAppointmentModal';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PatientHomePage from './pages/PatientHomePage';
import AdminHomePage from './pages/AdminHomePage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NurseDashboardPage from './pages/NurseDashboardPage';
import PatientPaymentPortal from './components/PatientPaymentPortal';

function PhysioAppContent() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [pendingBooking, setPendingBooking] = useState(null);
  
  // Initialize to the role's dedicated Home Page if logged in, or 'home'
  const [activeTab, setActiveTab] = useState(() => {
    if (currentUser?.role === 'ADMIN') return 'admin-home';
    if (currentUser?.role === 'NURSE') return 'nurse-dashboard';
    if (currentUser?.role === 'PATIENT') return 'patient-home';
    return 'home';
  });

  const [loginPortalRole, setLoginPortalRole] = useState('patient');

  // Automatically route to the role-specific Home Page whenever auth status changes
  useEffect(() => {
    if (!currentUser) {
      // When logged out, switch to login page if on a private portal
      if (['patient-home', 'patient-dashboard', 'patient-payments', 'nurse-dashboard', 'admin-home', 'admin-dashboard'].includes(activeTab)) {
        setActiveTab('login');
      }
    } else if (currentUser.role === 'ADMIN') {
      if (activeTab === 'login' || activeTab === 'portal' || activeTab === 'home') {
        setActiveTab('admin-home');
      }
    } else if (currentUser.role === 'NURSE') {
      if (activeTab === 'login' || activeTab === 'portal' || activeTab === 'home') {
        setActiveTab('nurse-dashboard');
      }
    } else if (currentUser.role === 'PATIENT') {
      if (activeTab === 'login' || activeTab === 'portal' || activeTab === 'home') {
        setActiveTab('patient-home');
      }
    }
  }, [currentUser]);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isHomeVisitBooking, setIsHomeVisitBooking] = useState(false);

  const openBookingModal = (homeVisitFlag = false) => {
    if (!currentUser) {
      setPendingBooking({ isHomeVisit: homeVisitFlag === true });
      setLoginPortalRole('patient');
      setActiveTab('login');
      toast.info("Please log in or register your Patient account to book a physiotherapy session.", "Patient Sign-In Required");
      return;
    }
    setIsHomeVisitBooking(homeVisitFlag === true);
    setIsBookingOpen(true);
  };

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      setActiveTab('admin-home');
    } else if (role === 'nurse') {
      setActiveTab('nurse-dashboard');
    } else {
      // Authenticated as Patient
      if (pendingBooking) {
        setIsHomeVisitBooking(pendingBooking.isHomeVisit);
        setIsBookingOpen(true);
        setPendingBooking(null);
        setActiveTab('patient-home');
        toast.success("Welcome! Continuing with your session booking...", "Ready to Book");
      } else {
        setActiveTab('patient-home');
      }
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const [adminTab, setAdminTab] = useState('appointments');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage 
            onOpenBooking={openBookingModal} 
            onOpenPatientAuth={() => { setLoginPortalRole('patient'); setActiveTab('login'); }}
            onOpenAdminAuth={() => { setLoginPortalRole('admin'); setActiveTab('login'); }}
            onOpenNurseAuth={() => { setLoginPortalRole('nurse'); setActiveTab('login'); }}
          />
        );
      case 'portal':
      case 'login':
        return (
          <LoginPage 
            initialRole={loginPortalRole}
            bookingNotice={pendingBooking}
            onGoHome={() => {
              setPendingBooking(null);
              setActiveTab('home');
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'patient-home':
        return (
          <PatientHomePage 
            onOpenBooking={openBookingModal} 
            onViewAppointments={() => setActiveTab('patient-dashboard')} 
            onViewPayments={() => setActiveTab('patient-payments')}
            onViewServices={() => setActiveTab('home')} 
          />
        );
      case 'patient-dashboard':
        return (
          <PatientDashboardPage 
            onOpenBooking={openBookingModal} 
            onOpenPatientAuth={() => { setLoginPortalRole('patient'); setActiveTab('login'); }}
            refreshTrigger={refreshKey}
          />
        );
      case 'patient-payments':
        return (
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <PatientPaymentPortal 
              onBackToDashboard={() => setActiveTab('patient-dashboard')} 
              onOpenBooking={openBookingModal}
              onPaymentSuccess={() => setRefreshKey(prev => prev + 1)}
            />
          </div>
        );
      case 'admin-home':
        return (
          <AdminHomePage 
            onViewAppointments={() => { setAdminTab('appointments'); setActiveTab('admin-dashboard'); }} 
            onViewPatients={() => { setAdminTab('patients'); setActiveTab('admin-dashboard'); }} 
            onViewTimings={() => { setAdminTab('timings'); setActiveTab('admin-dashboard'); }} 
            onViewSecurity={() => {}}
            onViewNurses={() => { setAdminTab('nurses'); setActiveTab('admin-dashboard'); }}
            onViewIncome={() => { setAdminTab('income'); setActiveTab('admin-dashboard'); }}
            onOpenBooking={openBookingModal} 
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboardPage 
            defaultTab={adminTab}
            onOpenAdminAuth={() => { setLoginPortalRole('admin'); setActiveTab('login'); }}
          />
        );
      case 'nurse-dashboard':
        return (
          <NurseDashboardPage 
            onOpenNurseAuth={() => { setLoginPortalRole('nurse'); setActiveTab('login'); }}
          />
        );
      default:
        return (
          <HomePage 
            onOpenBooking={openBookingModal} 
            onOpenPatientAuth={() => { setLoginPortalRole('patient'); setActiveTab('login'); }}
            onOpenAdminAuth={() => { setLoginPortalRole('admin'); setActiveTab('login'); }}
            onOpenNurseAuth={() => { setLoginPortalRole('nurse'); setActiveTab('login'); }}
          />
        );
    }
  };

  return (
    <div>
      <Navbar 
        onOpenPatientAuth={() => { setLoginPortalRole('patient'); setActiveTab('login'); }}
        onOpenAdminAuth={() => { setLoginPortalRole('admin'); setActiveTab('login'); }}
        onOpenNurseAuth={() => { setLoginPortalRole('nurse'); setActiveTab('login'); }}
        onOpenBooking={() => openBookingModal(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />

      <main className="main-layout">
        {renderActivePage()}
      </main>

      {/* Patient Self-Booking Modal */}
      <BookAppointmentModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        defaultHomeVisit={isHomeVisitBooking}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PhysioAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
