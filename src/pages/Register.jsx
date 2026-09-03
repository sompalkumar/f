import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config'; 
import './Register.css'; // Pure styling external CSS file se apply hogi

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

      const backendRole = String(data.role || data.userRole || 'candidate').toLowerCase().trim();
      const currentSelectedRole = String(userRole).toLowerCase().trim();

      if (currentSelectedRole === 'admin' && backendRole !== 'admin') {
        alert('❌ Access Denied! केवल अधिकृत Admin ही Admin Tab से लॉगिन कर सकते हैं।');
        refreshCaptcha();
        setCaptchaInput('');
        setIsLoading(false);
        return;
      }

      const authKeys = ['token', 'isLoggedIn', 'userName', 'logId', 'userRole', 'userCourse'];
      authKeys.forEach(key => sessionStorage.removeItem(key));

      sessionStorage.setItem('token', data.token || '');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userName', data.name || data.userName || '');
      sessionStorage.setItem('logId', data.logId || '');
      sessionStorage.setItem('userRole', backendRole);
      sessionStorage.setItem('userCourse', data.course || 'bca');

      setShowPortalModal(false);

      if (backendRole === 'admin') {
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

  // Helper function to trigger login modal
  const triggerLoginModal = (view = 'register') => {
    setModalView(view);
    setShowPortalModal(true);
  };

  return (
    <div className="register-hero-wrapper">
      
      {/* 🌟 MAIN HERO SECTION */}
      <div className="hero-banner-section">
        <div className="responsive-card">
          <h2>{sectionContent[activeTab]?.title || sectionContent.home.title}</h2>
          <p>{sectionContent[activeTab]?.desc || sectionContent.home.desc}</p>
        </div>

        <div className="hero-cta-box">
          <h1 className="hero-main-title">
            Master Your BCA Degree with Premium Notes, PYQs & Project Source Codes
          </h1>
          <p className="hero-sub-title">
            Unlock all resources. Create a free student account today.
          </p>
          <div className="hero-action-btns">
            <button className="cta-primary-btn" onClick={() => triggerLoginModal('register')}>
              Register for Free
            </button>
            <button className="cta-secondary-btn" onClick={() => triggerLoginModal('login')}>
              Explore Preview
            </button>
          </div>
        </div>
      </div>

      {/* 🔒 SEMESTER RESOURCES PREVIEW (LOCKED CARDS) */}
      <section className="semester-preview-container">
        <h2 className="section-heading">Semester Resources Preview</h2>
        <div className="semester-grid">
          
          <div className="sem-card">
            <div className="sem-card-header">
              <h3>Semester 1: Foundation</h3>
              <span className="lock-icon">🔒 LOCK</span>
            </div>
            <p>C Programming, DBMS, Mathematics, Digital Electronics...</p>
          </div>

          <div className="sem-card">
            <div className="sem-card-header">
              <h3>Semester 2: Evaluation</h3>
              <span className="lock-icon">🔒 LOCK</span>
            </div>
            <p>C++ OOPs, Data Structures, Organization Structure...</p>
          </div>

          <div className="sem-card">
            <div className="sem-card-header">
              <h3>Semester 3: Processing</h3>
              <span className="lock-icon">🔒 LOCK</span>
            </div>
            <p>Java Programming, Operating Systems, Web Tech...</p>
          </div>

          <div className="sem-card">
            <div className="sem-card-header">
              <h3>Semester 4: Education</h3>
              <span className="lock-icon">🔒 LOCK</span>
            </div>
            <p>Software Engineering, Python, Computer Networks...</p>
          </div>

          <div className="sem-card">
            <div className="sem-card-header">
              <h3>Semester 5: Engineering</h3>
              <span className="lock-icon">🔒 LOCK</span>
            </div>
            <p>PHP & MySQL, Cloud Computing, Major Projects...</p>
          </div>

          <div className="sem-card">
            <div className="sem-card-header">
              <h3>Semester 6: Booking</h3>
              <span className="lock-icon">🔒 LOCK</span>
            </div>
            <p>Cyber Security, AI Basics, Final Industrial Project...</p>
          </div>

        </div>

        <div className="unlock-btn-wrapper">
          <button className="unlock-all-btn" onClick={() => triggerLoginModal('login')}>
            Unlock Semesters (Login Required)
          </button>
        </div>
      </section>

      {/* 📊 MEMBERSHIP COMPARISON TABLE */}
      <section className="comparison-container">
        <h2 className="section-heading">Membership Comparison Table</h2>
        <div className="comparison-table-wrapper">
          <div className="table-col guest-col">
            <div className="col-header">Guest User</div>
            <div className="col-body">
              <p>✔ Only Syllabus & 1 Sample Paper</p>
              <p className="cross-text">✖ Full PDF Downloads</p>
              <p className="cross-text">✖ Handwritten Notes</p>
              <p className="cross-text">✖ Solved PYQs & Lab Code</p>
              <p className="cross-text">✖ Project Source Files</p>
            </div>
          </div>

          <div className="table-col registered-col">
            <div className="col-header">Registered Student</div>
            <div className="col-body">
              <p>✔ Full PDF Downloads</p>
              <p>✔ Handwritten Notes</p>
              <p>✔ Solved PYQs (Last 5 Years)</p>
              <p>✔ Practical Lab Codes (C, Java, Web)</p>
              <p>✔ Minor & Major Project Files</p>
            </div>
          </div>
        </div>

        <div className="unlock-btn-wrapper">
          <button className="complete-unlock-btn" onClick={() => triggerLoginModal('register')}>
            Complete All Semesters to Unlock
          </button>
        </div>
      </section>

      {/* 📈 LIVE STATS & SOCIAL PROOF */}
      <section className="stats-container">
        <h2 className="section-heading">Live Stats & Social Proof</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h2>1500+</h2>
            <p>Students Registered</p>
          </div>
          <div className="stat-card">
            <h2>200+</h2>
            <p>Notes Downloaded</p>
          </div>
          <div className="stat-card trust-badge">
            <p>⭐⭐⭐⭐⭐</p>
            <p>Top Rated BCA Portal</p>
          </div>
        </div>
      </section>

      {/* 🚪 PORTAL MODAL (ORIGINAL LOGIN / REGISTER / FORGOT PASSWORD) */}
      {showPortalModal && (
        <div className="portal-overlay">
          <div className="portal-modal">
            <button 
              onClick={() => { 
                if (!isLoading) { 
                  setShowPortalModal(false); 
                  setModalView('login'); 
                  resetFormState();
                } 
              }} 
              className="modal-close-btn"
              aria-label="Close modal"
            >
              ✕
            </button>

            {modalView === 'login' && (
              <div className="role-tab-container">
                <div 
                  onClick={() => {
                    if (!isLoading) {
                      setUserRole('candidate');
                      refreshCaptcha();
                    }
                  }} 
                  className={`role-tab ${userRole === 'candidate' ? 'active' : ''}`}
                >
                  Candidate
                </div>
                <div 
                  onClick={() => {
                    if (!isLoading) {
                      setUserRole('admin');
                      refreshCaptcha();
                    }
                  }} 
                  className={`role-tab ${userRole === 'admin' ? 'active' : ''}`}
                >
                  Admin
                </div>
              </div>
            )}

            {/* Login Form */}
            {modalView === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Mobile Number / Username *</label>
                  <input type="text" placeholder="Enter Mobile Number" value={mobile} onChange={handleMobileChange} className="custom-input" required disabled={isLoading} />
                </div>
                <div className="input-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="custom-input pad-right" required disabled={isLoading} />
                    <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">
                      {showPassword ? '👁️' : '🙈'}
                    </span>
                  </div>
                </div>
                <div className="forgot-password-link">
                  <span onClick={() => { if (!isLoading) { setModalView('forgot'); resetFormState(); } }}>Forgot Password?</span>
                </div>
                
                <div className="captcha-wrapper">
                  <div className="captcha-box">
                    <span>{currentCaptcha}</span>
                    <span onClick={() => !isLoading && refreshCaptcha()} className="refresh-captcha-btn">🔄 Refresh</span>
                  </div>
                </div>

                <div className="input-group">
                  <input type="text" placeholder="Enter Captcha" value={captchaInput} onChange={(e)=>setCaptchaInput(e.target.value)} className="custom-input" required disabled={isLoading} />
                </div>

                <button type="submit" className="custom-maroon-btn" disabled={isLoading}>
                  {isLoading ? 'Processing...' : userRole === 'admin' ? 'Admin Login' : 'Candidate Login'}
                </button>

                <p className="form-footer-text">
                  New User? <span onClick={() => { if (!isLoading) { setModalView('register'); resetFormState(); } }} className="action-link">Register Now</span>
                </p>
              </form>
            )}

            {/* Registration Form */}
            {modalView === 'register' && (
              <form onSubmit={handleRegister}>
                <h3 className="form-heading">New Candidate Registration</h3>
                <div className="input-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} className="custom-input" required disabled={isLoading} />
                </div>
                <div className="input-group">
                  <label>Mobile Number *</label>
                  <input type="text" placeholder="10 Digits" value={mobile} onChange={handleMobileChange} className="custom-input" required disabled={isLoading} />
                </div>
                <div className="input-group">
                  <label>Set Password *</label>
                  <input type="password" placeholder="Create Strong Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="custom-input" required disabled={isLoading} />
                  {password && (
                    <span className={`password-strength ${isPasswordStrong(password) ? 'strong' : 'weak'}`}>
                      {isPasswordStrong(password) ? '✅ Strong password' : '❌ Weak password (A, a, 1, @ & 8 chars required)'}
                    </span>
                  )}
                </div>
                <button type="submit" className={`custom-maroon-btn ${!isPasswordStrong(password) || isLoading ? 'disabled' : ''}`} disabled={!isPasswordStrong(password) || isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
                <p className="form-footer-text">
                  Already have an account? <span onClick={()=>{ setModalView('login'); resetFormState(); }} className="action-link">Login here</span>
                </p>
              </form>
            )}

            {/* Forgot Password Form */}
            {modalView === 'forgot' && (
              <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                <div className="form-align-left">
                  <h3 className="form-heading">Reset Password</h3>
                  {!isOtpSent ? (
                    <>
                      <div className="input-group">
                        <label>Registered Mobile Number *</label>
                        <input type="text" placeholder="Enter Registered Mobile" value={mobile} onChange={handleMobileChange} className="custom-input" required disabled={isLoading} />
                      </div>
                      <button type="submit" className="custom-maroon-btn" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="otp-subheading">Enter OTP sent to your phone</p>
                      <div className="input-group">
                        <label>Enter 4-Digit OTP *</label>
                        <input type="text" placeholder="XXXX" value={otp} maxLength="4" onChange={(e)=>setOtp(e.target.value)} className="custom-input otp-input" required disabled={isLoading} />
                      </div>
                      <div className="input-group">
                        <label>Enter New Password *</label>
                        <input type="password" placeholder="Create New Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="custom-input" required disabled={isLoading} />
                        {password && (
                          <span className={`password-strength ${isPasswordStrong(password) ? 'strong' : 'weak'}`}>
                            {isPasswordStrong(password) ? 'Strong Password ✅' : '❌ Weak password (requires A, a, 1, @ & 8 chars)'}
                          </span>
                        )}
                      </div>
                      <button type="submit" className={`custom-maroon-btn ${!isPasswordStrong(password) || isLoading ? 'disabled' : ''}`} disabled={!isPasswordStrong(password) || isLoading}>
                        {isLoading ? 'Updating...' : 'Verify & Update'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {modalView !== 'login' && (
              <p onClick={()=>{ setModalView('login'); resetFormState(); }} className="back-link">
                ⬅ Back to Login
              </p>
            )}
          </div>
        </div>
      )}

      {/* 🦶 FOOTER SECTION */}
      <footer className="main-footer">
        <div className="footer-content-grid">
          
          {/* Contact Support */}
          <div className="footer-col">
            <h3>Contact Support</h3>
            <p>📧 Email: support@bcaeasylearn.com</p>
            <p>📱 WhatsApp Help: +91 827 827 0339</p>
            <p>📍 Location: BCA Student Helpdesk</p>
            <p>🕒 Mon - Sat (10:00 AM - 6:00 PM)</p>
          </div>

          {/* Useful Links */}
          <div className="footer-col">
            <h3>Useful Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer-copyright-bar">
          <p>© 2026 BCA Portal (bcaeazylearn.vercel.app). All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default Register;