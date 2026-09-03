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

  // 🏠 Home button click handler (Always redirects to Main Home Page)
  const handleHomeClick = (tabName) => {
    if (onTabChange) onTabChange(tabName);
    navigate('/'); // Ensures navigation back to home page from Legal pages
  };

  return (
    <>
      {/* 📱💻 Image Matching Deep Teal / Cyan Gradient Styling */}
      <style>{`
        .navbar-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 32px;
          background: linear-gradient(135deg, #024959 0%, #008080 100%);
          width: 100%;
          box-sizing: border-box;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }

        .nav-logo {
          margin: 0;
          font-size: 20px;
          cursor: pointer;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-links-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .nav-btn {
          padding: 8px 18px;
          color: #e2e8f0;
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
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        /* Active Tab Capsule Pill - Exact as Image */
        .nav-btn.active {
          color: #0f172a;
          background: #a7f3d0;
          font-weight: 700;
        }

        /* Login Button - Exact White Capsule as Image */
        .login-btn {
          padding: 9px 22px;
          background: #ffffff;
          color: #0f172a;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13.5px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          background: #f8fafc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
        }

        .action-btn {
          padding: 8px 18px;
          background: #ffffff;
          color: #0f172a;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .logout-btn {
          background: #ef4444;
          color: #ffffff;
        }

        .logout-btn:hover {
          background: #dc2626;
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
          onClick={() => handleHomeClick('home')}
        >
          📚 BCA Portal
        </h2>

        {/* 🛡️ Middle Navigation Links: Only visible when user is logged out */}
        {!isLoggedIn && (
          <div className="nav-links-container">
            <button 
              onClick={() => handleHomeClick('home')} 
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => handleHomeClick('chairman')} 
              className={`nav-btn ${activeTab === 'chairman' ? 'active' : ''}`}
            >
              Chairman's Message
            </button>
            <button 
              onClick={() => handleHomeClick('students')} 
              className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            >
              For Students
            </button>
            <button 
              onClick={() => handleHomeClick('about')} 
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