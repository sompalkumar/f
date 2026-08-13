import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config'; // Apne folder structure ke hisab se path adjust kar lein (e.g. './config')

function Navbar({ onTabChange, activeTab, onLoginClick }) {
  const navigate = useNavigate();

  // 🟢 Session aur Local Storage dono checks Sync
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole');

  // 🚪 Backend API ke saath Secure Logout Function
  const handleLogout = async () => {
    const logId = 
      sessionStorage.getItem('logId') || 
      localStorage.getItem('logId');

    // 1. Agar logId hai to Backend API hit karke duration calculate karein
    if (logId) {
      try {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId })
        });
      } catch (error) {
        console.error('Logout API Error:', error);
      }
    }

    // 2. Clear all Session & Local Storage
    localStorage.clear();
    sessionStorage.clear();

    // 3. User ko Home page par redirect karein
    window.location.replace('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between', // 🟢 FIXED: 'justify' corrected to 'justifyContent'
      alignItems: 'center',
      padding: '12px 30px',
      backgroundColor: '#06dfd1',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Logo / Title */}
      <h2 
        style={{ margin: 0, fontSize: '22px', cursor: 'pointer', fontWeight: 'bold', color: '#1a1a1a' }} 
        onClick={() => { 
          if (onTabChange) onTabChange('home'); 
          navigate('/'); 
        }}
      >
        📚 BCA Portal
      </h2>

      {/* 🛡️ Middle Navigation Links: Tabhi dikhenge jab user logged out ho */}
      {!isLoggedIn && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onTabChange && onTabChange('home')} style={navLinkStyle(activeTab === 'home')}>Home</button>
          <button onClick={() => onTabChange && onTabChange('chairman')} style={navLinkStyle(activeTab === 'chairman')}>Chairman's Message</button>
          <button onClick={() => onTabChange && onTabChange('students')} style={navLinkStyle(activeTab === 'students')}>For Students</button>
          <button onClick={() => onTabChange && onTabChange('about')} style={navLinkStyle(activeTab === 'about')}>About Us</button>
        </div>
      )}

      {/* Right Side Buttons */}
      <div>
        {!isLoggedIn ? (
          <button 
            onClick={onLoginClick} 
            style={{
              padding: '8px 20px',
              backgroundColor: 'white',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            Login or Register
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Admin Panel Button */}
            {userRole === 'admin' && (
              <button 
                onClick={() => navigate('/admin-dashboard')} 
                style={actionButtonStyle}
              >
                👑 Admin Panel
              </button>
            )}

            {/* Dashboard Button */}
            <button 
              onClick={() => navigate('/dashboard')} 
              style={actionButtonStyle}
            >
              📊 Dashboard
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              style={{
                ...actionButtonStyle,
                backgroundColor: '#ff4d4d',
                color: 'white'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// 🎨 Links Styling Helper
const navLinkStyle = (isActive) => ({
  padding: '8px 16px',
  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
  color: '#1a1a1a',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: '0.2s',
  outline: 'none'
});

// 🎨 Action Buttons Styling
const actionButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#ffffff',
  color: '#1a1a1a',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '14px',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

export default Navbar;