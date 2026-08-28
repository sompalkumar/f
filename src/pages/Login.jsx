import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Backend URL ko adjust karein agar zaroorat ho (e.g., process.env.REACT_APP_API_URL || 'http://localhost:5000')
const API_BASE_URL = 'https://bcaeasylearn.onrender.com'; // Apne actual backend Render URL se replace karein agar alag hai

const Login = () => {
  const [activeTab, setActiveTab] = useState('candidate'); // 'candidate' ya 'admin'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('EZguY'); // Aapka captcha logic
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!mobile || !password) {
      alert('Kripya Mobile number aur Password bharein.');
      return;
    }

    // Captcha validation check (Optional/As per your code)
    if (captchaInput.trim() !== captchaText.trim()) {
      alert('Invalid Captcha! Kripya sahi captcha darj karein.');
      return;
    }

    setLoading(true);

    // 🟢 BUG FIX HERE: Active tab ke base par sahi API Endpoint select karna
    const endpoint = activeTab === 'admin' 
      ? `${API_BASE_URL}/api/admin-login` 
      : `${API_BASE_URL}/api/login`;

    try {
      const response = await axios.post(endpoint, {
        mobile: mobile.trim(),
        password: password.trim()
      });

      if (response.status === 200) {
        const data = response.data;

        // Session & LocalStorage storage clear & update
        localStorage.clear();
        sessionStorage.clear();

        localStorage.setItem('token', data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        if (data.logId) localStorage.setItem('logId', data.logId);
        if (data.course) localStorage.setItem('userCourse', data.course);

        // Role ke basis par redirection
        if (data.role === 'admin') {
          navigate('/admin-dashboard'); // Apne Admin Dashboard route ke anusar badlein
        } else {
          navigate('/student-dashboard'); // Apne Student Dashboard route ke anusar badlein
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed! Server error.';
      alert(msg);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Tab Selection Buttons */}
        <div className="tab-header" style={{ display: 'flex', marginBottom: '15px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'candidate' ? 'active' : ''}`}
            onClick={() => handleTabChange('candidate')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: activeTab === 'candidate' ? '#4CAF50' : '#e0e0e0',
              color: activeTab === 'candidate' ? '#fff' : '#000',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Candidate
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: activeTab === 'admin' ? '#4CAF50' : '#e0e0e0',
              color: activeTab === 'admin' ? '#fff' : '#000',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}

          <div className="form-group">
            <label>Mobile Number / Username *</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {/* Captcha Box */}
          <div className="captcha-box" style={{ margin: '10px 0' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>{captchaText}</span>
            <input
              type="text"
              placeholder="Enter Captcha"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Processing...' : `Login as ${activeTab.toUpperCase()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;