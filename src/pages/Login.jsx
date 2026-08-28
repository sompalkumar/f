import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🛡️ Guard Check: Agar user pehle se logged-in hai to role ke aadhar par sahi Dashboard par bhejo
  useEffect(() => {
    const isLoggedIn = 
      sessionStorage.getItem('isLoggedIn') === 'true' || 
      localStorage.getItem('isLoggedIn') === 'true';

    const rawRole = 
      sessionStorage.getItem('userRole') || 
      localStorage.getItem('userRole') || '';

    const userRole = String(rawRole).toLowerCase().trim();

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
    setLoading(true);
    
    try {
      // General login endpoint for both candidates & admin
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.trim(), password })
      });

      const data = await response.json();

      if (response.ok) {
        const rawRole = data.role || data.userRole || 'candidate';
        const userRole = String(rawRole).toLowerCase().trim();

        // Save session details securely
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('token', data.token || '');
        sessionStorage.setItem('userRole', userRole);
        if (data.logId) sessionStorage.setItem('logId', data.logId);

        // Role-based navigation
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
    <div style={{ 
      maxWidth: '450px', 
      margin: '40px auto', 
      padding: '40px 30px', 
      border: '1px solid #aba9a9', 
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff'
    }}>
      
      {/* 🎓 Cap Icon */}
      <div style={{ marginBottom: '20px' }}>
        <img 
          src="/login-cap.png" 
          alt="Graduation Cap" 
          style={{ width: '70px', height: 'auto' }}
        />
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px', color: '#333' }}>
        Portal Login
      </h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="tel" 
            placeholder="Mobile Number" 
            value={mobile} 
            onChange={(e) => setMobile(e.target.value)} 
            autoComplete="username"
            style={{ 
              width: '100%', 
              padding: '12px 15px', 
              boxSizing: 'border-box',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              color: '#333',
              fontSize: '15px',
              outline: 'none'
            }} 
            required 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            autoComplete="current-password"
            style={{ 
              width: '100%', 
              padding: '12px 15px', 
              boxSizing: 'border-box',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              color: '#333',
              fontSize: '15px',
              outline: 'none'
            }} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#a5d6a7' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <Link 
          to="/forgot-password" 
          style={{ fontSize: '14px', color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Forgot Password?
        </Link>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      <p style={{ fontSize: '14px', color: '#666' }}>
        Don't have an account?{' '}
        <Link 
          to="/" 
          style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Register Now
        </Link>
      </p>

    </div>
  );
}

export default Login;