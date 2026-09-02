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

  // 📱 Mobile Input Filter (only 10 digits allowed)
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  // 🔢 OTP Input Filter (only digits allowed)
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // Step 1: Request OTP from Backend
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    
    if (!mobile || mobile.length !== 10) {
      alert('कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें!');
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

  const isPasswordStrong = (pass) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pass);
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      alert('कृपया सही OTP दर्ज करें!');
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      alert('⚠️ पासवर्ड कम से कम 8 अक्षरों का होना चाहिए और उसमें कम से कम 1 बड़ा अक्षर (A-Z), 1 छोटा अक्षर (a-z), 1 संख्या (0-9) और 1 विशेष वर्ण (@$!%*?&) होना चाहिए!');
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
        navigate('/');
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
    <>
      <style>{`
        /* Dynamic Animated Liquid Glass Background */
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(-45deg, #0f172a, #1e1b4b, #311042, #022c22);
          background-size: 400% 400%;
          animation: liquidBg 15s ease infinite;
          min-height: 100vh;
        }

        @keyframes liquidBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .fp-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .fp-card {
          max-width: 420px;
          width: 100%;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: clamp(24px, 5vw, 36px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          color: #f8fafc;
          box-sizing: border-box;
          transition: transform 0.3s ease;
        }

        .fp-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 18px auto;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
        }

        .fp-title {
          font-size: clamp(20px, 4vw, 24px);
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .fp-subtitle {
          font-size: 13.5px;
          color: #94a3b8;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .fp-input-group {
          margin-bottom: 20px;
          text-align: left;
        }

        .fp-input {
          width: 100%;
          padding: 14px 16px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.6);
          color: #ffffff;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
        }

        .fp-input::placeholder {
          color: #64748b;
        }

        .fp-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
          background: rgba(15, 23, 42, 0.8);
        }

        .fp-input-otp {
          letter-spacing: 6px;
          text-align: center;
          font-weight: bold;
          font-size: 18px;
        }

        .fp-actions-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          font-size: 12.5px;
        }

        .fp-change-btn {
          background: none;
          border: none;
          color: #38bdf8;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s ease;
          padding: 0;
        }

        .fp-change-btn:hover {
          color: #7dd3fc;
          text-decoration: underline;
        }

        .fp-submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .fp-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(16, 185, 129, 0.4);
        }

        .fp-submit-btn:disabled {
          background: #334155;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .fp-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
          margin-top: 24px;
          transition: all 0.2s ease;
        }

        .fp-back-link:hover {
          color: #10b981;
          transform: translateX(-3px);
        }
      `}</style>

      <div className="fp-wrapper">
        <div className="fp-card">
          <div className="fp-icon">🔑</div>
          <h2 className="fp-title">Reset Password</h2>

          {/* Screen 1: Mobile Number Input */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp}>
              <p className="fp-subtitle">
                अपना रजिस्टर्ड मोबाइल नंबर दर्ज करें
              </p>
              
              <div className="fp-input-group">
                <input 
                  type="tel" 
                  placeholder="Mobile Number (10 digits)" 
                  value={mobile} 
                  onChange={handleMobileChange} 
                  className="fp-input"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="fp-submit-btn"
              >
                {loading ? 'Sending OTP...' : 'Send OTP 📲'}
              </button>
            </form>
          ) : (
            /* Screen 2: OTP & New Password Input */
            <form onSubmit={handleVerifyAndReset}>
              <p className="fp-subtitle" style={{ color: '#34d399', fontWeight: '500' }}>
                आपके मोबाइल ({mobile}) पर भेजा गया OTP दर्ज करें
              </p>
              
              <div className="fp-actions-row">
                <button 
                  type="button" 
                  onClick={() => setIsOtpSent(false)} 
                  className="fp-change-btn"
                >
                  ✏️ Change Mobile
                </button>

                <button 
                  type="button" 
                  onClick={() => handleSendOtp(null)} 
                  disabled={loading}
                  className="fp-change-btn"
                >
                  🔄 Resend OTP
                </button>
              </div>

              <div className="fp-input-group">
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  value={otp} 
                  onChange={handleOtpChange} 
                  className="fp-input fp-input-otp"
                  maxLength={6}
                  required 
                />
              </div>

              <div className="fp-input-group">
                <input 
                  type="password" 
                  placeholder="Enter New Password (min 6 chars)" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="fp-input"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="fp-submit-btn"
              >
                {loading ? 'Verifying...' : 'Verify & Update Password 🔓'}
              </button>
            </form>
          )}

          <div>
            <Link to="/" className="fp-back-link">
              ⬅ Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;