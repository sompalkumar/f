import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();

  // 🟢 Modal States
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('standard'); // 'youtube' | 'drive-file' | 'drive-folder' | 'standard'
  const [embedUrl, setEmbedUrl] = useState('');
  const [rawFileUrl, setRawFileUrl] = useState('');

  // 🟢 Dynamic Uploaded Materials State
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 Session & Local Storage Auth
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

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole') || 
    'student';

  // 🔴 Fetch Uploaded Materials from Backend API
  const fetchUploadedMaterials = useCallback(async () => {
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
  }, [token, navigate]);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/', { replace: true });
      return;
    }
    fetchUploadedMaterials();
  }, [isLoggedIn, token, navigate, fetchUploadedMaterials]);

  // 🛡️ Lock Background Scroll & Handle Escape Key when Modal is Open
  useEffect(() => {
    if (!isPdfOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closePdfModal();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPdfOpen]);

  // Courses List
  const courses = [
    { id: 'bca', name: '💻 BCA (Bachelor of Computer Applications)' },
    { id: 'bcom', name: '📊 B.Com (Bachelor of Commerce)' },
    { id: 'arts', name: '🎨 Arts (Bachelor of Arts)' },
    { id: 'science', name: '🔬 Science (Bachelor of Science)' }
  ];

  // 🛡️ Intelligent Resource Parser & Modal Opener (Fixes X-Frame & 403 errors)
  const openPdfModal = (url, title) => {
    if (!url) return;

    setRawFileUrl(url);
    setModalTitle(title || 'Study Material');

    // 1. YouTube Detection (Fixes X-Frame-Options blocked error)
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|m\.youtube\.com\/watch\?v=)([^#&?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
      setModalType('youtube');
      setEmbedUrl(`https://www.youtube-nocookie.com/embed/${ytMatch[2]}?autoplay=1&rel=0`);
      setIsPdfOpen(true);
      return;
    }

    // 2. Google Drive Folder Detection (Fixes Folder 403 Forbidden error)
    if (url.includes('/folders/')) {
      setModalType('drive-folder');
      setEmbedUrl('');
      setIsPdfOpen(true);
      return;
    }

    // 3. Google Drive File Detection
    if (url.includes('drive.google.com')) {
      const driveMatch = url.match(/(?:d\/|id=|file\/d\/)([\w-]{25,})/);
      if (driveMatch && driveMatch[1]) {
        setModalType('drive-file');
        setEmbedUrl(`https://drive.google.com/file/d/${driveMatch[1]}/preview`);
        setIsPdfOpen(true);
        return;
      }
    }

    // 4. Standard PDF or Direct File Link
    setModalType('standard');
    setEmbedUrl(url);
    setIsPdfOpen(true);
  };

  const closePdfModal = () => {
    setIsPdfOpen(false);
    setEmbedUrl('');
    setModalTitle('');
    setRawFileUrl('');
    setModalType('standard');
  };

  // ⬇️ Direct Download Link Generator
  const getDownloadUrl = (rawUrl) => {
    if (!rawUrl) return '#';
    if (rawUrl.includes('drive.google.com')) {
      const match = rawUrl.match(/(?:d\/|id=|file\/d\/)([\w-]{25,})/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return rawUrl;
  };

  if (!isLoggedIn || !token) {
    return null; 
  }

  return (
    <>
      <style>{`
        .db-wrapper {
          min-height: calc(100vh - 60px);
          position: relative;
          padding: clamp(20px, 4vw, 40px) clamp(10px, 3vw, 20px);
          box-sizing: border-box;
          background-color: #f4f6f8;
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
          background: #eef2f5;
          color: #2b3a42;
          border: 1.5px solid #008080;
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          box-sizing: border-box;
          width: 100%;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .db-admin-btn {
          background: #008080;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 128, 128, 0.2);
        }

        .db-admin-btn:hover {
          background: #006666;
          transform: translateY(-1px);
        }

        .db-header {
          margin-bottom: 30px;
          text-align: center;
          padding: 25px;
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .db-title {
          margin: 0;
          color: #1a202c;
          font-size: clamp(22px, 5vw, 32px);
          font-weight: 800;
        }

        .db-subtitle {
          color: #4a5568;
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
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          background: #e2e8f0;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          box-sizing: border-box;
          width: 100%;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .db-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          border-color: #008080;
        }

        .db-card-title {
          font-size: clamp(16px, 4vw, 18px);
          color: #1e293b;
          margin: 0;
          line-height: 1.4;
          font-weight: 700;
        }

        .db-button {
          width: 100%;
          padding: 12px 18px;
          background: #008080;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 10px rgba(0, 128, 128, 0.2);
          transition: all 0.2s ease;
        }

        .db-button:hover {
          background: #006666;
          box-shadow: 0 6px 14px rgba(0, 128, 128, 0.3);
        }

        .db-button:active {
          transform: scale(0.98);
        }

        /* 🔲 Fixed Full-Height PDF Modal Styling */
        .pdf-modal-overlay {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(2, 6, 23, 0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          padding: 12px;
          box-sizing: border-box;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .pdf-modal-container {
          background: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 100%;
          max-width: 1100px;
          height: 94vh;
          max-height: 94vh;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          position: relative;
        }

        .pdf-modal-header {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
          color: #0f172a;
        }

        .pdf-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .pdf-download-btn {
          background: #008080;
          border: none;
          color: #ffffff;
          padding: 7px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
          font-size: 12px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .pdf-download-btn:hover {
          background: #006666;
        }

        .pdf-modal-close-btn {
          background: #e2e8f0;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 7px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .pdf-modal-close-btn:hover {
          background: #cbd5e1;
        }

        /* Full Height Fix: min-height: 0 ensures complete screen visibility */
        .pdf-modal-body {
          flex: 1 1 0%;
          min-height: 0;
          width: 100%;
          height: 100%;
          background-color: #0f172a;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .pdf-full-iframe {
          width: 100%;
          height: 100%;
          flex: 1 1 0%;
          min-height: 0;
          border: none;
          background: #ffffff;
          display: block;
        }

        .pdf-folder-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #ffffff;
          background: #0f172a;
        }

        .pdf-open-btn {
          background: #2563eb;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
          margin-top: 16px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .pdf-open-btn:hover {
          background: #1d4ed8;
        }

        @media screen and (max-width: 576px) {
          .db-admin-notice {
            flex-direction: column;
            text-align: center;
            padding: 14px;
            border-radius: 12px;
          }

          .db-admin-btn {
            width: 100%;
            padding: 10px;
          }

          .db-grid {
            grid-template-columns: 1fr;
          }

          .pdf-modal-container {
            height: 96vh;
            max-height: 96vh;
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
              background: '#ffffff',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              display: 'inline-block',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ color: '#0f172a', fontSize: '18px', margin: 0, fontWeight: '800' }}>
                📚 Recent Study Materials & Notes
              </h3>
            </div>
            
            {isLoading ? (
              <p style={{ 
                textAlign: 'center', 
                color: '#334155', 
                padding: '20px', 
                background: '#e2e8f0', 
                borderRadius: '12px', 
                border: '1.5px solid #cbd5e1', 
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
                          background: '#ffffff', 
                          border: '1px solid #94a3b8', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontWeight: '800', 
                          color: '#0f172a' 
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
                        >
                          View Resource 👁️
                        </button>
                      ) : (
                        <button className="db-button" disabled style={{ backgroundColor: '#94a3b8', cursor: 'not-allowed', color: '#ffffff', boxShadow: 'none' }}>
                          No File Link
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ 
                color: '#334155', 
                backgroundColor: '#e2e8f0', 
                border: '1.5px solid #cbd5e1', 
                padding: '20px', 
                borderRadius: '12px', 
                textAlign: 'center', 
                fontWeight: '600' 
              }}>
                No uploaded study material found yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🔲 Robust Full-Height In-App Resource Viewer */}
      {isPdfOpen && (
        <div className="pdf-modal-overlay" onClick={closePdfModal}>
          <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="pdf-modal-header">
              <h3 className="pdf-modal-title" title={modalTitle}>
                {modalType === 'youtube' ? '🎥 ' : modalType === 'drive-folder' ? '📁 ' : '📄 '}
                {modalTitle}
              </h3>

              <div className="pdf-header-actions">
                {/* External View Link */}
                <a 
                  href={rawFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pdf-download-btn"
                  style={{ background: '#2563eb' }}
                >
                  🔗 Open Tab
                </a>

                {modalType !== 'youtube' && modalType !== 'drive-folder' && (
                  <a 
                    href={getDownloadUrl(rawFileUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pdf-download-btn"
                  >
                    ⬇️ Save
                  </a>
                )}

                <button onClick={closePdfModal} className="pdf-modal-close-btn" aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="pdf-modal-body">
              {modalType === 'drive-folder' ? (
                /* Google Drive Folder View */
                <div className="pdf-folder-card">
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Google Drive Folder</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, maxWidth: '380px' }}>
                    Google Drive folders cannot be rendered directly inside a frame. Click below to view all contents:
                  </p>
                  <a 
                    href={rawFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="pdf-open-btn"
                  >
                    📂 Open Folder in New Tab
                  </a>
                </div>
              ) : (
                /* Clean Full-Height Iframe (No duplicate allowfullscreen warning) */
                <iframe
                  src={embedUrl}
                  title={modalTitle || 'Material View'}
                  className="pdf-full-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                />
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;