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

  // PDF Pop-up खोलने के लिए फंक्शन (With Security Cleanup)
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
      {/* 📱 Liquid Glassmorphism Responsive Styles */}
      <style>{`
        .db-wrapper {
          min-height: calc(100vh - 60px);
          position: relative;
          padding: clamp(20px, 4vw, 40px) clamp(10px, 3vw, 20px);
          box-sizing: border-box;
          overflow: hidden;
        }

        .db-wrapper::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/udhnacollege.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          filter: blur(12px);
          -webkit-filter: blur(12px);
          transform: scale(1.05);
          z-index: -2;
        }

        .db-wrapper::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.2);
          z-index: -1;
        }

        .db-container {
          max-width: 950px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
          z-index: 1;
        }

        .db-admin-notice {
          background: rgba(255, 243, 205, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #533f03;
          border: 1.5px solid rgba(255, 238, 186, 0.8);
          padding: 14px 20px;
          border-radius: 50px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          box-sizing: border-box;
          width: 100%;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }

        .db-admin-btn {
          background: rgba(29, 29, 31, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 9px 18px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
// welcom khushbu
        .db-admin-btn:hover {
          background: rgba(0, 0, 0, 0.95);
          transform: translateY(-1px);
        }

        .db-header {
          margin-bottom: 30px;
          text-align: center;
          padding: 25px;
          background: rgba(243, 5, 5, 0.94);
          backdrop-filter: blur(25px) saturate(190%);
          -webkit-backdrop-filter: blur(25px) saturate(190%);
          border-radius: 28px;
          border: 1.5px solid rgba(255, 255, 255, 0.75);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .db-title {
          margin: 0;
          color: #1d1d1f;
          font-size: clamp(22px, 5vw, 32px);
          font-weight: 800;
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.6);
        }

        .db-subtitle {
          color: #2d2d2f;
          margin-top: 10px;
          font-size: clamp(14px, 3.5vw, 16px);
          font-weight: 500;
          line-height: 1.5;
        }

        .db-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 35px;
        }

        .db-card {
          padding: clamp(20px, 3vw, 26px);
          border: 1.5px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(25px) saturate(190%);
          -webkit-backdrop-filter: blur(25px) saturate(190%);
          text-align: center;
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.08),
            inset 0 2px 4px rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          box-sizing: border-box;
          width: 100%;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .db-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .db-card-title {
          font-size: clamp(16px, 4vw, 18px);
          color: #1d1d1f;
          margin: 0;
          line-height: 1.4;
          font-weight: 700;
        }

        .db-button {
          width: 100%;
          padding: 12px 18px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.45) 100%);
          color: #1d1d1f;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.06),
            inset 0 2px 4px rgba(255, 255, 255, 0.9);
          transition: all 0.2s ease;
        }

        .db-button:hover {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .db-button:active {
          transform: scale(0.98);
        }

        /* 🔲 Liquid Glass Pop-up Modal Styling */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          padding: 15px;
          box-sizing: border-box;
        }

        .pdf-modal-container {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(30px) saturate(190%);
          -webkit-backdrop-filter: blur(30px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.8);
          width: 100%;
          max-width: 950px;
          height: 88vh;
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          position: relative;
        }

        .pdf-modal-header {
          padding: 16px 22px;
          background: rgba(255, 255, 255, 0.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.6);
          color: #1d1d1f;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 50%;
        }

        .pdf-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pdf-download-btn {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.9);
          color: #1d1d1f;
          padding: 8px 16px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .pdf-download-btn:hover {
          background: rgba(255, 255, 255, 0.95);
        }

        .pdf-modal-close-btn {
          background: rgba(255, 255, 255, 0.5);
          color: #1d1d1f;
          border: 1px solid rgba(255, 255, 255, 0.8);
          padding: 8px 16px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .pdf-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.85);
        }

        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.2);
          position: relative;
        }

        /* 🛡️ SECURITY FIX: Top-Right Pop-out Arrow Blocker */
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
            padding: 14px;
            border-radius: 20px;
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
            height: 92vh;
            border-radius: 20px;
          }

          .pdf-modal-title {
            max-width: 40%;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="db-wrapper">
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
          <div style={{ marginTop: '35px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(25px) saturate(190%)',
              WebkitBackdropFilter: 'blur(25px) saturate(190%)',
              padding: '16px 24px',
              borderRadius: '50px',
              border: '1.5px solid rgba(255, 255, 255, 0.75)',
              display: 'inline-block',
              marginBottom: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ color: '#1d1d1f', fontSize: '18px', margin: 0, fontWeight: '800' }}>
                📚 Recent Study Materials & Notes
              </h3>
            </div>
            
            {isLoading ? (
              <p style={{ 
                textAlign: 'center', 
                color: '#1d1d1f', 
                padding: '20px', 
                background: 'rgba(255, 255, 255, 0.35)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '20px', 
                fontWeight: '600' 
              }}>Loading uploaded materials...</p>
            ) : materials.length > 0 ? (
              <div className="db-grid">
                {materials.map((mat) => {
                  const fileTargetUrl = mat.driveUrl || mat.fileUrl || (mat.filePath ? `${API_BASE_URL}/${mat.filePath}` : '');
                  
                  if (mat.category === 'quiz') return null;

                  return (
                    <div key={mat._id || mat.id} className="db-card">
                      <div style={{ width: '100%' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          background: 'rgba(255, 255, 255, 0.65)', 
                          border: '1px solid rgba(255, 255, 255, 0.8)',
                          padding: '4px 10px', 
                          borderRadius: '50px', 
                          fontWeight: '800',
                          color: '#1d1d1f'
                        }}>
                          {mat.course ? mat.course.toUpperCase() : 'BCA'} - SEM {mat.semester || '1'}
                        </span>
                        <h3 className="db-card-title" style={{ marginTop: '12px' }}>
                          {mat.title}
                        </h3>
                      </div>

                      {fileTargetUrl ? (
                        <button 
                          onClick={() => openPdfModal(fileTargetUrl, mat.title)}
                          className="db-button"
                          style={{ background: 'rgba(255, 255, 255, 0.85)', color: '#1d1d1f' }}
                        >
                          View PDF 👁️
                        </button>
                      ) : (
                        <button className="db-button" disabled style={{ backgroundColor: 'rgba(200, 200, 200, 0.4)', cursor: 'not-allowed', color: '#666' }}>
                          No File Link
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ 
                color: '#1d1d1f', 
                backgroundColor: 'rgba(255, 255, 255, 0.35)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.75)',
                padding: '20px', 
                borderRadius: '20px', 
                textAlign: 'center',
                fontWeight: '600'
              }}>
                No uploaded study material found yet.
              </p>
            )}
          </div>
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
              {/* 🛡️ SECURITY FIX: Transparent Blocker Overlay */}
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