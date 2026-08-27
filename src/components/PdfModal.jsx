import React from 'react';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        /* 🔲 Modal Overlay - Top Padding Navbar (60px) ke niche lane ke liye */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 75px; /* 🟢 Navbar ke niche space create karega */
          padding-bottom: 25px;
          padding-left: 15px;
          padding-right: 15px;
          box-sizing: border-box;
          z-index: 99999; /* 🟢 Z-index navbar se upar rakha gaya hai */
        }

        /* 🔲 Modal Body Container */
        .pdf-modal-container {
          background: #18181b;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          height: calc(100vh - 110px); /* 🟢 Maximum height compact rakhi hai */
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        /* 🔲 Header - Download aur Close buttons clear dikhne ke liye */
        .pdf-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: #09090b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pdf-modal-title {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-action-btn {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s ease;
        }

        .pdf-btn-download {
          background: #16a34a;
          color: #ffffff;
        }

        .pdf-btn-download:hover {
          background: #15803d;
        }

        .pdf-btn-close {
          background: #dc2626;
          color: #ffffff;
        }

        .pdf-btn-close:hover {
          background: #b91c1c;
        }

        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background: #27272a;
        }

        .pdf-modal-body iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>

      <div className="pdf-modal-overlay" onClick={onClose}>
        <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
          
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title">📄 {title || 'PDF Viewer'}</h3>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href={pdfUrl} 
                download 
                target="_blank" 
                rel="noopener noreferrer"
                className="pdf-action-btn pdf-btn-download"
              >
                ⬇ Download PDF
              </a>
              <button 
                onClick={onClose} 
                className="pdf-action-btn pdf-btn-close"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="pdf-modal-body">
            <iframe 
              src={pdfUrl} 
              title="PDF Viewer"
            />
          </div>

        </div>
      </div>
    </>
  );
}

export default PdfModal;