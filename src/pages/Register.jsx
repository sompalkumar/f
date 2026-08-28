import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config'; 

function Register({ activeTab, showPortalModal, setShowPortalModal }) {
  const [userRole, setUserRole] = useState('candidate'); // 'candidate' or 'admin'
  const [modalView, setModalView] = useState('login'); 
  const [isLoading, setIsLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [regCourse] = useState('bca');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [currentCaptcha, setCurrentCaptcha] = useState('');

  // 🔄 Memoized Captcha Generator
  const refreshCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) { 
      result += chars.charAt(Math.floor(Math.random() * chars.length)); 
    }
    setCurrentCaptcha(result);
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  // 🧹 Reset form states safely
  const resetFormState = () => {
    setMobile('');
    setPassword('');
    setName('');
    setOtp('');
    setCaptchaInput('');
    setIsOtpSent(false);
    refreshCaptcha();
  };

  const handleMobileChange = (e) => {
    const cleanVal = e.target.value.replace(/\D/g, ''); 
    if (cleanVal.length <= 10) { setMobile(cleanVal); }
  };

  const validateMobile = (num) => /^[0-9]{10}$/.test(num);

  const isPasswordStrong = (pass) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pass);
  };

  // 🔑 Fixed Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateMobile(mobile)) { 
      alert('⚠️ कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें!'); 
      return; 
    }
    if (captchaInput.trim().toLowerCase() !== currentCaptcha.toLowerCase()) { 
      alert('⚠️ गलत कैप्चा कोड!'); 
      refreshCaptcha();
      setCaptchaInput('');
      return; 
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || '🛑 लॉगिन विफल! कृपया अपनी जानकारी पुनः जांचें।');
        refreshCaptcha();
        setCaptchaInput('');
        setIsLoading(false);
        return;
      }

      // Backend से मिलने वाला असली रोल
      const backendRole = (data.role || data.userRole || 'candidate').toLowerCase();
      const selectedRole = userRole.toLowerCase();

      // 🛡️ Strict Role Access Enforcement
      if (selectedRole === 'admin') {
        if (backendRole !== 'admin') {
          alert('❌ Access Denied! केवल अधिकृत Admin ही Admin Tab से लॉगिन कर सकते हैं।');
          refreshCaptcha();
          setCaptchaInput('');
          setIsLoading(false);
          return;
        }
      } else { // Candidate Tab Selected
        if (backendRole === 'admin') {
          alert('⚠️ आप एक एडमिन हैं! कृपया ऊपर "Admin" टैब चुनकर लॉगिन करें।');
          refreshCaptcha();
          setCaptchaInput('');
          setIsLoading(false); // Fix: पहले यह true पर अटक जाता था
          return;
        }
      }

      // Cleanup Old Session
      const authKeys = ['token', 'isLoggedIn', 'userName', 'logId', 'userRole', 'userCourse'];
      authKeys.forEach(key => sessionStorage.removeItem(key));

      // Save Session Info
      sessionStorage.setItem('token', data.token || '');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userName', data.name || data.userName || '');
      sessionStorage.setItem('logId', data.logId || '');
      sessionStorage.setItem('userRole', backendRole);
      sessionStorage.setItem('userCourse', data.course || 'bca');

      setShowPortalModal(false);

      // 🚀 Explicit Route Redirection
      if (backendRole === 'admin') {
        window.location.replace('/admin-dashboard');
      } else {
        window.location.replace('/dashboard');
      }

    } catch (error) {
      console.error('Login Error:', error);
      alert('सर्वर एरर! कृपया सर्वर कनेक्शन जांचें।');
    } finally {
      setIsLoading(false);
    }
  };

  // 📝 Register Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateMobile(mobile)) { alert('⚠️ मोबाइल नंबर 10 अंकों का होना चाहिए!'); return; }
    if (!isPasswordStrong(password)) { alert('⚠️ कृपया एक मजबूत पासवर्ड बनाएं!'); return; }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, password, course: regCourse })
      });
      const data = await response.json();
      if (response.ok) { 
        alert(data.message || 'पंजीकरण सफल!'); 
        resetFormState();
        setModalView('login'); 
      } else { 
        alert(data.message || 'पंजीकरण विफल!'); 
      }
    } catch (error) {
      console.error(error);
      alert('सर्वर एरर!');
    } finally {
      setIsLoading(false);
    }
  };

  // 📲 OTP Handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateMobile(mobile)) { alert('वैध नंबर डालें!'); return; }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ mobile }) 
      });
      const data = await response.json();
      if (response.ok) { 
        alert(data.message || 'OTP भेजा गया!'); 
        setIsOtpSent(true); 
      } else { 
        alert(data.message || 'OTP भेजने में त्रुटि!'); 
      }
    } catch (error) {
      console.error(error);
      alert('ओटीपी सर्वर त्रुटि!'); 
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong(password)) { alert('⚠️ मजबूत पासवर्ड डालें।'); return; }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp-reset`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ mobile, otp, newPassword: password }) 
      });
      const data = await response.json();
      if (response.ok) { 
        alert(data.message || 'पासवर्ड सफलतापूर्वक बदल गया!'); 
        resetFormState();
        setModalView('login'); 
      } else { 
        alert(data.message || 'OTP सत्यापन विफल!'); 
      }
    } catch (error) {
      console.error(error);
      alert('सर्वर एरर!');
    } finally {
      setIsLoading(false);
    }
  };

  const sectionContent = {
    home: { title: "🏫 Welcome to BCA PORTAL", desc: "A leading institute in the field of education, continuously dedicated to the bright future and overall development of the students." },
    chairman: { title: "🙏 Chairman's Message", desc: "Our aim is not only to impart bookish knowledge but also to enhance the hidden talent within the students." },
    students: { title: "📚 For Students", desc: "Facilities like digital library and career guidance cell are available." },
    about: { title: "ℹ️ About Us", desc: "Since its inception, Bca Portal has been setting new records in the field of higher education." }
  };

  // Dynamic Styles
  const overlayStyle = { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '15px', boxSizing: 'border-box'
  };

  const modalStyle = { 
    background: 'rgba(255, 255, 255, 0.35)', backdropFilter: 'blur(25px) saturate(190%)', WebkitBackdropFilter: 'blur(25px) saturate(190%)',
    padding: '45px clamp(22px, 4vw, 32px) clamp(22px, 4vw, 32px)', borderRadius: '28px', width: '100%', maxWidth: '440px', maxHeight: '90vh',
    overflowY: 'auto', border: '1.5px solid rgba(255, 255, 255, 0.75)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.05)', 
    position: 'relative', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
  };

  const closeBtnStyle = { 
    position: 'absolute', top: '14px', right: '14px', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', 
    width: '26px', height: '26px', borderRadius: '50%', fontSize: '13px', cursor: 'pointer', color: '#1d1d1f', outline: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.2s ease', zIndex: 10
  };

  const inputGroupStyle = { marginBottom: '16px', textAlign: 'left' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' };
  
  const inputStyle = { 
    width: '100%', padding: '12px 16px', boxSizing: 'border-box', border: '1.5px solid rgba(255, 255, 255, 0.8)', 
    borderRadius: '50px', fontSize: '14px', fontWeight: '500', color: '#1d1d1f', backgroundColor: 'rgba(255, 255, 255, 0.45)', 
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
  };

  const maroonBtnStyle = { 
    width: '100%', padding: '13px', 
    background: isLoading ? 'rgba(255, 255, 255, 0.4)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.35) 100%)', 
    color: '#1d1d1f', border: '1.5px solid rgba(255, 255, 255, 0.9)', borderRadius: '50px', 
    cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '700', marginTop: '10px',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08), inset 0 3px 5px rgba(255, 255, 255, 0.9), inset 0 -3px 5px rgba(0, 0, 0, 0.1)'
  };

  const tabStyle = (isActive) => ({ 
    flex: 1, textAlign: 'center', padding: '10px 0', cursor: 'pointer', fontSize: '14px', fontWeight: '700', 
    color: isActive ? '#1d1d1f' : '#555', background: isActive ? 'rgba(255, 255, 255, 0.75)' : 'transparent',
    borderRadius: '50px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none'
  });

  return (
    <>
      <style>{`
        .responsive-card {
          width: 90%; max-width: 650px; padding: 35px 25px; border-radius: 28px;
          border: 1.5px solid rgba(255, 255, 255, 0.75);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.35); backdrop-filter: blur(25px) saturate(190%);
          -webkit-backdrop-filter: blur(25px) saturate(190%); text-align: center; box-sizing: border-box;
          margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        @media screen and (max-width: 480px) {
          .responsive-card { width: 95%; padding: 25px 18px; }
        }
      `}</style>

      <div style={{ 
        backgroundImage: "url('/udhnacollege.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', 
        minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', boxSizing: 'border-box' 
      }}>
        
        {/* Main Glass Welcome Card */}
        <div className="responsive-card">
          <h2 style={{ color: '#1d1d1f', marginBottom: '15px', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: '800', textShadow: '0 2px 4px rgba(255, 255, 255, 0.6)' }}>
            {sectionContent[activeTab]?.title || sectionContent.home.title}
          </h2>
          <p style={{ color: '#2d2d2f', fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
            {sectionContent[activeTab]?.desc || sectionContent.home.desc}
          </p>
        </div>

        {/* Liquid Glass Modal Window */}
        {showPortalModal && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <button 
                onClick={() => { 
                  if (!isLoading) { 
                    setShowPortalModal(false); 
                    setModalView('login'); 
                    resetFormState();
                  } 
                }} 
                style={closeBtnStyle}
                aria-label="Close modal"
              >
                ✕
              </button>

              {modalView === 'login' && (
                <div style={{ 
                  display: 'flex', marginBottom: '22px', background: 'rgba(255, 255, 255, 0.3)', 
                  padding: '4px', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.6)'
                }}>
                  <div onClick={() => !isLoading && setUserRole('candidate')} style={tabStyle(userRole === 'candidate')}>Candidate</div>
                  <div onClick={() => !isLoading && setUserRole('admin')} style={tabStyle(userRole === 'admin')}>Admin</div>
                </div>
              )}

              {/* 🔑 Login Form */}
              {modalView === 'login' && (
                <form onSubmit={handleLogin}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Mobile Number / Username *</label>
                    <input type="text" placeholder="Enter Mobile Number" value={mobile} onChange={handleMobileChange} style={inputStyle} required disabled={isLoading} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '45px' }} required disabled={isLoading} />
                      <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>
                        {showPassword ? '👁️' : '🙈'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <span onClick={() => { if (!isLoading) { setModalView('forgot'); resetFormState(); } }} style={{ color: '#4a154b', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Forgot Password?</span>
                  </div>
                  
                  {/* 🛡️ Glossy Captcha Box */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <div style={{ 
                      fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', color: '#1d1d1f', 
                      background: 'rgba(255, 255, 255, 0.5)', padding: '10px 18px', borderRadius: '50px', 
                      border: '1px solid rgba(255, 255, 255, 0.7)', fontStyle: 'italic', display: 'flex', 
                      alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between', boxSizing: 'border-box' 
                    }}>
                      <span>{currentCaptcha}</span>
                      <span onClick={() => !isLoading && refreshCaptcha()} style={{ color: '#007bff', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>🔄 Refresh</span>
                    </div>
                  </div>

                  <div style={inputGroupStyle}>
                    <input type="text" placeholder="Enter Captcha" value={captchaInput} onChange={(e)=>setCaptchaInput(e.target.value)} style={inputStyle} required disabled={isLoading} />
                  </div>

                  <button type="submit" style={maroonBtnStyle} disabled={isLoading}>
                    {isLoading ? 'Processing...' : userRole === 'admin' ? 'Admin Login' : 'Candidate Login'}
                  </button>

                  <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                    New User? <span onClick={() => { if (!isLoading) { setModalView('register'); resetFormState(); } }} style={{ color: '#007bff', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>Register Now</span>
                  </p>
                </form>
              )}

              {/* 📝 Registration Form */}
              {modalView === 'register' && (
                <form onSubmit={handleRegister}>
                  <h3 style={{ marginBottom: '18px', color: '#1d1d1f', fontWeight: '800', fontSize: '19px' }}>New Candidate Registration</h3>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} style={inputStyle} required disabled={isLoading} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Mobile Number *</label>
                    <input type="text" placeholder="10 Digits" value={mobile} onChange={handleMobileChange} style={inputStyle} required disabled={isLoading} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Set Password *</label>
                    <input type="password" placeholder="Create Strong Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle} required disabled={isLoading} />
                    {password && (
                      <span style={{ fontSize: '11px', display: 'block', marginTop: '6px', fontWeight: '700', color: isPasswordStrong(password) ? '#155724' : '#721c24' }}>
                        {isPasswordStrong(password) ? '✅ Strong password' : '❌ Weak password (A, a, 1, @ & 8 chars required)'}
                      </span>
                    )}
                  </div>
                  <button type="submit" style={{ ...maroonBtnStyle, opacity: (!isPasswordStrong(password) || isLoading) ? 0.6 : 1, cursor: !isPasswordStrong(password) ? 'not-allowed' : 'pointer' }} disabled={!isPasswordStrong(password) || isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '18px', color: '#333', fontWeight: '500' }}>
                    Already have an account? <span onClick={()=>{ setModalView('login'); resetFormState(); }} style={{ color: '#007bff', cursor: 'pointer', fontWeight: '700' }}>Login here</span>
                  </p>
                </form>
              )}

              {/* 🔒 Forgot Password Form */}
              {modalView === 'forgot' && (
                <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '18px', color: '#1d1d1f', fontWeight: '800', fontSize: '19px' }}>Reset Password</h3>
                    {!isOtpSent ? (
                      <>
                        <div style={inputGroupStyle}>
                          <label style={labelStyle}>Registered Mobile Number *</label>
                          <input type="text" placeholder="Enter Registered Mobile" value={mobile} onChange={handleMobileChange} style={inputStyle} required disabled={isLoading} />
                        </div>
                        <button type="submit" style={maroonBtnStyle} disabled={isLoading}>
                          {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: '13px', color: '#1d1d1f', marginBottom: '12px', textAlign: 'center', fontWeight: '600' }}>Enter OTP sent to your phone</p>
                        <div style={inputGroupStyle}>
                          <label style={labelStyle}>Enter 4-Digit OTP *</label>
                          <input type="text" placeholder="XXXX" value={otp} maxLength="4" onChange={(e)=>setOtp(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '6px', fontWeight: '700' }} required disabled={isLoading} />
                        </div>
                        <div style={inputGroupStyle}>
                          <label style={labelStyle}>Enter New Password *</label>
                          <input type="password" placeholder="Create New Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle} required disabled={isLoading} />
                          {password && (
                            <span style={{ fontSize: '11px', display: 'block', marginTop: '6px', fontWeight: '700', color: isPasswordStrong(password) ? '#155724' : '#721c24' }}>
                              {isPasswordStrong(password) ? 'Strong Password ✅' : '❌ Weak password (requires A, a, 1, @ & 8 chars)'}
                            </span>
                          )}
                        </div>
                        <button type="submit" style={{ ...maroonBtnStyle, opacity: (!isPasswordStrong(password) || isLoading) ? 0.6 : 1, cursor: !isPasswordStrong(password) ? 'not-allowed' : 'pointer' }} disabled={!isPasswordStrong(password) || isLoading}>
                          {isLoading ? 'Updating...' : 'Verify & Update'}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}

              {modalView !== 'login' && (
                <p onClick={()=>{ setModalView('login'); resetFormState(); }} style={{ fontSize: '14px', marginTop: '18px', color: '#1d1d1f', cursor: 'pointer', fontWeight: '700', textAlign: 'center' }}>
                  ⬅ Back to Login
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Register;