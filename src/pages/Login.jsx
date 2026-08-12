import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🔗 API Base URL
const API_BASE_URL = 'https://bca-35ms.onrender.com';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // ⏳ लोडिंग स्टेट
  const navigate = useNavigate();

  // 🛡️ सुरक्षा: चेक करें कि यूजर पहले से लॉगिन है या नहीं
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // अगर पहले से लॉगिन है तो सीधे डैशबोर्ड पर भेजें
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // ब्राउज़र बैक बटन कंट्रोल
    const blockBackButton = () => {
      window.history.pushState(null, null, window.location.href);
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', blockBackButton);

    return () => {
      window.removeEventListener('popstate', blockBackButton);
    };
  }, [navigate]);

  // 🔑 लॉगिन फ़ंक्शन
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // बटन को डिसएबल करें और लोडिंग शुरू करें

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password, role: 'student' })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userName', data.name || '');
        sessionStorage.setItem('logId', data.logId || '');

        alert('Login successful!');
        navigate('/dashboard', { replace: true });
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      alert('सर्वर से कनेक्ट नहीं हो पा रहा है! कृपया कुछ सेकंड बाद पुनः प्रयास करें (Render Cold Start)।');
    } finally {
      setLoading(false); // लोडिंग समाप्त
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
      
      {/* 🎓 ग्रेजुएशन टोपी की इमेज */}
      <div style={{ marginBottom: '20px' }}>
        <img 
          src="/login-cap.png" 
          alt="Graduation Cap" 
          style={{ width: '70px', height: 'auto' }}
        />
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px', color: '#333' }}>
        Student Login
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