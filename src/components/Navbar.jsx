import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config'; 

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

    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
  };

  return (
    <>
      {/* 📱💻 रिस्पॉन्सिव CSS रूल्स - मोबाइल और लैपटॉप के लिए */}
      <style>{`
        .navbar-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background-color: #06dfd1;
          width: 100%;
          box-sizing: border-box;
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: Arial, sans-serif;
        }

        .nav-logo {
          margin: 0;
          font-size: 18px;
          cursor: pointer;
          font-weight: bold;
          color: #1a1a1a;
          white-space: nowrap;
        }

        .nav-links-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .nav-btn {
          padding: 8px 14px;
          color: #1a1a1a;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: 0.2s;
          outline: none;
          white-space: nowrap;
        }

        .login-btn {
          padding: 8px 18px;
          background-color: white;
          color: #1a1a1a;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          white-space: nowrap;
        }

        .action-btn {
          padding: 8px 12px;
          background-color: #ffffff;
          color: #1a1a1a;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          white-space: nowrap;
        }

        /* 📱 मोबाइल स्क्रीन के लिए विशेष एडजस्टमेंट (768px से छोटे डिवाइस) */
        @media screen and (max-width: 768px) {
          .navbar-container {
            padding: 8px 10px;
            gap: 8px;
          }

          .nav-logo {
            font-size: 16px;
          }

          .nav-links-container {
            width: 100%;
            justify-content: center;
            order: 3; /* मोबाइल में लिंक्स को सबसे नीचे लाएगा */
            margin-top: 4px;
            flex-wrap: wrap;
            gap: 4px;
          }

          .nav-btn {
            padding: 5px 8px;
            font-size: 11px;
            border-radius: 12px;
          }

          .login-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .action-btn {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>

      {/* 🟢 HTML / React JSX Layout */}
      <nav className="navbar-container">
        {/* Logo / Title */}
        <h2 
          className="nav-logo"
          onClick={() => { 
            if (onTabChange) onTabChange('home'); 
            navigate('/'); 
          }}
        >
          📚 BCA Portal
        </h2>

        {/* 🛡️ Middle Navigation Links: Tabhi dikhenge jab user logged out ho */}
        {!isLoggedIn && (
          <div className="nav-links-container">
            <button 
              onClick={() => onTabChange && onTabChange('home')} 
              className="nav-btn"
              style={{ backgroundColor: activeTab === 'home' ? 'rgba(255, 255, 255, 0.4)' : 'transparent' }}
            >
              Home
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('chairman')} 
              className="nav-btn"
              style={{ backgroundColor: activeTab === 'chairman' ? 'rgba(255, 255, 255, 0.4)' : 'transparent' }}
            >
              Chairman's Message
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('students')} 
              className="nav-btn"
              style={{ backgroundColor: activeTab === 'students' ? 'rgba(255, 255, 255, 0.4)' : 'transparent' }}
            >
              For Students
            </button>
            <button 
              onClick={() => onTabChange && onTabChange('about')} 
              className="nav-btn"
              style={{ backgroundColor: activeTab === 'about' ? 'rgba(255, 255, 255, 0.4)' : 'transparent' }}
            >
              About Us
            </button>
          </div>
        )}

        {/* Right Side Buttons */}
        <div>
          {!isLoggedIn ? (
            <button 
              onClick={onLoginClick} 
              className="login-btn"
            >
              Login or Register
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Admin Panel Button */}
              {userRole === 'admin' && (
                <button 
                  onClick={() => navigate('/admin-dashboard')} 
                  className="action-btn"
                >
                  👑 Admin Panel
                </button>
              )}

              {/* Dashboard Button */}
              <button 
                onClick={() => navigate('/dashboard')} 
                className="action-btn"
              >
                📊 Dashboard
              </button>

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="action-btn"
                style={{ backgroundColor: '#ff4d4d', color: 'white' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;