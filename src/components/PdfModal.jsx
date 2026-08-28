import React, { useState, useEffect, useCallback } from 'react';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);

  // 🔍 Extract Google Drive File ID safely using Regex
  const extractDriveFileId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  }, []);

  const fileId = extractDriveFileId(pdfUrl);
  const isGoogleDrive = Boolean(pdfUrl && (pdfUrl.includes('drive.google.com') || fileId));

  // 🛠 Construct Clean Embed URL
  const embedUrl = isGoogleDrive && fileId 
    ? `https://drive.google.com/file/d/${fileId}/preview` 
    : pdfUrl;

  // ⌨️ Close Modal on 'Escape' key press & Manage Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Stop background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Restore background scrolling
    };
  }, [isOpen, onClose]);

  // ⬇️ Direct In-App Download Function
  const handleDirectDownload = useCallback(() => {
    if (!pdfUrl) return;
    setDownloading(true);

    if (fileId) {
      // Direct Export Endpoint
      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const hiddenIframe = document.createElement('iframe');
      hiddenIframe.style.display = 'none';
      hiddenIframe.src = directDownloadUrl;
      document.body.appendChild(hiddenIframe);

      setTimeout(() => {
        if (document.body.contains(hiddenIframe)) {
          document.body.removeChild(hiddenIframe);
        }
        setDownloading(false);
      }, 3000);
    } else {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${title || 'Document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloading(false);
    }
  }, [pdfUrl, fileId, title]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        /* Modal Backdrop - Navbar overlapping prevented */
        .pdf-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 80px;
          padding-bottom: 20px;
          padding-left: clamp(10px, 2vw, 20px);
          padding-right: clamp(10px, 2vw, 20px);
          box-sizing: border-box;
          z-index: 99999;
          animation: modalFadeIn 0.25s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Container height adjusted for screen bounds */
        .pdf-modal-container {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          width: 100%;
          max-width: 1200px;
          height: calc(100vh - 100px);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          position: relative;
          animation: modalZoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalZoomIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Header Styling */
        .pdf-modal-header {
          padding: 14px 20px;
          background: rgba(15, 23, 42, 0.9);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: clamp(14px, 2.5vw, 16px);
          font-weight: 700;
          background: linear-gradient(135deg, #38bdf8, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60%;
        }

        .pdf-btn-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pdf-download-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .pdf-download-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #34d399, #10b981);
        }

        .pdf-download-btn:disabled {
          background: #475569;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .pdf-close-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .pdf-close-btn:hover {
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        @media screen and (max-width: 600px) {
          .pdf-modal-backdrop {
            padding-top: 70px;
          }
          .pdf-modal-title {
            max-width: 100%;
          }
          .pdf-btn-group {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div 
          className="pdf-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">{/* Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */}<path fill="#fa0505" d="M96 0C60.7 0 32 28.7 32 64l0 384c0 35.3 28.7 64 64 64l80 0 0-112c0-35.3 28.7-64 64-64l176 0 0-165.5c0-17-6.7-33.3-18.7-45.3L290.7 18.7C278.7 6.7 262.5 0 245.5 0L96 0zM357.5 176L264 176c-13.3 0-24-10.7-24-24L240 58.5 357.5 176zM240 380c-11 0-20 9-20 20l0 128c0 11 9 20 20 20s20-9 20-20l0-28 12 0c33.1 0 60-26.9 60-60s-26.9-60-60-60l-32 0zm32 80l-12 0 0-40 12 0c11 0 20 9 20 20s-9 20-20 20zm96-80c-11 0-20 9-20 20l0 128c0 11 9 20 20 20l32 0c28.7 0 52-23.3 52-52l0-64c0-28.7-23.3-52-52-52l-32 0zm20 128l0-88 12 0c6.6 0 12 5.4 12 12l0 64c0 6.6-5.4 12-12 12l-12 0zm88-108l0 128c0 11 9 20 20 20s20-9 20-20l0-44 28 0c11 0 20-9 20-20s-9-20-20-20l-28 0 0-24 28 0c11 0 20-9 20-20s-9-20-20-20l-48 0c-11 0-20 9-20 20z"/></svg> {title || 'PDF Preview'}
            </h3>
            <div className="pdf-btn-group">
              <button 
                onClick={handleDirectDownload} 
                disabled={downloading}
                className="pdf-download-btn"
              >
                {downloading ? '⏳ Downloading...' : '⬇ Download PDF'}
              </button>

              <button 
                onClick={onClose}
                className="pdf-close-btn"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden' }}>
            
            {/* Top-Right Arrow Click Guard (Protects External Popout Navigation) */}
            {isGoogleDrive && (
              <div 
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  width: '75px',
                  height: '75px',
                  backgroundColor: 'transparent',
                  zIndex: 9999,
                  cursor: 'not-allowed'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            )}

            <iframe 
              src={embedUrl} 
              title="PDF Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PdfModal;