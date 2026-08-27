import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function AdminDashboard() {
  const navigate = useNavigate();

  // 🟢 Storage se Credentials fetch karein
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole');

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  const [logs, setLogs] = useState([]);
  const [uploadedMaterials, setUploadedMaterials] = useState([]);

  // अपलोड फॉर्म के लिए स्टेट्स
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('bca');
  const [semester, setSemester] = useState('1');
  const [category, setCategory] = useState('notes'); // 'notes', 'pyq', 'quiz'
  const [driveUrl, setDriveUrl] = useState(''); // Google Drive URL State
  const [file, setFile] = useState(null);

  // Quiz specific states
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  // लाइव फ़िल्टर बार के लिए स्टेट्स
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  // 🛡️ 1. Complete Role Guard Check
  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/login', { replace: true });
      return;
    }

    if (userRole !== 'admin') {
      alert('⚠️ Unauthorized! Admin Panel Access Restricted.');
      navigate('/dashboard', { replace: true });
      return;
    }

    fetchLiveLogs();
    fetchUploadedMaterials();
    const interval = setInterval(fetchLiveLogs, 4000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userRole, token, navigate]);

  // Authorization Header के साथ Logs प्राप्त करें
  const fetchLiveLogs = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.clear(); 
        localStorage.clear(); 
        navigate('/login', { replace: true }); 
        return;
      }

      const data = await response.json();
      if (response.ok) setLogs(data);
    } catch (error) { 
      console.error("Live logs fetch error:", error); 
    }
  };

  // Authorization Header के साथ Materials प्राप्त करें
  const fetchUploadedMaterials = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) return;

      const data = await response.json();
      if (response.ok) setUploadedMaterials(data);
    } catch (error) { 
      console.error("Materials fetch error:", error); 
    }
  };

  // Delete API
  const handleDeleteMaterial = async (id, fileTitle) => {
    const confirmDelete = window.confirm(`🗑️ क्या आप सच में "${fileTitle}" को हमेशा के लिए डिलीट करना चाहते हैं?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/delete-material/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchUploadedMaterials();
      } else { 
        alert(data.message); 
      }
    } catch (error) { 
      alert('फ़ाइल डिलीट एरर!'); 
    }
  };

  // Force Logout API
  const handleLogoutAllStudents = async () => {
    const confirmAction = window.confirm("⚠️ Do you really want to immediately log out all logged-in students?");
    if (!confirmAction) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/logout-all`, { 
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        } 
      });
      const data = await response.json();
      if (response.ok) { 
        alert(data.message); 
        fetchLiveLogs(); 
      }
    } catch (error) { 
      alert('connection fail!'); 
    }
  };

  // File / Drive / Quiz Upload Handler
  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('⚠️ कृपया Title / Topic Name लिखें!');
      return;
    }

    if (category === 'quiz') {
      if (!quizQuestion.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        alert('⚠️ कृपया क्विज का प्रश्न और चारों ऑप्शंस भरें!');
        return;
      }
    } else {
      if (!file && !driveUrl.trim()) {
        alert('⚠️ कृपया एक लोकल फ़ाइल चुनें या Google Drive Link पेस्ट करें!');
        return;
      }
    }

    let finalDriveUrl = driveUrl;
    if (driveUrl && driveUrl.includes('/view')) {
      finalDriveUrl = driveUrl.replace(/\/view.*$/, '/preview');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('course', course);
    formData.append('semester', semester);
    formData.append('category', category);
    
    if (category === 'quiz') {
      formData.append('question', quizQuestion);
      formData.append('options', JSON.stringify([optionA, optionB, optionC, optionD]));
      formData.append('correctOption', correctOption);
    } else {
      if (finalDriveUrl) formData.append('driveUrl', finalDriveUrl);
      if (file) formData.append('pdfFile', file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-material`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData 
      });
      const data = await response.json();
      if (response.ok) { 
        alert(data.message || 'सफलतापूर्वक अपलोड हो गया!'); 
        setTitle(''); 
        setDriveUrl('');
        setFile(null); 
        setQuizQuestion('');
        setOptionA(''); setOptionB(''); setOptionC(''); setOptionD('');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = ''; 
        fetchUploadedMaterials(); 
      } else { 
        alert(data.message || 'अपलोड फ़ेल हो गया!'); 
      }
    } catch (error) { 
      alert('अपलोड एरर!'); 
    }
  };

  const filteredMaterials = uploadedMaterials.filter((mat) => {
    const matchCourse = filterCourse === 'all' || mat.course === filterCourse;
    const matchSemester = filterSemester === 'all' || mat.semester === filterSemester;
    return matchCourse && matchSemester;
  });

  if (!isLoggedIn || userRole !== 'admin') {
    return null;
  }

  return (
    <>
      <style>{`
        /* Dynamic 3D Animated Background */
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(-45deg, #0b0f19, #111827, #1e1b4b, #06202a);
          background-size: 400% 400%;
          animation: liquidBg 15s ease infinite;
          min-height: 100vh;
        }

        @keyframes liquidBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .adm-container {
          padding: clamp(15px, 4vw, 35px);
          max-width: 1050px;
          width: 100%;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          box-sizing: border-box;
          color: #f8fafc;
        }

        /* Glassmorphic Header Card */
        .adm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: clamp(16px, 3vw, 24px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1);
          flex-wrap: wrap;
          gap: 15px;
          width: 100%;
          box-sizing: border-box;
        }

        .adm-avatar-box {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .adm-avatar {
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        .adm-btn-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          width: auto;
        }

        /* 3D Modern Buttons */
        .adm-candidate-btn {
          padding: 12px 18px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          border: 1px solid rgba(147, 197, 253, 0.3);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
        }

        .adm-candidate-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          box-shadow: 0 12px 25px rgba(59, 130, 246, 0.5);
        }

        .adm-logout-btn {
          padding: 12px 18px;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: #ffffff;
          border: 1px solid rgba(252, 165, 165, 0.3);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);
        }

        .adm-logout-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          box-shadow: 0 12px 25px rgba(239, 68, 68, 0.55);
        }

        /* Glassmorphic Cards */
        .adm-card {
          margin-top: 25px;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: clamp(20px, 4vw, 30px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-sizing: border-box;
          width: 100%;
        }

        .adm-card-title {
          margin: 0 0 20px 0;
          color: #38bdf8;
          font-size: clamp(18px, 4vw, 21px);
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .adm-input-group {
          margin-bottom: 18px;
          width: 100%;
        }

        .adm-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .adm-input {
          width: 100%;
          padding: 12px 15px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          font-size: 14px;
          color: #ffffff;
          outline: none;
          background: rgba(2, 6, 23, 0.6);
          transition: all 0.3s ease;
        }

        .adm-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
          background: rgba(2, 6, 23, 0.8);
        }

        .adm-input option {
          background-color: #0f172a;
          color: #ffffff;
        }

        .adm-row-group {
          display: flex;
          gap: 15px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .adm-row-item {
          flex: 1;
          min-width: 220px;
        }

        .adm-file-input {
          width: 100%;
          padding: 12px;
          border: 1px dashed rgba(56, 189, 248, 0.4);
          border-radius: 10px;
          box-sizing: border-box;
          font-size: 13px;
          background: rgba(2, 6, 23, 0.4);
          color: #cbd5e1;
          transition: all 0.3s ease;
        }
        
        .adm-file-input:hover {
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.05);
        }

        .adm-upload-btn {
          width: 100%;
          padding: 14px 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          background: linear-gradient(135deg, #059669, #0d9488);
          color: #ffffff;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(13, 148, 136, 0.4);
        }

        .adm-upload-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #10b981, #14b8a6);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.5);
        }

        /* Filter Section */
        .adm-filter-bar {
          display: flex;
          gap: 12px;
          background: rgba(2, 6, 23, 0.6);
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
          border: 1px solid rgba(56, 189, 248, 0.15);
        }

        .adm-mat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 10px;
          flex-wrap: wrap;
          transition: all 0.3s ease;
        }

        .adm-mat-item:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(56, 189, 248, 0.3);
          transform: translateX(4px);
        }

        .adm-delete-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #e11d48, #be123c);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
        }

        .adm-delete-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          box-shadow: 0 8px 18px rgba(244, 63, 94, 0.5);
        }

        /* Table Styling */
        .adm-table-wrapper {
          overflow-x: auto;
          width: 100%;
          border-radius: 12px;
          -webkit-overflow-scrolling: touch;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }

        .adm-th {
          padding: 14px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .adm-td {
          padding: 14px;
          font-size: 13px;
          color: #e2e8f0;
        }

        @media screen and (max-width: 600px) {
          .adm-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .adm-btn-group {
            width: 100%;
          }

          .adm-candidate-btn, .adm-logout-btn {
            flex: 1;
            text-align: center;
          }

          .adm-row-item {
            min-width: 100%;
          }

          .adm-mat-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .adm-delete-btn {
            width: 100%;
            margin-top: 5px;
          }
        }
      `}</style>

      <div className="adm-container">
        {/* हेडर */}
        <div className="adm-header">
          <div className="adm-avatar-box">
            <div className="adm-avatar">👑</div>
            <div>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700' }}>Main Admin Control Panel</h2>
              <p style={{ margin: '4px 0 0 0', color: '#38bdf8', fontSize: '13px', fontWeight: '500' }}>BCA Portal Management System</p>
            </div>
          </div>
          <div className="adm-btn-group">
            <button onClick={() => navigate('/dashboard')} className="adm-candidate-btn">
              👁️ Candidate Dashboard
            </button>
            <button onClick={handleLogoutAllStudents} className="adm-logout-btn">
              ⚠️ Force Logout All
            </button>
          </div>
        </div>

        {/* अपलोड फॉर्म बॉक्स */}
        <div className="adm-card">
          <h3 className="adm-card-title">➕ Upload Study Material, PYQ & Quiz</h3>
          <form onSubmit={handleFileUpload}>
            
            {/* Category Selection (Notes, PYQ, Quiz) */}
            <div className="adm-input-group">
              <label className="adm-label">Select Content Type *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="adm-input" style={{ fontWeight: 'bold', color: '#38bdf8' }}>
                <option value="notes">📘 Study Notes / Material</option>
                <option value="pyq">📝 Previous Year Question Paper (PYQ)</option>
                <option value="quiz">❓ Interactive Student Quiz</option>
              </select>
            </div>

            <div className="adm-input-group">
              <label className="adm-label">(Title / Topic Name) *</label>
              <input 
                type="text" 
                placeholder="e.g. C++ Notes / 2023 Solved Paper / Network Quiz" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="adm-input" 
                required 
              />
            </div>

            <div className="adm-row-group">
              <div className="adm-row-item">
                <label className="adm-label">Select Course *</label>
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="adm-input">
                  <option value="bca">BCA</option>
                  <option value="bcom">B.Com</option>
                  <option value="arts">Arts</option>
                  <option value="science">Science</option>
                </select>
              </div>

              <div className="adm-row-item">
                <label className="adm-label">Select Semester *</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="adm-input">
                  <option value="1">Sem-1</option>
                  <option value="2">Sem-2</option>
                  <option value="3">Sem-3</option>
                  <option value="4">Sem-4</option>
                  <option value="5">Sem-5</option>
                  <option value="6">Sem-6</option>
                </select>
              </div>
            </div>

            {/* IF CATEGORY IS QUIZ */}
            {category === 'quiz' ? (
              <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', padding: '18px', borderRadius: '14px', marginBottom: '18px', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: 'inset 0 0 15px rgba(6, 182, 212, 0.05)' }}>
                <h4 style={{ margin: '0 0 14px 0', color: '#38bdf8', fontSize: '15px' }}>❓ Add Quiz Question & Options</h4>
                
                <div className="adm-input-group">
                  <label className="adm-label">Question Text *</label>
                  <input type="text" placeholder="e.g. What is the full form of IP?" value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} className="adm-input" required />
                </div>

                <div className="adm-row-group">
                  <div className="adm-row-item">
                    <input type="text" placeholder="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} className="adm-input" required />
                  </div>
                  <div className="adm-row-item">
                    <input type="text" placeholder="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} className="adm-input" required />
                  </div>
                </div>

                <div className="adm-row-group">
                  <div className="adm-row-item">
                    <input type="text" placeholder="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} className="adm-input" required />
                  </div>
                  <div className="adm-row-item">
                    <input type="text" placeholder="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} className="adm-input" required />
                  </div>
                </div>

                <div className="adm-input-group" style={{ marginBottom: 0 }}>
                  <label className="adm-label">Correct Option Key *</label>
                  <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)} className="adm-input" style={{ color: '#4ade80', fontWeight: 'bold' }}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>
            ) : (
              /* IF CATEGORY IS NOTES OR PYQ */
              <>
                {/* Google Drive URL Option */}
                <div className="adm-input-group">
                  <label className="adm-label">🔗 Google Drive Share Link (Iframe Embed Viewer)</label>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing" 
                    value={driveUrl} 
                    onChange={(e) => setDriveUrl(e.target.value)} 
                    className="adm-input" 
                  />
                  <small style={{ color: '#38bdf8', fontSize: '11px', display: 'block', marginTop: '6px' }}>
                    * लिंक खुद ब खुद <b>/preview</b> फॉर्मेट में बदल जाएगी।
                  </small>
                </div>

                <p style={{ textAlign: 'center', margin: '12px 0', fontWeight: 'bold', color: '#64748b', fontSize: '12px', letterSpacing: '1px' }}>— OR —</p>

                {/* Local File Upload */}
                <div className="adm-input-group">
                  <label className="adm-label">Select Local File (.pdf, .jpg, .png)</label>
                  <input 
                    id="fileInput" 
                    type="file" 
                    accept=".pdf, .jpg, .jpeg, .png" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    className="adm-file-input" 
                  />
                </div>
              </>
            )}

            <button type="submit" className="adm-upload-btn">🚀 Upload to Server</button>
          </form>
        </div>

        {/* अपलोडेड दस्तावेज प्रबंधन */}
        <div className="adm-card">
          <h3 className="adm-card-title">📂 Uploaded Documents & Content Management</h3>
          
          <div className="adm-filter-bar">
            <span style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '13px', minWidth: '130px' }}>🔍 Live Filter List:</span>
            
            <div style={{ flex: 1, minWidth: '140px' }}>
              <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="adm-input" style={{ padding: '8px 12px', fontSize: '13px' }}>
                <option value="all">📁 All Courses (सभी कोर्सेज)</option>
                <option value="bca">BCA</option>
                <option value="bcom">B.Com</option>
                <option value="arts">Arts</option>
                <option value="science">Science</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '140px' }}>
              <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="adm-input" style={{ padding: '8px 12px', fontSize: '13px' }}>
                <option value="all">⏱️ All Semesters (सभी सेमेस्टर)</option>
                <option value="1">Sem-1</option>
                <option value="2">Sem-2</option>
                <option value="3">Sem-3</option>
                <option value="4">Sem-4</option>
                <option value="5">Sem-5</option>
                <option value="6">Sem-6</option>
              </select>
            </div>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((mat) => (
                <div key={mat._id} className="adm-mat-item">
                  <div style={{ wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '14px' }}>
                      {mat.category === 'quiz' ? '❓' : mat.category === 'pyq' ? '📝' : '📄'} {mat.title}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span><strong style={{ color: '#cbd5e1' }}>Category:</strong> <span style={{ color: '#38bdf8' }}>{mat.category ? mat.category.toUpperCase() : 'NOTES'}</span></span>
                      <span><strong style={{ color: '#cbd5e1' }}>Course:</strong> {mat.course?.toUpperCase()}</span>
                      <span><strong style={{ color: '#cbd5e1' }}>Semester:</strong> Sem-{mat.semester}</span>
                      {mat.driveUrl && <span style={{ color: '#34d399', fontWeight: 'bold' }}>[Drive Linked]</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMaterial(mat._id, mat.title)} className="adm-delete-btn">🗑️ Delete</button>
                </div>
              ))
            ) : ( 
              <p style={{ color: '#64748b', textAlign: 'center', margin: '20px 0', fontSize: '14px' }}>🔍 No documents found for this filter match.</p> 
            )}
          </div>
        </div>

        {/* लाइव छात्र ट्रैकिंग लिस्ट */}
        <div className="adm-card">
          <h3 className="adm-card-title">📊 Student Login Live Tracking List</h3>
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#ffffff' }}>
                  <th className="adm-th">Name</th>
                  <th className="adm-th">Mobile</th>
                  <th className="adm-th">Login Time</th>
                  <th className="adm-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                    <td className="adm-td" style={{ fontWeight: '600' }}>{log.userName}</td>
                    <td className="adm-td" style={{ color: '#94a3b8' }}>{log.mobile}</td>
                    <td className="adm-td" style={{ color: '#94a3b8' }}>{new Date(log.loginTime).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: !log.logoutTime ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                      {!log.logoutTime ? (
                        <span style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                          ● Online
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(248, 113, 113, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                          ○ Offline
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

const tdStyle = { padding: '14px', fontSize: '13px' };

export default AdminDashboard;