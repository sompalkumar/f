import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // ⏳ Loading state
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

  // 🔑 Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // ⏳ Loading chalu karein
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userRole = data.role || data.userRole;

        // 🔴 1. अगर यूज़र एडमिन नहीं है तो लॉगिन तुरंत ब्लॉक करें
        if (userRole !== 'admin') {
          alert('❌ You are not an admin! You cannot log in from here.');
          
          sessionStorage.clear();
          localStorage.clear();
          setLoading(false);
          return;
        }

        // 🟢 2. केवल Admin होने पर ही Session सेव करें और Admin Dashboard पर भेजें
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userRole', userRole);
        if (data.logId) sessionStorage.setItem('logId', data.logId);

        navigate('/admin-dashboard', { replace: true });
      } else {
        alert(data.message || 'लॉगिन विफल रहा!');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('सर्वर से कनेक्शन नहीं हो पाया!');
    } finally {
      setLoading(false); // ⏳ Loading बंद करें
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* 🧪 Main Glass Card Container */}
      <div style={{ 
        width: '100%',
        maxWidth: '420px', 
        padding: '40px 30px', 
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: '1.5px solid rgba(255, 255, 255, 0.7)',
        boxShadow: `
          0 20px 40px rgba(0, 0, 0, 0.08),
          inset 0 3px 5px rgba(255, 255, 255, 0.9),
          inset 0 -3px 5px rgba(0, 0, 0, 0.08)`,
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* 🎓 Cap Icon with Glass Glow */}
        <div style={{ marginBottom: '20px' }}>
          <img 
            src="/login-cap.png" 
            alt="Graduation Cap" 
            style={{ 
              width: '75px', 
              height: 'auto',
              margin: '0 auto',
              filter: 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.15))'
            }}
          />
        </div>

        <h2 style={{ 
          fontSize: '26px', 
          fontWeight: '700', 
          marginBottom: '25px', 
          color: '#1d1d1f',
          textShadow: '0 2px 4px rgba(255, 255, 255, 0.5)'
        }}>
          Portal Login
        </h2>

        <form onSubmit={handleLogin}>
          {/* 📱 Mobile Input Box */}
          <div style={{ marginBottom: '18px' }}>
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)} 
              autoComplete="username"
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
                boxSizing: 'border-box',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '50px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#1d1d1f',
                fontSize: '15px',
                fontWeight: '500',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.25s ease'
              }} 
              required 
            />
          </div>

          {/* 🔒 Password Input Box */}
          <div style={{ marginBottom: '25px' }}>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              autoComplete="current-password"
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
                boxSizing: 'border-box',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '50px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#1d1d1f',
                fontSize: '15px',
                fontWeight: '500',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.25s ease'
              }} 
              required 
            />
          </div>

          {/* 🔘 3D Liquid Glossy Log In Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: loading 
                ? 'rgba(255, 255, 255, 0.4)' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 100%)', 
              color: '#1d1d1f', 
              border: '1.5px solid rgba(255, 255, 255, 0.9)', 
              borderRadius: '50px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: `
                0 8px 20px rgba(0, 0, 0, 0.08),
                inset 0 3px 5px rgba(255, 255, 255, 0.9),
                inset 0 -3px 5px rgba(0, 0, 0, 0.1)`,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* 🔗 Forgot Password Link */}
        <div style={{ marginTop: '22px' }}>
          <Link 
            to="/forgot-password" 
            style={{ 
              fontSize: '14px', 
              color: '#4a154b', 
              textDecoration: 'none', 
              fontWeight: '600' 
            }}
          >
            Forgot Password?
          </Link>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.5)', margin: '22px 0' }} />

        {/* 🔗 Register Link */}
        <p style={{ fontSize: '14px', color: '#424245', fontWeight: '500' }}>
          Don't have an account?{' '}
          <Link 
            to="/" 
            style={{ color: '#4a154b', textDecoration: 'none', fontWeight: '700' }}
          >
            Register Now
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;