import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'; 

function Register({ activeTab, showPortalModal, setShowPortalModal }) {
  const [userRole, setUserRole] = useState('candidate');
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

  // 🔄 कैप्चा जनरेट करें
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) { 
      result += chars.charAt(Math.floor(Math.random() * chars.length)); 
    }
    setCurrentCaptcha(result);
  };

  // 🧹 सभी फॉर्म फ़ील्ड्स को रीसेट करने के लिए
  const resetFormState = () => {
    setMobile('');
    setPassword('');
    setOtp('');
    setCaptchaInput('');
    setIsOtpSent(false);
    refreshCaptcha();
  };

  const handleMobileChange = (e) => {
    const val = e.target.value;
    const cleanVal = val.replace(/\D/g, ''); 
    if (cleanVal.length <= 10) { setMobile(cleanVal); }
  };

  const validateMobile = (num) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(num);
  };

  const isPasswordStrong = (pass) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(pass);
  };

  // 🔑 लॉगिन हैंडलर (UPDATED FOR STRICT ADMIN SECURITY)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateMobile(mobile)) { alert('⚠️ कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें!'); return; }
    if (captchaInput.trim().toLowerCase() !== currentCaptcha.toLowerCase()) { 
      alert('⚠️ गलत कैप्चा कोड!'); 
      refreshCaptcha();
      setCaptchaInput('');
      return; 
    }
    
    setIsLoading(true);
    try {
      // 🛡️ dynamic endpoint: Admin tab चुने जाने पर /api/admin-login पर हिट होगा
      const endpoint = userRole === 'admin' 
        ? `${API_BASE_URL}/api/admin-login` 
        : `${API_BASE_URL}/api/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });
      
      const data = await response.json();

      // 🔴 अगर Backend Status 200 OK नहीं है (जैसे Student Admin Panel से लॉगिन की कोशिश कर रहा हो)
      if (!response.ok) {
        alert(data.message || '🛑 लॉगिन विफल! कृपया अपनी जानकारी पुनः जांचें।');
        localStorage.clear();
        sessionStorage.clear();
        refreshCaptcha();
        setCaptchaInput('');
        setIsLoading(false);
        return; // ⛔ यहीं रोक दें!
      }

      // 🛑 Extra Check: Admin tab के साथ अगर role 'admin' नहीं मिला
      if (userRole === 'admin' && data.role !== 'admin') {
        alert('❌ You are not an admin! (आप एडमिन नहीं हैं)');
        localStorage.clear();
        sessionStorage.clear();
        refreshCaptcha();
        setIsLoading(false);
        return;
      }

      // 🟢 केवल सही Credentials पर ही Storage सेट होगा
      localStorage.clear();
      sessionStorage.clear();

      const tokenValue = data.token || '';
      const roleValue = data.role || userRole;
      const nameValue = data.name || '';
      const logIdValue = data.logId || '';
      const courseValue = data.course || 'bca';

      localStorage.setItem('token', tokenValue);
      localStorage.setItem('userToken', tokenValue);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', nameValue);
      localStorage.setItem('logId', logIdValue);
      localStorage.setItem('userRole', roleValue);
      localStorage.setItem('userCourse', courseValue);

      sessionStorage.setItem('token', tokenValue);
      sessionStorage.setItem('userToken', tokenValue);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userName', nameValue);
      sessionStorage.setItem('logId', logIdValue);
      sessionStorage.setItem('userRole', roleValue);
      sessionStorage.setItem('userCourse', courseValue);

      setShowPortalModal(false);

      if (roleValue === 'admin') { 
        window.location.replace('/admin-dashboard'); 
      } else { 
        window.location.replace('/dashboard'); 
      }

    } catch (error) {
      console.error(error);
      alert('सर्वर एरर! कृपया सर्वर कनेक्शन जांचें।');
    } finally {
      setIsLoading(false);
    }
  };

  // 📝 रजिस्ट्रेशन हैंडलर
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

  // 📲 OTP भेजने का हैंडलर
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

  // 🔄 OTP वेरीफाई करके पासवर्ड अपडेट करना
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

  // 📱💻 रेस्पॉन्सिव स्टाइल्स (Dynamic Styles)
  const overlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 2000,
    padding: '10px',
    boxSizing: 'border-box'
  };

  const modalStyle = { 
    backgroundColor: '#fff', 
    padding: 'clamp(20px, 4vw, 30px)', 
    borderRadius: '16px', 
    width: '100%', 
    maxWidth: '440px', 
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)', 
    position: 'relative', 
    boxSizing: 'border-box', 
    fontFamily: 'Arial, sans-serif' 
  };

  const closeBtnStyle = { 
    position: 'absolute', 
    top: '15px', 
    right: '15px', 
    background: 'none', 
    border: 'none', 
    fontSize: '20px', 
    cursor: 'pointer', 
    color: '#666', 
    outline: 'none' 
  };

  const inputGroupStyle = { marginBottom: '16px', textAlign: 'left' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: 'black', backgroundColor: '#ffffff', outline: 'none' };
  const maroonBtnStyle = { width: '100%', padding: '12px', backgroundColor: isLoading ? '#aaa' : '#06dfd1', color: 'black', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 'bold', marginTop: '10px' };
  const tabStyle = (isActive) => ({ flex: 1, textAlign: 'center', padding: '12px 0', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: isActive ? '#06dfd1' : 'black', borderBottom: isActive ? '3px solid #06dfd1' : 'none' });

  return (
    <>
      {/* 📱 मोबाइल और बड़ी स्क्रीन के लिए ग्लोबल CSS ओवरराइड */}
      <style>{`
        .responsive-card {
          width: 90%;
          max-width: 650px;
          padding: 30px 20px;
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          text-align: center;
          box-sizing: border-box;
          margin: 20px auto;
        }

        @media screen and (max-width: 480px) {
          .responsive-card {
            width: 95%;
            padding: 20px 15px;
          }
        }
      `}</style>

      <div style={{ backgroundImage: "url('/udhnacollege.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}>
        
        {/* Main Welcome Card */}
        <div className="responsive-card">
          <h2 style={{ color: '#06dfd1', marginBottom: '15px', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 'bold' }}>
            {sectionContent[activeTab]?.title || sectionContent.home.title}
          </h2>
          <p style={{ color: '#333', fontSize: 'clamp(13px, 2.5vw, 16px)', lineHeight: '1.6', margin: 0 }}>
            {sectionContent[activeTab]?.desc || sectionContent.home.desc}
          </p>
        </div>

        {/* Modal Window */}
        {showPortalModal && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <button 
                onClick={() => { 
                  if(!isLoading) { 
                    setShowPortalModal(false); 
                    setModalView('login'); 
                    resetFormState();
                  } 
                }} 
                style={closeBtnStyle}
              >
                ✕
              </button>

              {modalView === 'login' && (
                <div style={{ display: 'flex', marginBottom: '20px' }}>
                  <div onClick={() => !isLoading && setUserRole('candidate')} style={tabStyle(userRole === 'candidate')}>Candidate</div>
                  <div onClick={() => !isLoading && setUserRole('admin')} style={tabStyle(userRole === 'admin')}>Admin</div>
                </div>
              )}

              {/* लॉगिन फॉर्म */}
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
                      <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>{showPassword ? '🕵️' : '🥷'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <span onClick={() => { if(!isLoading) { setModalView('forgot'); resetFormState(); } }} style={{ color: 'black', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Forgot Password?</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', color: '#222', backgroundColor: '#f0f0f0', padding: '8px 15px', borderRadius: '6px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                      <span>{currentCaptcha}</span>
                      <span onClick={() => !isLoading && refreshCaptcha()} style={{ color: '#007bff', cursor: 'pointer', fontSize: '14px' }}>🔄 Refresh</span>
                    </div>
                  </div>
                  <div style={inputGroupStyle}>
                    <input type="text" placeholder="Enter Captcha" value={captchaInput} onChange={(e)=>setCaptchaInput(e.target.value)} style={inputStyle} required disabled={isLoading} />
                  </div>
                  <button type="submit" style={maroonBtnStyle} disabled={isLoading}>
                    {isLoading ? 'Processing...' : userRole === 'admin' ? 'Admin Login' : 'Candidate Login'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#444' }}>
                    New User? <span onClick={() => { if(!isLoading) { setModalView('register'); resetFormState(); } }} style={{ color: 'black', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Register Now</span>
                  </p>
                </form>
              )}

              {/* रजिस्ट्रेशन फॉर्म */}
              {modalView === 'register' && (
                <form onSubmit={handleRegister}>
                  <h3 style={{ marginBottom: '15px', color: 'black', fontWeight: '700', fontSize: '18px' }}>New Candidate Registration</h3>
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
                      <span style={{ fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: 'bold', color: isPasswordStrong(password) ? 'green' : 'red' }}>
                        {isPasswordStrong(password) ? '✅ Strong password' : '❌ Weak password (A, a, 1, @ and 8 characters required)'}
                      </span>
                    )}
                  </div>
                  <button type="submit" style={{ ...maroonBtnStyle, backgroundColor: (!isPasswordStrong(password) || isLoading) ? '#aaa' : '#06dfd1', cursor: !isPasswordStrong(password) ? 'not-allowed' : 'pointer' }} disabled={!isPasswordStrong(password) || isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '15px' }}>
                    Already have an account? <span onClick={()=>{ setModalView('login'); resetFormState(); }} style={{ color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Login here</span>
                  </p>
                </form>
              )}

              {/* फ़ॉरगॉट पासवर्ड फॉर्म */}
              {modalView === 'forgot' && (
                <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '15px', color: '#333', fontWeight: '700', fontSize: '18px' }}>Reset Password</h3>
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
                        <p style={{ fontSize: '12px', color: '#06dfd1', marginBottom: '10px', textAlign: 'center', fontWeight: '600' }}>Enter OTP sent to your phone</p>
                        <div style={inputGroupStyle}>
                          <label style={labelStyle}>Enter 4-Digit OTP *</label>
                          <input type="text" placeholder="XXXX" value={otp} maxLength="4" onChange={(e)=>setOtp(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '4px' }} required disabled={isLoading} />
                        </div>
                        <div style={inputGroupStyle}>
                          <label style={labelStyle}>Enter New Password *</label>
                          <input type="password" placeholder="Create New Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle} required disabled={isLoading} />
                          {password && (
                            <span style={{ fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: 'bold', color: isPasswordStrong(password) ? 'green' : 'red' }}>
                              {isPasswordStrong(password) ? 'Strong Password ✅' : '❌ Weak password (requires A, a, 1, @ and 8 characters)'}
                            </span>
                          )}
                        </div>
                        <button type="submit" style={{ ...maroonBtnStyle, backgroundColor: (!isPasswordStrong(password) || isLoading) ? '#aaa' : '#06dfd1', cursor: !isPasswordStrong(password) ? 'not-allowed' : 'pointer' }} disabled={!isPasswordStrong(password) || isLoading}>
                          {isLoading ? 'Updating...' : 'Verify & Update'}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}

              {modalView !== 'login' && (
                <p onClick={()=>{ setModalView('login'); resetFormState(); }} style={{ fontSize: '14px', marginTop: '15px', color: 'black', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}>
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