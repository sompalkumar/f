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
          background: #ffffff;
          min-height: 100vh;
        }

        .adm-container {
          padding: clamp(15px, 4vw, 35px);
          max-width: 1050px;
          width: 100%;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          box-sizing: border-box;
          color: #1e293b;
        }

        .adm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: clamp(16px, 3vw, 24px);
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
          background: #008080;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #ffffff;
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
          background: #008080;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .adm-candidate-btn:hover {
          background: #006666;
        }

        .adm-logout-btn {
          padding: 12px 18px;
          background: #008080;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .adm-logout-btn:hover {
          background: #006666;
        }

        .adm-card {
          margin-top: 25px;
          background: #ffffff;
          padding: clamp(20px, 4vw, 30px);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
          width: 100%;
        }

        .adm-card-title {
          margin: 0 0 20px 0;
          color: #0f172a;
          font-size: clamp(18px, 4vw, 21px);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .adm-input-group {
          margin-bottom: 18px;
          width: 100%;
        }

        .adm-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }

        .adm-input {
          width: 100%;
          padding: 12px 15px;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .adm-input:focus {
          border-color: #008080;
          box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.15);
        }

        .adm-input option {
          background-color: #ffffff;
          color: #0f172a;
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
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          box-sizing: border-box;
          font-size: 13px;
          background: #f8fafc;
          color: #475569;
        }

        .adm-upload-btn {
          width: 100%;
          padding: 14px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          background: #008080;
          color: #ffffff;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .adm-upload-btn:hover {
          background: #006666;
        }

        .adm-filter-bar {
          display: flex;
          gap: 12px;
          background: #f8fafc;
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
          border: 1px solid #e2e8f0;
        }

        .adm-mat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          gap: 10px;
          flex-wrap: wrap;
          transition: all 0.2s ease;
        }

        .adm-mat-item:hover {
          background: #f8fafc;
        }

        .adm-delete-btn {
          padding: 8px 16px;
          background: #008080;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .adm-delete-btn:hover {
          background: #006666;
        }

        .adm-table-wrapper {
          overflow-x: auto;
          width: 100%;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          -webkit-overflow-scrolling: touch;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
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
          color: #334155;
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
              <h2 style={{ color: '#0f172a', margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700' }}>Main Admin Control Panel</h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>BCA Portal Management</p>
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
              <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #008080' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#008080' }}>❓ Add Quiz Question & Options</h4>
                
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
                  <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '6px' }}>
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
            <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '13px', minWidth: '130px' }}>🔍 Live Filter List:</span>
            
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
                    <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>
                      {mat.category === 'quiz' ? '❓' : mat.category === 'pyq' ? '📝' : '📄'} {mat.title}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
                      <span><strong>Category:</strong> {mat.category ? mat.category.toUpperCase() : 'NOTES'}</span>
                      <span><strong>Course:</strong> {mat.course?.toUpperCase()}</span>
                      <span><strong>Semester:</strong> Sem-{mat.semester}</span>
                      {mat.driveUrl && <span style={{ color: '#008080' }}><b>[Drive Linked]</b></span>}
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

        {/* Live Student Tracking */}
        <div className="adm-card">
          <h3 className="adm-card-title">📊 Student Login Live Tracking List</h3>
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr style={{ background: '#008080', color: '#ffffff' }}>
                  <th className="adm-th">Name</th>
                  <th className="adm-th">Mobile</th>
                  <th className="adm-th">Login Time</th>
                  <th className="adm-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id || i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="adm-td">{log.userName}</td>
                    <td className="adm-td">{log.mobile}</td>
                    <td className="adm-td">{new Date(log.loginTime).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: !log.logoutTime ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
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