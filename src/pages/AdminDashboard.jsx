import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// 🟢 Move static styles to the top to avoid hoisting/TDZ errors
const tdStyle = { padding: '14px', fontSize: '13px' };

function AdminDashboard() {
  const navigate = useNavigate();

  // Storage credentials check
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

  // Form States
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('bca');
  const [semester, setSemester] = useState('1');
  const [category, setCategory] = useState('notes'); // 'notes', 'pyq', 'quiz'
  const [driveUrl, setDriveUrl] = useState('');
  const [file, setFile] = useState(null);

  // Quiz States
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  // Filter States
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  // 🔴 Fetch Live Logs (Wrapped in useCallback)
  const fetchLiveLogs = useCallback(async () => {
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
  }, [token, navigate]);

  // 🔴 Fetch Uploaded Materials (Wrapped in useCallback)
  const fetchUploadedMaterials = useCallback(async () => {
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
  }, [token]);

  // 🛡️ Role Guard Check & Lifecycle Polling
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
  }, [isLoggedIn, userRole, token, navigate, fetchLiveLogs, fetchUploadedMaterials]);

  // 🔴 Delete Material Handler
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
        alert(data.message || 'सफलतापूर्वक डिलीट हो गया!');
        fetchUploadedMaterials();
      } else { 
        alert(data.message || 'डिलीट फ़ेल हो गया!'); 
      }
    } catch (error) { 
      alert('फ़ाइल डिलीट एरर!'); 
    }
  };

  // 🔴 Force Logout API
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
      alert('Connection failed!'); 
    }
  };

  // 🔴 Robust Google Drive Link Formatter
  const formatDriveLink = (url) => {
    if (!url) return '';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  // 🔴 Upload Handler
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

    const finalDriveUrl = formatDriveLink(driveUrl);

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

        .adm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: clamp(16px, 3vw, 24px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
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
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          flex-shrink: 0;
        }

        .adm-btn-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          width: auto;
        }

        .adm-candidate-btn {
          padding: 12px 18px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
        }

        .adm-candidate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(59, 130, 246, 0.5);
        }

        .adm-logout-btn {
          padding: 12px 18px;
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 15px rgba(239, 68, 68, 0.3);
        }

        .adm-logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(239, 68, 68, 0.5);
        }

        .adm-card {
          margin-top: 25px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: clamp(20px, 4vw, 30px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-sizing: border-box;
          width: 100%;
        }

        .adm-card-title {
          margin: 0 0 20px 0;
          color: #ffffff;
          font-size: clamp(18px, 4vw, 21px);
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .adm-input-group {
          margin-bottom: 18px;
          width: 100%;
        }

        .adm-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .adm-input {
          width: 100%;
          padding: 12px 15px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          font-size: 14px;
          color: #ffffff;
          outline: none;
          background: rgba(15, 23, 42, 0.6);
          transition: all 0.3s ease;
        }

        .adm-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
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
          border: 1px dashed rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          box-sizing: border-box;
          font-size: 13px;
          background: rgba(15, 23, 42, 0.4);
          color: #94a3b8;
        }

        .adm-upload-btn {
          width: 100%;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          background: linear-gradient(135deg, #06b6d4, #10b981);
          color: #ffffff;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(6, 182, 212, 0.3);
        }

        .adm-upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(6, 182, 212, 0.5);
        }

        .adm-filter-bar {
          display: flex;
          gap: 12px;
          background: rgba(15, 23, 42, 0.5);
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .adm-mat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 10px;
          flex-wrap: wrap;
          transition: all 0.3s ease;
        }

        .adm-mat-item:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .adm-delete-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(244, 63, 94, 0.3);
        }

        .adm-delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(244, 63, 94, 0.5);
        }

        .adm-table-wrapper {
          overflow-x: auto;
          width: 100%;
          border-radius: 12px;
          -webkit-overflow-scrolling: touch;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          min-width: 500px;
        }

        .adm-th {
          padding: 14px;
          text-align: left;
          font-size: 14px;
          font-weight: 700;
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
        {/* Header */}
        <div className="adm-header">
          <div className="adm-avatar-box">
            <div className="adm-avatar">👑</div>
            <div>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700' }}>Main Admin Control Panel</h2>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>BCA Portal Management</p>
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

        {/* Upload Card */}
        <div className="adm-card">
          <h3 className="adm-card-title">➕ Upload Study Material, PYQ & Quiz</h3>
          <form onSubmit={handleFileUpload}>
            
            <div className="adm-input-group">
              <label className="adm-label">Select Content Type *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="adm-input" style={{ fontWeight: 'bold' }}>
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

            {category === 'quiz' ? (
              <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '18px', borderRadius: '12px', marginBottom: '18px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8' }}>❓ Add Quiz Question & Options</h4>
                
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

                <div className="adm-input-group">
                  <label className="adm-label">Correct Option Key *</label>
                  <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)} className="adm-input">
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="adm-input-group">
                  <label className="adm-label">🔗 Google Drive Share Link (Iframe Embed Viewer)</label>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing" 
                    value={driveUrl} 
                    onChange={(e) => setDriveUrl(e.target.value)} 
                    className="adm-input" 
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '6px' }}>
                    * लिंक खुद ब खुद <b>/preview</b> फॉर्मेट में बदल जाएगी।
                  </small>
                </div>

                <p style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold', color: '#64748b', fontSize: '12px' }}>— OR —</p>

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

            <button type="submit" className="adm-upload-btn">🚀 Upload to server</button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="adm-card">
          <h3 className="adm-card-title">📂 Uploaded Documents & Content Management</h3>
          
          <div className="adm-filter-bar">
            <span style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '13px', minWidth: '130px' }}>🔍 Live Filter List:</span>
            
            <div style={{ flex: 1, minWidth: '140px' }}>
              <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="adm-input" style={{ padding: '8px', fontSize: '13px' }}>
                <option value="all">📁 All Courses (सभी कोर्सेज)</option>
                <option value="bca">BCA</option>
                <option value="bcom">B.Com</option>
                <option value="arts">Arts</option>
                <option value="science">Science</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '140px' }}>
              <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="adm-input" style={{ padding: '8px', fontSize: '13px' }}>
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

          <div style={{ overflowY: 'auto', maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((mat) => (
                <div key={mat._id} className="adm-mat-item">
                  <div style={{ wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '14px' }}>
                      {mat.category === 'quiz' ? '❓' : mat.category === 'pyq' ? '📝' : '📄'} {mat.title}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '12px', color: '#cbd5e1', flexWrap: 'wrap' }}>
                      <span><strong>Category:</strong> {mat.category ? mat.category.toUpperCase() : 'NOTES'}</span>
                      <span><strong>Course:</strong> {mat.course?.toUpperCase()}</span>
                      <span><strong>Semester:</strong> Sem-{mat.semester}</span>
                      {mat.driveUrl && <span style={{ color: '#38bdf8' }}><b>[Drive Linked]</b></span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMaterial(mat._id, mat.title)} className="adm-delete-btn">🗑️ Delete</button>
                </div>
              ))
            ) : ( 
              <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0', fontSize: '14px' }}>🔍 No documents found for this filter match.</p> 
            )}
          </div>
        </div>

        {/* Live Student Tracking */}
        <div className="adm-card">
          <h3 className="adm-card-title">📊 Student Login Live Tracking List</h3>
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#ffffff' }}>
                  <th className="adm-th">Name</th>
                  <th className="adm-th">Mobile</th>
                  <th className="adm-th">Login Time</th>
                  <th className="adm-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <td className="adm-td">{log.userName}</td>
                    <td className="adm-td">{log.mobile}</td>
                    <td className="adm-td">{new Date(log.loginTime).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: !log.logoutTime ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                      {!log.logoutTime ? '● Online' : '○ Offline'}
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

export default AdminDashboard;