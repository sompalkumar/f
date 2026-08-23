import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();

  // 🟢 State for Popup PDF Modal
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');
  const [currentRawUrl, setCurrentRawUrl] = useState('');

  // 🟢 Dynamic Uploaded Materials State
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 Session aur Local Storage dono jagah se Credentials fetch karein
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  const userName = 
    sessionStorage.getItem('userName') || 
    localStorage.getItem('userName') || 
    'Student';

  // 🛡️ User Role ('student' ya 'admin')
  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole') || 
    'student';

  // 🛡️ Security Check: Agar user logged in nahi hai ya token missing hai toh Root (/) par bhejen
  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/', { replace: true });
      return;
    }

    fetchUploadedMaterials();
  }, [isLoggedIn, token, navigate]);

  // 🔴 Fetch Uploaded Materials from Backend API
  const fetchUploadedMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/', { replace: true });
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching materials for dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Courses List
  const courses = [
    { id: 'bca', name: '💻 BCA (Bachelor of Computer Applications)' },
    { id: 'bcom', name: '📊 B.Com (Bachelor of Commerce)' },
    { id: 'arts', name: '🎨 Arts (Bachelor of Arts)' },
    { id: 'science', name: '🔬 Science (Bachelor of Science)' }
  ];

  // PDF Pop-up खोलne ke liye function (With Security Cleanup)
  const openPdfModal = (url, title) => {
    let finalPreviewUrl = url;

    // Google Drive Viewer Link Format Cleanup for Iframe
    if (url && url.includes('drive.google.com')) {
      if (url.includes('/view')) {
        finalPreviewUrl = url.replace(/\/view.*$/, '/preview');
      } else if (!url.endsWith('/preview')) {
        finalPreviewUrl = `${url.replace(/\/$/, '')}/preview`;
      }
    }

    setCurrentRawUrl(url);
    setCurrentPdfUrl(finalPreviewUrl);
    setCurrentPdfTitle(title);
    setIsPdfOpen(true);
  };

  // PDF Pop-up बंद करने के लिए फंक्शन
  const closePdfModal = () => {
    setIsPdfOpen(false);
    setCurrentPdfUrl('');
    setCurrentPdfTitle('');
    setCurrentRawUrl('');
  };

  // ⬇️ Direct Download Link Converter
  const getDownloadUrl = (rawUrl) => {
    if (!rawUrl) return '#';
    if (rawUrl.includes('drive.google.com')) {
      const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return rawUrl;
  };

  // Agar login nahi hai ya token missing hai toh UI render hone se rokein
  if (!isLoggedIn || !token) {
    return null; 
  }

  return (
    <>
      {/* 📱 Mobile, Tablet & Desktop fully responsive styles */}
      <style>{`
        .db-container {
          padding: clamp(15px, 4vw, 30px) clamp(10px, 3vw, 20px);
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .db-admin-notice {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          box-sizing: border-box;
          width: 100%;
        }

        .db-admin-btn {
          background-color: #333;
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          white-space: nowrap;
          transition: background-color 0.2s;
        }

        .db-admin-btn:hover {
          background-color: #000;
        }

        .db-header {
          margin-bottom: 25px;
          text-align: center;
          padding: 0 10px;
        }

        .db-title {
          margin: 0;
          color: #333;
          font-size: clamp(20px, 5vw, 28px);
          font-weight: 700;
        }

        .db-subtitle {
          color: #666;
          margin-top: 8px;
          font-size: clamp(13px, 3.5vw, 16px);
          line-height: 1.5;
        }

        .db-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 30px;
        }

        .db-card {
          padding: clamp(16px, 3vw, 24px);
          border: 1px solid #eaeaea;
          border-radius: 12px;
          background-color: #ffffff;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          box-sizing: border-box;
          width: 100%;
        }

        .db-card-title {
          font-size: clamp(15px, 4vw, 18px);
          color: #333;
          margin: 0;
          line-height: 1.4;
        }

        .db-button {
          width: 100%;
          max-width: 220px;
          padding: 10px 16px;
          background-color: #06dfd1;
          color: #000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          transition: background-color 0.2s, transform 0.1s;
        }

        .db-button:active {
          transform: scale(0.98);
        }

        /* 🔲 In-App Pop-up Modal Styling */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          padding: 10px;
          box-sizing: border-box;
        }

        .pdf-modal-container {
          background-color: #ffffff;
          width: 100%;
          max-width: 950px;
          height: 88vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          position: relative;
        }

        .pdf-modal-header {
          padding: 12px 20px;
          background-color: #1a1a1a;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 50%;
        }

        .pdf-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pdf-download-btn {
          background-color: #06dfd1;
          color: #000;
          padding: 6px 14px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          font-size: 13px;
          transition: opacity 0.2s;
        }

        .pdf-download-btn:hover {
          opacity: 0.9;
        }

        .pdf-modal-close-btn {
          background-color: #ff4d4d;
          color: #fff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          transition: background-color 0.2s;
        }

        .pdf-modal-close-btn:hover {
          background-color: #cc0000;
        }

        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background-color: #222;
          position: relative;
        }

        /* 🛡️ SECURITY FIX: Top-Right Pop-out Arrow Blocker */
        /* Yeh Google Drive ke 'External Tab Open' waale arrow button ko block kar deta hai */
        .drive-security-blocker {
          position: absolute;
          top: 0;
          right: 0;
          width: 65px;
          height: 60px;
          background-color: transparent;
          z-index: 999;
          cursor: not-allowed;
        }

        /* 📱 Mobile Screens (< 576px) Special Rules */
        @media screen and (max-width: 576px) {
          .db-admin-notice {
            flex-direction: column;
            text-align: center;
            padding: 12px;
          }

          .db-admin-btn {
            width: 100%;
            padding: 10px;
          }

          .db-grid {
            grid-template-columns: 1fr;
          }

          .db-button {
            max-width: 100%;
          }

          .pdf-modal-container {
            height: 94vh;
          }

          .pdf-modal-title {
            max-width: 40%;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="db-container">
        {/* 👑 Admin Notice Bar */}
        {userRole === 'admin' && (
          <div className="db-admin-notice">
            <span>👑 Logged in as <strong>Admin</strong></span>
            <button 
              onClick={() => navigate('/admin-dashboard')} 
              className="db-admin-btn"
            >
              Go to Admin Panel ⚙️
            </button>
          </div>
        )}

        {/* 🎯 Header Section */}
        <div className="db-header">
          <h2 className="db-title">Welcome, {userName}! 👋</h2>
          <p className="db-subtitle">
            Please select your course to see the list of semesters:
          </p>
        </div>
        
        {/* 📚 Course Cards Grid */}
        <div className="db-grid">
          {courses.map((course) => (
            <div key={course.id} className="db-card">
              <h3 className="db-card-title">
                {course.name}
              </h3>
              <button 
                onClick={() => navigate(`/course/${course.id}`)}
                className="db-button"
              >
                View Semesters
              </button>
            </div>
          ))}
        </div>

        {/* 📄 Dynamic Google Drive & Uploaded Materials Section */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#333', fontSize: '18px', marginBottom: '15px' }}>
            📚 Recent Study Materials & Notes
          </h3>
          
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Loading uploaded materials...</p>
          ) : materials.length > 0 ? (
            <div className="db-grid">
              {materials.map((mat) => {
                const fileTargetUrl = mat.driveUrl || mat.fileUrl || (mat.filePath ? `${API_BASE_URL}/${mat.filePath}` : '');
                
                if (mat.category === 'quiz') return null;

                return (
                  <div key={mat._id || mat.id} className="db-card">
                    <div style={{ width: '100%' }}>
                      <span style={{ fontSize: '11px', background: '#06dfd1', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {mat.course ? mat.course.toUpperCase() : 'BCA'} - SEM {mat.semester || '1'}
                      </span>
                      <h3 className="db-card-title" style={{ marginTop: '8px' }}>
                        {mat.title}
                      </h3>
                    </div>

                    {fileTargetUrl ? (
                      <button 
                        onClick={() => openPdfModal(fileTargetUrl, mat.title)}
                        className="db-button"
                        style={{ backgroundColor: '#333', color: '#fff' }}
                      >
                        View PDF 👁️
                      </button>
                    ) : (
                      <button className="db-button" disabled style={{ backgroundColor: '#ccc', cursor: 'not-allowed' }}>
                        No File Link
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#777', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              No uploaded study material found yet.
            </p>
          )}
        </div>
      </div>

      {/* 🔲 In-App Iframe PDF Pop-up Modal with Security Protection */}
      {isPdfOpen && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-container">
            <div className="pdf-modal-header">
              <h3 className="pdf-modal-title">{currentPdfTitle}</h3>
              <div className="pdf-header-actions">
                {/* ⬇️ Student Direct Download Option */}
                <a 
                  href={getDownloadUrl(currentRawUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pdf-download-btn"
                  download
                >
                  ⬇️ Download PDF
                </a>
                <button onClick={closePdfModal} className="pdf-modal-close-btn">
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="pdf-modal-body">
              {/* 🛡️ SECURITY FIX: Transperent Blocker Overlay */}
              {/* Yeh Google Drive ke arrow button par click hone se rokta hai */}
              <div className="drive-security-blocker" title="External opening is disabled for security"></div>

              <iframe
                src={currentPdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="PDF Preview"
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;