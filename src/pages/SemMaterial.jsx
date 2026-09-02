import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

// 🌐 Centralized Backend Base URL
import { API_BASE_URL } from '../config'; 

// 🔲 In-App PDF Pop-up Modal Import
import PdfModal from '../components/PdfModal';

function SemMaterial() {
  const { courseId = '', semId = '' } = useParams();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Modal Controls State
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState('');

  // 📚 Static Fallback Data (Memoized to prevent unnecessary re-creations)
  const localFallbackData = useMemo(() => ({
    bca: {
      1: [
        { id: 1, title: 'C Programming Complete Notes', fileName: 'c_notes.pdf', size: '2.5 MB' },
        { id: 2, title: 'Computer Fundamentals Syllabus', fileName: 'cf_syllabus.pdf', size: '1.1 MB' },
        { id: 3, title: 'Previous Year Question Paper (2023)', fileName: 'pyq_2023.pdf', size: '4.0 MB' }
      ],
      2: [
        { id: 1, title: 'Data Structures & Algorithms Notes', fileName: 'dsa_notes.pdf', size: '3.8 MB' },
        { id: 2, title: 'C++ Object Oriented Programming', fileName: 'cpp_oops.pdf', size: '2.9 MB' }
      ]
    }
  }), []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchMaterials = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/materials/${courseId}/${semId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            if (isMounted) {
              setMaterials(data);
              setLoading(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Backend materials fetch failed, using fallback data:', err);
      }

      // 🔄 Fallback Data Handling
      const safeCourse = courseId.toLowerCase();
      const fallback = localFallbackData[safeCourse]?.[semId] || [
        { id: 1, title: `Syllabus Sem ${semId}`, fileName: `Syllabus_Sem_${semId}.pdf`, size: '1.5 MB' },
        { id: 2, title: 'Previous Year Question Papers', fileName: 'Previous_Year_Question_Papers.pdf', size: '3.2 MB' },
        { id: 3, title: 'Important Questions & Notes', fileName: 'Notes_Subject_1.pdf', size: '2.0 MB' }
      ];

      if (isMounted) {
        setMaterials(fallback);
        setLoading(false);
      }
    };

    fetchMaterials();

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [courseId, semId, localFallbackData]);

  // Target PDF URL Resolve karne ke liye Helper Function
  const getPdfUrl = useCallback((file) => {
    if (file.driveUrl) return file.driveUrl;
    if (file.fileUrl) return file.fileUrl;
    if (file.fileName && file.fileName.startsWith('http')) return file.fileName;
    return `${API_BASE_URL}/uploads/${file.fileName}`;
  }, []);

  // PDF Popup Open karne ke liye Handler
  const handleViewPdf = useCallback((file) => {
    const targetUrl = getPdfUrl(file);
    setSelectedPdfUrl(targetUrl);
    setSelectedPdfTitle(file.title);
    setIsPdfOpen(true);
  }, [getPdfUrl]);

  return (
    <>
      <style>{`
        /* Animated Gradient Background */
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

        .sm-container {
          padding: clamp(20px, 4vw, 35px);
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          box-sizing: border-box;
          color: #f8fafc;
        }

        /* Glassmorphic Header Card */
        .sm-header {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: clamp(18px, 3vw, 25px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          margin-bottom: 25px;
        }

        .sm-title {
          text-transform: uppercase;
          margin: 0 0 8px 0;
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 800;
          background: linear-gradient(135deg, #10b981, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sm-desc {
          color: #94a3b8;
          margin: 0;
          font-size: clamp(13px, 2.5vw, 14.5px);
          line-height: 1.5;
        }

        /* Materials Card Section */
        .sm-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          padding: clamp(20px, 4vw, 30px);
        }

        .sm-card-title {
          margin-top: 0;
          color: #ffffff;
          font-size: clamp(17px, 3.5vw, 20px);
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sm-file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          flex-wrap: wrap;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .sm-file-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(16, 185, 129, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .sm-file-title {
          font-weight: 700;
          color: #f1f5f9;
          font-size: 15px;
        }

        .sm-file-meta {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Modern 3D View Button */
        .sm-view-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 13.5px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 15px rgba(16, 185, 129, 0.25);
        }

        .sm-view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #34d399, #10b981);
        }

        /* Navigation Links */
        .sm-nav-group {
          margin-top: 30px;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .sm-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .sm-link-primary {
          color: #38bdf8;
        }

        .sm-link-primary:hover {
          color: #7dd3fc;
          transform: translateX(-3px);
        }

        .sm-link-secondary {
          color: #94a3b8;
        }

        .sm-link-secondary:hover {
          color: #cbd5e1;
          transform: translateX(-3px);
        }

        @media screen and (max-width: 600px) {
          .sm-file-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .sm-view-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="sm-container">
        
        {/* Header Section */}
        <div className="sm-header">
          <h2 className="sm-title">
            📚 {courseId?.toUpperCase() || 'COURSE'} — Semester {semId}
          </h2>
          <p className="sm-desc">
            इस सेमेस्टर के सभी आधिकारिक नोट्स, बुक्स और स्टडी फाइल्स नीचे से आसानी से डाउनलोड करें।
          </p>
        </div>

        {/* Materials List Container */}
        <div className="sm-card">
          <h3 className="sm-card-title">
            📄 Study Files & Downloads
          </h3>

          {/* Loading Indicator */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>
              ⏳ Loading study materials...
            </div>
          ) : materials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {materials.map((file) => (
                <div 
                  key={file._id || file.id} 
                  className="sm-file-item"
                >
                  <div>
                    <div className="sm-file-title">{file.title}</div>
                    <div className="sm-file-meta">
                      File: {file.fileName || 'Document'} {file.size ? `| Size: ${file.size}` : ''}
                    </div>
                  </div>

                  {/* In-App PDF View Button */}
                  <button 
                    onClick={() => handleViewPdf(file)}
                    className="sm-view-btn"
                  >
                    👁️ View PDF
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>
              इस सेमेस्टर के लिए फिलहाल कोई स्टडी मटेरियल उपलब्ध नहीं है।
            </p>
          )}
        </div>

        {/* Navigation Links */}
        <div className="sm-nav-group">
          <Link 
            to={`/course/${courseId}`} 
            className="sm-link-btn sm-link-primary"
          >
            ⬅ Back to Semesters
          </Link>
          <Link 
            to="/dashboard" 
            className="sm-link-btn sm-link-secondary"
          >
            🏠 Main Dashboard
          </Link>
        </div>

        {/* 🔲 In-App Pop-up PDF Modal Component */}
        <PdfModal 
          isOpen={isPdfOpen} 
          onClose={() => setIsPdfOpen(false)} 
          pdfUrl={selectedPdfUrl} 
          title={selectedPdfTitle} 
        />

      </div>
    </>
  );
}

export default SemMaterial;