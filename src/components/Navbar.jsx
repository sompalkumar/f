import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config'; 

function Navbar({ onTabChange, activeTab, onLoginClick }) {
  const navigate = useNavigate();

  // 🟢 Session aur Local Storage Sync Check
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole');

  // 🚪 Backend API ke saath Secure Logout Function
  const handleLogout = useCallback(async () => {
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
      } finally {
        // Clear Storage & Redirect even if API fails
        localStorage.clear();
        sessionStorage.clear();
        navigate('/', { replace: true });
      }
    } else {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      {/* 📱💻 Ultra-Modern Glassmorphic Navbar Styling */}
      <style>{`
        .navbar-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          box-sizing: border-box;
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }

        .nav-logo {
          margin: 0;
          font-size: 20px;
          cursor: pointer;
          font-weight: 800;
          background: #06b6d4;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
          letter-spacing: -0.5px;
          transition: transform 0.2s ease;
        }

       
        .nav-links-container {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .nav-btn {
          padding: 8px 16px;
          color: #1cfa5e;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          white-space: nowrap;
          background: transparent;
        }

        .nav-btn:hover {
          color: #c8ff51;
          background: rgba(255, 255, 255, 0.08);
        }

        .nav-btn.active {
          color: #06b6d4;
          background: rgba(51, 6, 212, 0.94);
         
        }

        .login-btn {
          padding: 9px 20px;
          background: #06b6d4;
          color: #f91313;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13.5px;
        
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        /* 📱 Mobile Responsiveness Adjustments */
        @media screen and (max-width: 768px) {
          .navbar-container {
            padding: 10px 14px;
            gap: 10px;
          }

          .nav-logo {
            font-size: 18px;
          }

          .nav-links-container {
            width: 100%;
            justify-content: center;
            order: 3;
            margin-top: 4px;
            flex-wrap: wrap;
            gap: 4px;
          }

          .nav-btn {
            padding: 6px 10px;
            font-size: 12px;
            border-radius: 8px;
          }

          .login-btn, .action-btn {
            padding: 7px 12px;
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

        {/* 🛡️ Middle Navigation Links: Only visible when user is logged out */}
        {!isLoggedIn && (
          <div className="nav-links-container">
            <button 
              onClick={() => onTabChange?.('home')} 
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => onTabChange?.('chairman')} 
              className={`nav-btn ${activeTab === 'chairman' ? 'active' : ''}`}
            >
              Chairman's Message
            </button>
            <button 
              onClick={() => onTabChange?.('students')} 
              className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            >
              For Students
            </button>
            <button 
              onClick={() => onTabChange?.('about')} 
              className={`nav-btn ${activeTab === 'about' ? 'active' : ''}`}
            >
              About Us
            </button>
          </div>
        )}

        {/* Right Side Action Buttons */}
        <div>
          {!isLoggedIn ? (
            <button 
              onClick={onLoginClick} 
              className="login-btn"
            >
              Login or Register
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                className="action-btn logout-btn"
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