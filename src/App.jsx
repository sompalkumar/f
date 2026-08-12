import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import SemMaterial from './pages/SemMaterial'; // 💡 पिछला SemMaterial रूट भी जोड़ दिया गया है

// 🟢 Role-based route guards
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';

// 🌐 सेंट्रल API Base URL कॉन्फ़िगरेशन
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showPortalModal, setShowPortalModal] = useState(false);

  // 🚪 ऑटो-लॉगआउट हैंडलर
  const handleAutoLogout = useCallback(async (isExpiredByInactivity = true) => {
    const logId = sessionStorage.getItem('logId');
    
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

    // डेटा साफ़ करें
    localStorage.clear();
    sessionStorage.clear();

    if (isExpiredByInactivity) {
      alert('⏰ आपकी सेशन समय-सीमा (5 मिनट) समाप्त हो गई है!');
    }
    window.location.replace('/');
  }, []);

  // 🛡️ 5 मिनट का ऑटोमैटिक इनएक्टिविटी लॉगआउट टाइमर + मल्टी-टैब सिंक
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return; 

    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 मिनट
    let timeoutId;
    let lastActivityTime = Date.now();

    const resetTimer = () => {
      const now = Date.now();
      // Throttling: 1 सेकंड से पहले बार-बार रीसेट न करें (Performance Fix)
      if (now - lastActivityTime > 1000) {
        lastActivityTime = now;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleAutoLogout(true), INACTIVITY_LIMIT);
      }
    };

    // मल्टी-टैब सिंक: अगर किसी दूसरे टैब में लॉगआउट हुआ हो तो तुरंत यह टैब भी साफ़ हो जाए
    const handleStorageChange = (e) => {
      if (e.key === 'isLoggedIn' && e.newValue === null) {
        window.location.replace('/');
      }
    };

    // 'mousemove' को हटाकर केवल ज़रूरी इवेंट्स रखे गए हैं ताकि लेग न हो
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    window.addEventListener('storage', handleStorageChange);

    // टाइमर शुरू करें
    timeoutId = setTimeout(() => handleAutoLogout(true), INACTIVITY_LIMIT);

    return () => {
      clearTimeout(timeoutId);
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

        {/* Student Protected Routes */}
        <Route element={<StudentRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/course/:courseId/sem/:semId" element={<SemMaterial />} />
        </Route>

        {/* Admin Protected Routes */}
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