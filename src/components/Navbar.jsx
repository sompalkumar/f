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
      {/* 📱💻 Image Matching Cyan/Teal Exact CSS Styling */}
      <style>{`
        .navbar-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 10px 32px;
          background: #00ddb3; /* Image Teal / Cyan Color */
          width: 100%;
          box-sizing: border-box;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .nav-logo {
          margin: 0;
          font-size: 20px;
          cursor: pointer;
          font-weight: 800;
          color: #1a1a1a;
          white-space: nowrap;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-links-container {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .nav-btn {
          padding: 8px 18px;
          color: #1a1a1a;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.2s ease;
          outline: none;
          white-space: nowrap;
          background: transparent;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Active Tab Capsule Pill - Exact as Image */
        .nav-btn.active {
          color: #1a1a1a;
          background: #b2f5e8;
          font-weight: 700;
        }

        /* Login Button - Exact White Capsule as Image */
        .login-btn {
          padding: 9px 24px;
          background: #ffffff;
          color: #1a1a1a;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13.5px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        }

        .action-btn {
          padding: 8px 18px;
          background: #ffffff;
          color: #1a1a1a;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.85);
        }

        .logout-btn {
          background: #ff4d4d;
          color: #ffffff;
        }

        .logout-btn:hover {
          background: #e60000;
        }

        /* 📱 Mobile Responsiveness Adjustments */
        @media screen and (max-width: 768px) {
          .navbar-container {
            padding: 10px 16px;
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
            gap: 6px;
          }

          .nav-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .login-btn, .action-btn {
            padding: 7px 16px;
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