import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function Login() {
  const [activeTab, setActiveTab] = useState('candidate'); // 'candidate' ya 'admin'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Guard Check: Session existing user redirect
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
    }
  }, [navigate]);

  // Login Submit Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Tab ke according API Endpoint set karein
    const endpoint = activeTab === 'admin' 
      ? `${API_BASE_URL}/api/admin-login` 
      : `${API_BASE_URL}/api/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: mobile.trim(), 
          password,
          loginType: activeTab // Tab state backend ko bhejein
        })
      });

      const data = await response.json();

      if (response.ok) {
        const rawRole = data.role || data.userRole || (activeTab === 'admin' ? 'admin' : 'candidate');
        const userRole = String(rawRole).toLowerCase().trim();

        // Save Auth Credentials
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('token', data.token || '');
        sessionStorage.setItem('userRole', userRole);
        if (data.logId) sessionStorage.setItem('logId', data.logId);

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
      padding: '30px 25px', 
      border: '1px solid #ddd', 
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff'
    }}>
      
      {/* 🎓 Icon Header */}
      <div style={{ marginBottom: '15px' }}>
        <img src="/login-cap.png" alt="Cap" style={{ width: '60px', height: 'auto' }} />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
        Portal Login
      </h2>

      {/* 🔀 Candidate / Admin Toggle Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f1f3f5',
        borderRadius: '10px',
        padding: '4px',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('candidate')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            backgroundColor: activeTab === 'candidate' ? '#ffffff' : 'transparent',
            color: activeTab === 'candidate' ? '#4CAF50' : '#666',
            boxShadow: activeTab === 'candidate' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Candidate
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            backgroundColor: activeTab === 'admin' ? '#ffffff' : 'transparent',
            color: activeTab === 'admin' ? '#4CAF50' : '#666',
            boxShadow: activeTab === 'admin' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="tel" 
            placeholder="Mobile Number" 
            value={mobile} 
            onChange={(e) => setMobile(e.target.value)} 
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
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Logging in...' : `Log In as ${activeTab === 'admin' ? 'Admin' : 'Candidate'}`}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <Link to="/forgot-password" style={{ fontSize: '14px', color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}>
          Forgot Password?
        </Link>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      <p style={{ fontSize: '14px', color: '#666' }}>
        Don't have an account?{' '}
        <Link to="/" style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}>
          Register Now
        </Link>
      </p>
    </div>
  );
}

export default Login;