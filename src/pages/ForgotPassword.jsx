import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🌐 Centralized API Base URL Import
import { API_BASE_URL } from '../config';

function ForgotPassword() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Step 1: Request OTP from Backend
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      alert('कृपया एक वैध 10-अंकों का मोबाइल नंबर दर्ज करें!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'OTP सफलतापूर्वक भेजा गया!');
        setIsOtpSent(true);
      } else {
        alert(data.message || 'OTP भेजने में विफल');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      alert('सर्वर से कनेक्शन नहीं हो पा रहा है!');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      alert('कृपया OTP और नया पासवर्ड दोनों दर्ज करें!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, newPassword })
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'पासवर्ड सफलतापूर्वक बदल दिया गया है!');
        navigate('/login');
      } else {
        alert(data.message || 'OTP या पासवर्ड रीसेट विफल');
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      alert('सर्वर से कनेक्शन टूट गया!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '40px auto', 
      padding: '30px 20px', 
      border: '1px solid #eee', 
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#222' }}>
        Reset Password with OTP
      </h2>

      {/* Screen 1: Mobile Number Input */}
      {!isOtpSent ? (
        <form onSubmit={handleSendOtp}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            अपना रजिस्टर्ड मोबाइल नंबर दर्ज करें
          </p>
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                boxSizing: 'border-box', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                backgroundColor: '#282525', 
                color: '#fff', 
                fontSize: '15px' 
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
              backgroundColor: loading ? '#ccc' : '#6ccd04', 
              color: 'black', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontSize: '16px', 
              fontWeight: 'bold' 
            }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        /* Screen 2: OTP & New Password Input */
        <form onSubmit={handleVerifyAndReset}>
          <p style={{ fontSize: '14px', color: 'green', marginBottom: '10px', fontWeight: '600' }}>
            आपके मोबाइल ({mobile}) पर भेजा गया OTP दर्ज करें
          </p>
          
          <button 
            type="button" 
            onClick={() => setIsOtpSent(false)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#007bff', 
              cursor: 'pointer', 
              fontSize: '12px', 
              textDecoration: 'underline', 
              marginBottom: '20px' 
            }}
          >
            ✏️ Change Mobile Number
          </button>

          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Enter OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                boxSizing: 'border-box', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                backgroundColor: '#282525', 
                color: '#fff', 
                fontSize: '15px', 
                letterSpacing: '5px', 
                textAlign: 'center' 
              }} 
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder="Enter New Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                boxSizing: 'border-box', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                backgroundColor: '#282525', 
                color: '#fff', 
                fontSize: '15px' 
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
              backgroundColor: loading ? '#ccc' : '#6ccd04', 
              color: 'black', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontSize: '16px', 
              fontWeight: 'bold' 
            }}
          >
            {loading ? 'Verifying...' : 'Verify & Update Password'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/login" style={{ color: '#6ccd04', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
          ⬅ Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;