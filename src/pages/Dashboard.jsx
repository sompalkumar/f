import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // 🟢 State for Popup PDF Modal
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');

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
    }
  }, [isLoggedIn, token, navigate]);

  // Courses List
  const courses = [
    { id: 'bca', name: '💻 BCA (Bachelor of Computer Applications)' },
    { id: 'bcom', name: '📊 B.Com (Bachelor of Commerce)' },
    { id: 'arts', name: '🎨 Arts (Bachelor of Arts)' },
    { id: 'science', name: '🔬 Science (Bachelor of Science)' }
  ];

  // 📄 Sample PDF List (यहाँ अपनी Drive Preview लिंक्स पेस्ट करें)
  const pdfList = [
    {
      id: 1,
      title: '📘 BCA Semester 1 Syllabus Notes',
      // ध्यान दें: ड्राइव की लिंक के आख़िर में /preview होना चाहिए
      driveUrl: 'https://drive.google.com/file/d/1ABC123xyz_SampleID/preview'
    }
  ];

  // PDF Pop-up खोलने के लिए फंक्शन
  const openPdfModal = (url, title) => {
    setCurrentPdfUrl(url);
    setCurrentPdfTitle(title);
    setIsPdfOpen(true);
  };

  // PDF Pop-up बंद करने के लिए फंक्शन
  const closePdfModal = () => {
    setIsPdfOpen(false);
    setCurrentPdfUrl('');
    setCurrentPdfTitle('');
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

        /* 🔲 Pop-up Modal Styling */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 10px;
          box-sizing: border-box;
        }

        .pdf-modal-container {
          background-color: #ffffff;
          width: 100%;
          max-width: 900px;
          height: 85vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .pdf-modal-header {
          padding: 12px 20px;
          background-color: #1a1a1a;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-modal-close-btn {
          background-color: #ff4d4d;
          color: #fff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .pdf-modal-close-btn:hover {
          background-color: #cc0000;
        }

        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background-color: #f4f4f4;
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
            height: 92vh;
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

        {/* 📄 PDF Demo Section (आप इसे जहाँ चाहें वहाँ उपयोग कर सकते हैं) */}
        {pdfList.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333' }}>Quick Study Material (PDFs)</h3>
            <div className="db-grid">
              {pdfList.map((pdf) => (
                <div key={pdf.id} className="db-card">
                  <h3 className="db-card-title">{pdf.title}</h3>
                  <button 
                    onClick={() => openPdfModal(pdf.driveUrl, pdf.title)}
                    className="db-button"
                    style={{ backgroundColor: '#333', color: '#fff' }}
                  >
                    View PDF 👁️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔲 Iframe PDF Pop-up Modal */}
      {isPdfOpen && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-container">
            <div className="pdf-modal-header">
              <h3 className="pdf-modal-title">{currentPdfTitle}</h3>
              <button onClick={closePdfModal} className="pdf-modal-close-btn">
                ✕ Close
              </button>
            </div>
            <div className="pdf-modal-body">
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
