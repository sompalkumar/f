import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🛡️ Guard Check: Agar user pehle se logged-in hai to uske role ke aadhar par sahi Dashboard par bhejo
  useEffect(() => {
    const isLoggedIn = 
      sessionStorage.getItem('isLoggedIn') === 'true' || 
      localStorage.getItem('isLoggedIn') === 'true';

    const userRole = 
      sessionStorage.getItem('userRole') || 
      localStorage.getItem('userRole');

    if (isLoggedIn) {
      if (userRole === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    // Browser back button handling
    const blockBackButton = () => {
      window.history.pushState(null, null, window.location.href);
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', blockBackButton);

    return () => {
      window.removeEventListener('popstate', blockBackButton);
    };
  }, [navigate]);

  // 📱 Mobile Input Sanitization (only 10 digits allowed)
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  // 🔑 Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (mobile.length !== 10) {
      alert('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें!');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userRole = data.role || data.userRole || 'student';

        // 🟢 Session Saving Logic
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userRole', userRole);
        if (data.name || data.userName) {
          sessionStorage.setItem('userName', data.name || data.userName);
        }
        if (data.logId) sessionStorage.setItem('logId', data.logId);

        // 🔀 Role-Based Dynamic Redirection
        if (userRole === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        alert(data.message || 'लॉगिन विफल रहा!');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('सर्वर से कनेक्शन नहीं हो पाया!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* 🌌 Page Background Container */
        .login-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* 📦 Futuristic Glassmorphic Card */
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 36px 30px;
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          box-sizing: border-box;
          animation: cardAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-title {
          font-size: clamp(20px, 4vw, 24px);
          font-weight: 800;
          margin-bottom: 28px;
          background: linear-gradient(135deg, #38bdf8, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .login-field-group {
          margin-bottom: 20px;
          text-align: left;
        }

        .login-input {
          width: 100%;
          padding: 13px 16px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.6);
          color: #f8fafc;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: all 0.25s ease;
        }

        .login-input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
          background: rgba(15, 23, 42, 0.85);
        }

        .login-input::placeholder {
          color: #64748b;
        }

        /* 🔘 Gradient Submit Button */
        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #06b6d4, #10b981);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
          transition: all 0.3s ease;
          margin-top: 6px;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.45);
          background: linear-gradient(135deg, #0891b2, #059669);
        }

        .login-btn:disabled {
          background: #475569;
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.7;
        }

        .forgot-pass-link {
          display: inline-block;
          font-size: 13.5px;
          color: #38bdf8;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
          transition: color 0.2s ease;
        }

        .forgot-pass-link:hover {
          color: #7dd3fc;
          text-decoration: underline;
        }

        .login-divider {
          border: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 24px 0;
        }

        .register-prompt {
          font-size: 13.5px;
          color: #94a3b8;
          font-weight: 500;
          margin: 0;
        }

        .register-link {
          color: #10b981;
          text-decoration: none;
          font-weight: 700;
          margin-left: 4px;
          transition: color 0.2s ease;
        }

        .register-link:hover {
          color: #34d399;
          text-decoration: underline;
        }

        /* 📱 Mobile Fine-tuning */
        @media screen and (max-width: 480px) {
          .login-card {
            padding: 28px 20px;
            border-radius: 20px;
          }
          .login-input {
            padding: 11px 14px;
            font-size: 13.5px;
          }
        }
      `}</style>

      <div className="login-page-wrapper">
        <div className="login-card">
          <h2 className="login-title">
            🔑 Portal Login
          </h2>

          <form onSubmit={handleLogin}>
            {/* 📱 Mobile Input Box */}
            <div className="login-field-group">
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={mobile} 
                onChange={handleMobileChange} 
                autoComplete="username"
                className="login-input"
                required 
              />
            </div>

            {/* 🔒 Password Input Box */}
            <div className="login-field-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                autoComplete="current-password"
                className="login-input"
                required 
              />
            </div>

            {/* 🔘 Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="login-btn"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* 🔗 Forgot Password Link */}
          <div>
            <Link to="/forgot-password" className="forgot-pass-link">
              Forgot Password?
            </Link>
          </div>

          <hr className="login-divider" />

          {/* 🔗 Register Link */}
          <p className="register-prompt">
            Don't have an account?
            <Link to="/" className="register-link">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;