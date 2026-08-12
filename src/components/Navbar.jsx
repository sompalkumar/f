import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ onTabChange, activeTab, onLoginClick }) {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');

  // 🚪 बैकएंड API के साथ सुरक्षात्मक लॉगआउट फंक्शन
  const handleLogout = async () => {
    const logId = sessionStorage.getItem('logId');

    // 1. अगर logId मौजूद है तो बैकएंड पर लॉगआउट टाइम दर्ज करें
    if (logId) {
      try {
        await fetch('https://bca-35ms.onrender.com/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId })
        });
      } catch (error) {
        console.error('Logout API Error:', error);
      }
    }

    // 2. स्टोरेज को पूरी तरह साफ करें
    localStorage.clear();
    sessionStorage.clear();

    // 3. यूजर को होम पेज पर भेजें
    window.location.replace('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      padding: '12px 30px',
      backgroundColor: '#06dfd1',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* लोगो / टाइटल */}
      <h2 
        style={{ margin: 0, fontSize: '22px', cursor: 'pointer', fontWeight: 'bold', color: '#1a1a1a' }} 
        onClick={() => { 
          if (onTabChange) onTabChange('home'); 
          navigate('/'); 
        }}
      >
        📚 BCA Portal
      </h2>

      {/* 🛡️ बीच के ऑप्शंस: केवल तभी दिखेंगे जब यूजर लॉगिन नहीं होगा */}
      {!isLoggedIn && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onTabChange && onTabChange('home')} style={navLinkStyle(activeTab === 'home')}>Home</button>
          <button onClick={() => onTabChange && onTabChange('chairman')} style={navLinkStyle(activeTab === 'chairman')}>Chairman's Message</button>
          <button onClick={() => onTabChange && onTabChange('students')} style={navLinkStyle(activeTab === 'students')}>For Students</button>
          <button onClick={() => onTabChange && onTabChange('about')} style={navLinkStyle(activeTab === 'about')}>About Us</button>
        </div>
      )}

      {/* दाहिने कोने के बटन्स */}
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
            {/* एडमिन बटन */}
            {userRole === 'admin' && (
              <button 
                onClick={() => navigate('/admin-dashboard')} 
                style={actionButtonStyle}
              >
                👑 Admin Panel
              </button>
            )}

            {/* डैशबोर्ड बटन */}
            <button 
              onClick={() => navigate('/dashboard')} 
              style={actionButtonStyle}
            >
              📊 Dashboard
            </button>

            {/* लॉगआउट बटन */}
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

// 🎨 लिंक्स की स्टाइलिंग
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

// 🎨 एक्शन बटन्स (Admin, Dashboard, Logout) की एकसमान स्टाइलिंग
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