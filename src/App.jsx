import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import SemMaterial from './pages/SemMaterial';
import ForgotPassword from './pages/ForgotPassword';

// 📜 Legal Pages Import
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Disclaimer from './pages/Disclaimer';

// 🟢 Role-based route guards
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';

// 🌐 Central API Base URL Configuration
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showPortalModal, setShowPortalModal] = useState(false);

  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // 🚪 Auto-Logout Handler
  const handleAutoLogout = useCallback(async (isExpiredByInactivity = true) => {
    const logId = sessionStorage.getItem('logId') || localStorage.getItem('logId');
    
    if (logId) {
      try {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId })
        });
      } catch (error) { 
        console.error("Auto logout backend sync failed:", error); 
      }
    }

    // Clear all persistent storage
    localStorage.clear();
    sessionStorage.clear();

    if (isExpiredByInactivity) {
      alert('🔒 Session Expired: Your session has timed out due to inactivity. Please log in again to continue.');
    }
    window.location.replace('/');
  }, []);

  // 🛡️ 5-Minute Inactivity Timer + Multi-Tab Sync
  useEffect(() => {
    const isLoggedIn = 
      sessionStorage.getItem('isLoggedIn') === 'true' || 
      localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) return; 

    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) {
        lastActivityRef.current = now;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => handleAutoLogout(true), INACTIVITY_LIMIT);
      }
    };

    const handleStorageChange = (e) => {
      if ((e.key === 'isLoggedIn' || e.key === 'token') && e.newValue === null) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace('/');
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    window.addEventListener('storage', handleStorageChange);

    timeoutRef.current = setTimeout(() => handleAutoLogout(true), INACTIVITY_LIMIT);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleAutoLogout]);

  return (
    <Router>
      <Navbar 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        onLoginClick={() => setShowPortalModal(true)} 
      /> 
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <Register 
            activeTab={activeTab} 
            showPortalModal={showPortalModal} 
            setShowPortalModal={setShowPortalModal} 
          />
        } />

        {/* Password Reset Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Legal & Policy Public Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* Student Protected Routes */}
        <Route element={<StudentRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/course/:courseId/sem/:semId" element={<SemMaterial />} />
        </Route>

        {/* Strict Admin Protected Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Fallback - Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;