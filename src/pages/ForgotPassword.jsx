import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// आपकी Render Backend API URL यहाँ जोड़ दी गई है
const API_BASE_URL = 'https://bca-35ms.onrender.com';

function ForgotPassword() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); // स्क्रीन कंट्रोल करने के लिए
  const navigate = useNavigate();

  // स्टेप 1: बैकएंड से OTP मंगवाना
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setIsOtpSent(true); // OTP बॉक्स स्क्रीन पर दिखाओ
      } else {
        alert(data.message || 'OTP भेजने में विफल');
      }
    } catch (error) {
      alert('सर्वर से कनेक्शन नहीं हो पा रहा है!');
    }
  };

  // स्टेप 2: OTP वेरीफाई करके पासवर्ड बदलना
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, newPassword })
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate('/login'); // सीधे लॉगिन पेज पर भेजें
      } else {
        alert(data.message || 'OTP या पासवर्ड रीसेट विफल');
      }
    } catch (error) {
      alert('सर्वर से कनेक्शन टूट गया!');
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

      {/* फॉर्म 1: अगर OTP नहीं भेजा गया है तो सिर्फ मोबाइल नंबर मांगेगा */}
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
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#6ccd04', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Send OTP
          </button>
        </form>
      ) : (
        /* फॉर्म 2: OTP बटन दबाने के बाद यह स्क्रीन खुलेगी */
        <form onSubmit={handleVerifyAndReset}>
          <p style={{ fontSize: '14px', color: 'green', marginBottom: '20px', fontWeight: '600' }}>
            आपके मोबाइल पर भेजा गया OTP दर्ज करें
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Enter 4-Digit OTP" 
              value={otp} 
              maxLength="4"
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

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#6ccd04', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Verify & Update Password
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