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
  const [category, setCategory] = useState('notes'); // 🟢 'notes', 'pyq', 'quiz'
  const [driveUrl, setDriveUrl] = useState(''); // 🟢 Google Drive URL State
  const [file, setFile] = useState(null);

  // 🟢 Quiz specific states
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

  // 🔴 Authorization Header के साथ Logs प्राप्त करें
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

  // 🔴 Authorization Header के साथ Materials प्राप्त करें
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

  // 🔴 Delete API
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
      alert('connection fail!'); 
    }
  };

  // 🔴 File / Drive / Quiz Upload Handler
  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file && !driveUrl && category !== 'quiz') { 
      alert('⚠️ कृपया एक लोकल फ़ाइल चुनें या Google Drive Link पेस्ट करें!'); 
      return; 
    }

    let finalDriveUrl = driveUrl;
    if (driveUrl.includes('/view')) {
      finalDriveUrl = driveUrl.replace(/\/view.*$/, '/preview');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('course', course);
    formData.append('semester', semester);
    formData.append('category', category); // 'notes', 'pyq', 'quiz'
    
    if (finalDriveUrl) formData.append('driveUrl', finalDriveUrl);
    if (file) formData.append('pdfFile', file);

    if (category === 'quiz') {
      formData.append('question', quizQuestion);
      formData.append('options', JSON.stringify([optionA, optionB, optionC, optionD]));
      formData.append('correctOption', correctOption);
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
        .adm-container {
          padding: clamp(12px, 3vw, 25px);
          max-width: 950px;
          width: 100%;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #f4f6f9;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .adm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #ffffff;
          padding: clamp(14px, 3vw, 20px);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          flex-wrap: wrap;
          gap: 15px;
          width: 100%;
          box-sizing: border-box;
        }

        .adm-avatar-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .adm-avatar {
          width: 45px;
          height: 45px;
          background-color: #fde9c9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .adm-btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          width: auto;
        }

        .adm-candidate-btn {
          padding: 10px 14px;
          background-color: #333333;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          transition: background-color 0.2s;
        }

        .adm-logout-btn {
          padding: 10px 16px;
          background-color: #ff4d4d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          transition: background-color 0.2s;
        }

        .adm-card {
          margin-top: 20px;
          background-color: #ffffff;
          padding: clamp(16px, 4vw, 28px);
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          border: 1px solid #eaeaea;
          box-sizing: border-box;
          width: 100%;
        }

        .adm-card-title {
          margin: 0 0 16px 0;
          color: #000;
          font-size: clamp(16px, 4vw, 19px);
          font-weight: 700;
        }

        .adm-input-group {
          margin-bottom: 16px;
          width: 100%;
        }

        .adm-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #111;
          margin-bottom: 6px;
        }

        .adm-input {
          width: 100%;
          padding: 11px;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          color: black;
          outline: none;
          background-color: white;
        }

        .adm-row-group {
          display: flex;
          gap: 15px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .adm-row-item {
          flex: 1;
          min-width: 220px;
        }

        .adm-file-input {
          width: 100%;
          padding: 10px;
          border: 1px dashed #ccc;
          border-radius: 6px;
          box-sizing: border-box;
          font-size: 13px;
        }

        .adm-upload-btn {
          width: 100%;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          background-color: #06dfd1;
          color: black;
          font-size: 15px;
        }

        .adm-filter-bar {
          display: flex;
          gap: 12px;
          background-color: #f0f4f1;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .adm-mat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
          gap: 10px;
          flex-wrap: wrap;
        }

        .adm-delete-btn {
          padding: 7px 14px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
        }

        .adm-table-wrapper {
          overflow-x: auto;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          min-width: 500px;
        }

        .adm-th {
          padding: 12px 14px;
          text-align: left;
          font-size: 14px;
        }

        .adm-td {
          padding: 12px 14px;
          font-size: 13px;
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
              <h2 style={{ color: 'black', margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '700' }}>Main Admin Control Panel</h2>
              <p style={{ margin: '3px 0 0 0', color: '#555', fontSize: '13px' }}>BCA Portal Management</p>
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
            
            {/* 🟢 Category Selection (Notes, PYQ, Quiz) */}
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

            {/* 🟢 IF CATEGORY IS QUIZ */}
            {category === 'quiz' ? (
              <div style={{ backgroundColor: '#eef9f8', padding: '15px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #06dfd1' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#000' }}>❓ Add Quiz Question & Options</h4>
                
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
              /* 🟢 IF CATEGORY IS NOTES OR PYQ */
              <>
                {/* 🟢 Google Drive URL Option */}
                <div className="adm-input-group">
                  <label className="adm-label">🔗 Google Drive Share Link (Iframe Embed Viewer)</label>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing" 
                    value={driveUrl} 
                    onChange={(e) => setDriveUrl(e.target.value)} 
                    className="adm-input" 
                  />
                  <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    * लिंक खुद ब खुद <b>/preview</b> फॉर्मेट में बदल जाएगी।
                  </small>
                </div>

                <p style={{ textAlign: 'center', margin: '5px 0', fontWeight: 'bold', color: '#888', fontSize: '12px' }}>— OR —</p>

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

            <button type="submit" className="adm-upload-btn">🚀 Upload to server</button>
          </form>
        </div>

        {/* अपलोडेड दस्तावेज प्रबंधन */}
        <div className="adm-card">
          <h3 className="adm-card-title">📂 Uploaded Documents & Content Management</h3>
          
          <div className="adm-filter-bar">
            <span style={{ fontWeight: 'bold', color: 'black', fontSize: '13px', minWidth: '130px' }}>🔍 Live Filter List:</span>
            
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
                    <span style={{ fontWeight: 'bold', color: 'black', fontSize: '14px' }}>
                      {mat.category === 'quiz' ? '❓' : mat.category === 'pyq' ? '📝' : '📄'} {mat.title}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '12px', color: '#555', flexWrap: 'wrap' }}>
                      <span><strong>Category:</strong> {mat.category ? mat.category.toUpperCase() : 'NOTES'}</span>
                      <span><strong>Course:</strong> {mat.course?.toUpperCase()}</span>
                      <span><strong>Semester:</strong> Sem-{mat.semester}</span>
                      {mat.driveUrl && <span style={{ color: '#007bff' }}><b>[Drive Linked]</b></span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMaterial(mat._id, mat.title)} className="adm-delete-btn">🗑️ Delete</button>
                </div>
              ))
            ) : ( 
              <p style={{ color: '#888', textAlign: 'center', margin: '20px 0', fontSize: '14px' }}>🔍 No documents found for this filter match.</p> 
            )}
          </div>
        </div>

        {/* लाइव छात्र ट्रैकिंग लिस्ट */}
        <div className="adm-card">
          <h3 className="adm-card-title">📊 Student Login Live Tracking List</h3>
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr style={{ backgroundColor: '#06dfd1', color: 'black' }}>
                  <th className="adm-th">Name</th>
                  <th className="adm-th">Mobile</th>
                  <th className="adm-th">Login Time</th>
                  <th className="adm-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id || i} style={{ borderBottom: '1px solid #eee' }}>
                    <td className="adm-td">{log.userName}</td>
                    <td className="adm-td">{log.mobile}</td>
                    <td className="adm-td">{new Date(log.loginTime).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: !log.logoutTime ? 'green' : 'red', fontWeight: 'bold' }}>
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

const tdStyle = { padding: '12px 14px', fontSize: '13px' };

export default AdminDashboard;