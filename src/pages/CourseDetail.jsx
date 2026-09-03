import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// 🔲 In-App PDF Pop-up Modal Import
import PdfModal from '../components/PdfModal';

function CourseDetail() {
  const { courseId } = useParams(); 
  const navigate = useNavigate();
  
  const [selectedSem, setSelectedSem] = useState(null);
  const [dbMaterials, setDbMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🟢 Live Image Preview (Lightbox)
  const [previewImage, setPreviewImage] = useState(null);

  // 🟢 In-App PDF Modal State
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState('');

  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  // 🟢 Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 🟢 Fetch Materials from Backend
  const fetchMaterials = useCallback(async () => {
    if (!selectedSem || !courseId) return;

    setLoading(true);
    setDbMaterials([]);

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/materials/${courseId}/${selectedSem}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (res.status === 401 || res.status === 403) {
        sessionStorage.clear(); 
        localStorage.clear();
        alert('⏰ आपका सुरक्षा सेशन समाप्त हो चुका है! कृपया दोबारा लॉगिन करें।');
        navigate('/', { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data) setDbMaterials(data);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSem, courseId, navigate]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Close preview on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
        setIsPdfOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const semesters = [1, 2, 3, 4, 5, 6];

  // Helper function to get full file URL
  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 🟢 View File Action
  const handleViewFile = (fileUrl, fileType, title) => {
    const fullUrl = getFullFileUrl(fileUrl);
    if (fileType === 'pdf' || (fileUrl && fileUrl.toLowerCase().includes('drive.google.com'))) {
      setSelectedPdfUrl(fullUrl);
      setSelectedPdfTitle(title || "PDF Viewer");
      setIsPdfOpen(true);
    } else {
      setPreviewImage(fullUrl);
    }
  };

  return (
    <>
      {/* 🎨 Updated Teal & Cyan Theme Styles matching Project UI */}
      <style>{`
        .cd-wrapper {
          min-height: calc(100vh - 60px);
          position: relative;
          padding: clamp(20px, 4vw, 40px) clamp(10px, 3vw, 20px);
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f0fdfa;
        }

        .cd-wrapper::before {
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
          z-index: 0;
        }

        .cd-wrapper::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(2, 73, 89, 0.45);
          z-index: 0;
        }

        .cd-container {
          max-width: 700px;
          margin: 0 auto;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }

        .cd-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 24px 20px;
          border-radius: 20px;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 10px 25px rgba(2, 73, 89, 0.15);
          text-align: center;
          margin-bottom: 25px;
        }

        .cd-title {
          text-transform: uppercase;
          color: #024959;
          font-weight: 800;
          margin: 0 0 8px 0;
          font-size: clamp(20px, 4.5vw, 26px);
        }

        .cd-subtitle {
          color: #475569;
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .cd-sem-card {
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .cd-sem-card:hover {
          border-color: #008080;
        }

        .cd-sem-header {
          padding: 16px 20px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
          transition: all 0.2s ease;
        }

        .cd-sem-header.active {
          background: #008080;
          color: #ffffff;
        }

        .cd-sem-header.inactive {
          background: #ffffff;
          color: #0f172a;
        }

        .cd-sem-header:hover {
          opacity: 0.95;
        }

        .cd-sem-body {
          padding: 18px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .cd-mat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          flex-wrap: wrap;
          gap: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        .cd-btn-view {
          padding: 8px 20px;
          background: #008080;
          border: none;
          color: #ffffff;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 128, 128, 0.2);
        }

        .cd-btn-view:hover {
          background: #024959;
          transform: translateY(-1px);
        }

        .cd-back-btn {
          display: inline-block;
          background: #008080;
          border: none;
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0, 128, 128, 0.3);
          transition: all 0.2s ease;
        }

        .cd-back-btn:hover {
          background: #024959;
          transform: translateY(-2px);
        }

        /* 🖼️ Glass Image Lightbox */
        .cd-img-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 15px;
          box-sizing: border-box;
        }

        .cd-img-card {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 20px;
          border-radius: 16px;
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .cd-close-btn {
          position: absolute;
          top: -12px;
          right: -12px;
          width: 36px;
          height: 36px;
          background: #024959;
          color: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cd-close-btn:hover {
          background: #ef4444;
        }
      `}</style>

      <div className="cd-wrapper">
        <div className="cd-container">
          <div className="cd-header">
            <h2 className="cd-title">
              📚 {courseId} Course Panel
            </h2>
            <p className="cd-subtitle">
              Click on any semester below to view its study material:
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {semesters.map((sem) => (
              <div key={sem} className="cd-sem-card">
                <div 
                  onClick={() => setSelectedSem(selectedSem === sem ? null : sem)} 
                  className={`cd-sem-header ${selectedSem === sem ? 'active' : 'inactive'}`}
                >
                  <span>{sem}. Sem-{sem}</span>
                  <span>{selectedSem === sem ? '▲ Hide Materials' : '▼ View Materials'}</span>
                </div>
                
                {/* Expanded Semester Content */}
                {selectedSem === sem && (
                  <div className="cd-sem-body">
                    <h4 style={{ margin: '0 0 14px 0', color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>
                      Available Materials:
                    </h4>
                    
                    {loading ? (
                      <p style={{ color: '#008080', fontWeight: '700', margin: 0, textAlign: 'center', padding: '10px' }}>
                        ⏳ Loading materials...
                      </p>
                    ) : dbMaterials.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {dbMaterials.map((mat) => (
                          <div key={mat._id || mat.id} className="cd-mat-item">
                            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                              {mat.fileType === 'pdf' ? '📄' : '🖼️'} {mat.title}
                            </span>
                            
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleViewFile(mat.fileUrl, mat.fileType, mat.title)}
                                className="cd-btn-view"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : ( 
                      <p style={{ color: '#64748b', margin: 0, fontSize: '14px', textAlign: 'center', fontWeight: '600', padding: '10px' }}>
                        No material has been uploaded yet for this semester.
                      </p> 
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 🖼️ Live Image Preview Lightbox */}
          {previewImage && (
            <div className="cd-img-overlay" onClick={() => setPreviewImage(null)}>
              <div className="cd-img-card" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setPreviewImage(null)} 
                  className="cd-close-btn"
                >
                  ✕
                </button>
                <img 
                  src={previewImage} 
                  alt="Preview Notice" 
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} 
                />
              </div>
            </div>
          )}

          {/* 🔲 In-App Pop-up PDF Modal Component */}
          <PdfModal 
            isOpen={isPdfOpen} 
            onClose={() => setIsPdfOpen(false)} 
            pdfUrl={selectedPdfUrl} 
            title={selectedPdfTitle} 
          />

          <div style={{ marginTop: '35px', textAlign: 'center' }}>
            <Link to="/dashboard" className="cd-back-btn">
              ⬅ Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetail;