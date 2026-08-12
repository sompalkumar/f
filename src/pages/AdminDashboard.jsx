import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

function AdminDashboard() {
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [logs, setLogs] = useState([]);
  const [uploadedMaterials, setUploadedMaterials] = useState([]);

  // अपलोड फॉर्म के लिए स्टेट्स
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('bca');
  const [semester, setSemester] = useState('1');
  const [file, setFile] = useState(null);

  // लाइव फ़िल्टर बार के लिए स्टेट्स
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  // 🔴 1. Authorization Header के साथ Logs प्राप्त करें
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
        window.location.replace('/'); 
        return;
      }

      const data = await response.json();
      if (response.ok) setLogs(data);
    } catch (error) { 
      console.error("Live logs fetch error:", error); 
    }
  };

  // 🔴 2. Authorization Header के साथ Materials प्राप्त करें
  const fetchUploadedMaterials = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        return;
      }

      const data = await response.json();
      if (response.ok) setUploadedMaterials(data);
    } catch (error) { 
      console.error("Materials fetch error:", error); 
    }
  };

  useEffect(() => {
    if (userRole !== 'admin' || !token) { 
      window.location.replace('/'); 
    } else {
      fetchLiveLogs();
      fetchUploadedMaterials();
      const interval = setInterval(fetchLiveLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [userRole, token]);

  // 🔴 3. Delete API में Authorization Header जोड़ा
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

  // 🔴 4. Force Logout API में Authorization Header जोड़ा
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

  // 🔴 5. File Upload API में Authorization Header जोड़ा
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) { 
      alert('फाइल चुनें!'); 
      return; 
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('course', course);
    formData.append('semester', semester);
    formData.append('pdfFile', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-material`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // FormData के साथ Content-Type की ज़रूरत नहीं होती
        },
        body: formData 
      });
      const data = await response.json();
      if (response.ok) { 
        alert(data.message || 'फ़ाइल सफलतापूर्वक अपलोड हो गई!'); 
        setTitle(''); 
        setFile(null); 
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

  // फ़िल्टर लॉजिक
  const filteredMaterials = uploadedMaterials.filter((mat) => {
    const matchCourse = filterCourse === 'all' || mat.course === filterCourse;
    const matchSemester = filterSemester === 'all' || mat.semester === filterSemester;
    return matchCourse && matchSemester;
  });

  return (
    <div style={containerStyle}>
      {/* हेडर */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={avatarStyle}>👑</div>
          <div>
            <h2 style={{ color: 'black', margin: 0, fontSize: '24px', fontWeight: '700' }}>Main Admin Control Panel</h2>
            <p style={{ margin: '4px 0 0 0', color: 'black', fontSize: '14px' }}>BCA Portal Management</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleLogoutAllStudents} style={logoutAllBtnStyle}>⚠️ Force Logout All Students</button>
        </div>
      </div>

      {/* अपलोड फॉर्म बॉक्स */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>➕ Upload new study material or images</h3>
        <form onSubmit={handleFileUpload}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>(Title Name) *</label>
            <input 
              type="text" 
              placeholder="e.g. C++ Notes" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={inputStyle} 
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Select Course *</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)} style={inputStyle}>
                <option value="bca">BCA</option>
                <option value="bcom">B.Com</option>
                <option value="arts">Arts</option>
                <option value="science">Science</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Select Semester *</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle}>
                <option value="1">Sem-1</option>
                <option value="2">Sem-2</option>
                <option value="3">Sem-3</option>
                <option value="4">Sem-4</option>
                <option value="5">Sem-5</option>
                <option value="6">Sem-6</option>
              </select>
            </div>
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Select file (.pdf, .jpg, .png) *</label>
            <input 
              id="fileInput" 
              type="file" 
              accept=".pdf, .jpg, .jpeg, .png" 
              onChange={(e) => setFile(e.target.files[0])} 
              style={fileInputStyle} 
              required 
            />
          </div>
          <button type="submit" style={{ ...uploadBtnStyle, backgroundColor: '#06dfd1', color: 'black' }}>🚀 Upload to server</button>
        </form>
      </div>

      {/* अपलोडेड दस्तावेज प्रबंधन */}
      <div style={{ ...cardStyle, marginTop: '30px' }}>
        <h3 style={{ ...cardTitleStyle, color: 'black' }}>📂 Uploaded Documents Management</h3>
        
        {/* लाइव फ़िल्टर बार */}
        <div style={{ display: 'flex', gap: '15px', backgroundColor: '#f0f4f1', padding: '15px', borderRadius: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'black', fontSize: '14px' }}>🔍 Live Filter List:</span>
          
          <div style={{ flex: 1, minWidth: '120px' }}>
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} style={{ ...inputStyle, padding: '8px', fontSize: '14px' }}>
              <option value="all">📁 All Courses (सभी कोर्सेज)</option>
              <option value="bca">BCA</option>
              <option value="bcom">B.Com</option>
              <option value="arts">Arts</option>
              <option value="science">Science</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '120px' }}>
            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} style={{ ...inputStyle, padding: '8px', fontSize: '14px' }}>
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

        {/* फ़िल्टर की हुई फाइल्स की सूची */}
        <div style={{ overflowY: 'auto', maxHeight: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((mat) => (
              <div key={mat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: 'black' }}>{mat.fileType === 'pdf' ? '📄' : '🖼️'} {mat.title}</span>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '4px', fontSize: '12px', color: '#666' }}>
                    <span><strong>Course:</strong> {mat.course?.toUpperCase()}</span>
                    <span><strong>Semester:</strong> Sem-{mat.semester}</span>
                    <span><strong>Type:</strong> {mat.fileType?.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteMaterial(mat._id, mat.title)} style={{ padding: '8px 16px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>🗑️ Delete</button>
              </div>
            ))
          ) : ( 
            <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>🔍 No documents found for this filter match.</p> 
          )}
        </div>
      </div>

      {/* लाइव छात्र ट्रैकिंग लिस्ट */}
      <div style={{ ...cardStyle, marginTop: '30px' }}>
        <h3 style={cardTitleStyle}>📊 Student Login Live Tracking List</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#06dfd1', color: 'black' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Mobile</th>
                <th style={thStyle}>Login Time</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log._id || i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{log.userName}</td>
                  <td style={tdStyle}>{log.mobile}</td>
                  <td style={tdStyle}>{new Date(log.loginTime).toLocaleString()}</td>
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
  );
}

// 🎨 स्टाइल्स
const containerStyle = { padding: '30px 20px', maxWidth: '950px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '10px' };
const avatarStyle = { width: '50px', height: '40px', backgroundColor: '#fde9c9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' };
const logoutAllBtnStyle = { padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };
const cardStyle = { marginTop: '25px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #eaeaea' };
const cardTitleStyle = { margin: '0 0 20px 0', color: 'black', fontSize: '18px', fontWeight: '700' };
const inputGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: 'black', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', color: 'black', outline: 'none', backgroundColor: 'white' };
const fileInputStyle = { width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', boxSizing: 'border-box' };
const uploadBtnStyle = { padding: '12px 30px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle = { padding: '14px 16px', textAlign: 'left' };
const tdStyle = { padding: '14px 16px', fontSize: '14px' };

export default AdminDashboard;