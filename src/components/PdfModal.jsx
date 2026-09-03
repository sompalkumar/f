import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  // Extract Google Drive File ID safely
  const extractDriveFileId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  };

  const fileId = extractDriveFileId(pdfUrl);

  // Construct Google Drive Embedded Viewer URL with Native Toolbar (Print, Download, Drive)
  const getEmbedUrl = () => {
    if (!pdfUrl) return '';
    if (fileId) {
      // Viewer mode enables native print & drive controls inside toolbar
      return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
    }
    return pdfUrl;
  };

  const embedUrl = getEmbedUrl();

  // Close Modal on 'Escape' key press & Strict Background Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow || 'unset';
      document.documentElement.style.overflow = originalHtmlOverflow || 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        .pdf-modal-backdrop {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(2, 6, 23, 0.94) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 16px !important;
          box-sizing: border-box !important;
          z-index: 2147483647 !important;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pdf-modal-container {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 100%;
          max-width: 1300px;
          height: 94vh;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
          position: relative;
        }

        .pdf-modal-header {
          padding: 10px 18px;
          background: #020617;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-close-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 6px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s;
        }

        .pdf-close-btn:hover {
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
        }

        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background-color: #0f172a;
          position: relative;
        }

        .pdf-modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div 
          className="pdf-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Document'}>
              📄 {title || 'Document'}
            </h3>

            <button onClick={onClose} className="pdf-close-btn">
              ✕ Close
            </button>
          </div>

          {/* Body with Embedded Viewer */}
          <div className="pdf-modal-body">
            <iframe 
              src={embedUrl} 
              title="PDF Viewer"
              className="pdf-modal-iframe"
              allow="autoplay"
            />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default PdfModal;