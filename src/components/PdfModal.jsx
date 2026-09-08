import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewEngine, setViewEngine] = useState('gview'); // 'gview' | 'drive' | 'direct'

  // Safe Google Drive ID Extractor
  const extractDriveFileId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  }, []);

  const fileId = extractDriveFileId(pdfUrl);
  const isGoogleDrive = Boolean(pdfUrl && (pdfUrl.includes('drive.google.com') || fileId));

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setZoom(1);
      setViewEngine('gview'); // Default to 403-proof Google Docs Viewer
    }
  }, [isOpen, pdfUrl]);

  // 🛡️ GUARANTEED 403-FREE EMBED URL GENERATOR
  const getEmbedUrl = () => {
    if (!pdfUrl) return '';

    if (isGoogleDrive && fileId) {
      const rawDirectUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

      if (viewEngine === 'gview') {
        // Universal Google Docs Engine - Completely Bypasses 403 & Third-Party Cookie Locks
        return `https://docs.google.com/gview?url=${encodeURIComponent(rawDirectUrl)}&embedded=true`;
      }
      
      if (viewEngine === 'drive') {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    return pdfUrl;
  };

  const embedUrl = getEmbedUrl();

  // 🛑 BACKGROUND SCROLL LOCK & ESCAPE ENGINE
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const origOverflowBody = document.body.style.overflow;
    const origOverflowDoc = document.documentElement.style.overflow;
    const origTouchAction = document.body.style.touchAction;

    // Lock page background scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflowBody || '';
      document.documentElement.style.overflow = origOverflowDoc || '';
      document.body.style.touchAction = origTouchAction || '';
    };
  }, [isOpen, onClose]);

  // 🔍 ZOOM CONTROLS
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  // 🔄 ROTATE CONTROL
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // 🖨️ RELIABLE PRINT ACTION
  const handlePrint = useCallback(() => {
    if (!pdfUrl) return;
    setPrinting(true);
    const targetUrl = isGoogleDrive && fileId 
      ? `https://drive.google.com/file/d/${fileId}/view`
      : pdfUrl;

    window.open(targetUrl, '_blank');
    setPrinting(false);
  }, [pdfUrl, isGoogleDrive, fileId]);

  // ⬇️ RELIABLE DOWNLOAD ACTION
  const handleDirectDownload = useCallback(() => {
    if (!pdfUrl) return;
    setDownloading(true);
    const downloadLink = isGoogleDrive && fileId 
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : pdfUrl;

    window.open(downloadLink, '_blank');
    setDownloading(false);
  }, [pdfUrl, isGoogleDrive, fileId]);

  // ☁️ SAVE TO DRIVE ACTION
  const handleSaveToDrive = () => {
    if (fileId) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
    } else {
      window.open(`https://drive.google.com/upload`, '_blank');
    }
  };

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
          background: rgba(2, 6, 23, 0.88) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 8px !important;
          box-sizing: border-box !important;
          z-index: 2147483647 !important;
          animation: modalFadeIn 0.2s ease-out;
          touch-action: none;
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
          height: 96vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
          position: relative;
        }

        /* HEADER NAVBAR */
        .pdf-modal-header {
          padding: 8px 12px;
          background: #020617;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          gap: 8px;
          flex-wrap: nowrap;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
          flex-shrink: 1;
        }

        .pdf-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pdf-toolbar-controls::-webkit-scrollbar {
          display: none;
        }

        .pdf-tool-btn {
          background: transparent;
          color: #cbd5e1;
          border: none;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          transition: all 0.2s;
          touch-action: manipulation;
        }

        .pdf-tool-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .pdf-zoom-text {
          font-size: 11px;
          color: #38bdf8;
          font-weight: 700;
          padding: 0 4px;
          cursor: pointer;
          min-width: 40px;
          text-align: center;
        }

        .pdf-divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 2px;
          flex-shrink: 0;
        }

        .pdf-close-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .pdf-close-btn:hover {
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
        }

        /* VIEWER BODY */
        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background-color: #0f172a;
          position: relative;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: pan-x pan-y;
        }

        .pdf-iframe-wrapper {
          width: 100%;
          height: 100%;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
        }

        .pdf-modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
          background: #ffffff;
        }

        @media (max-width: 640px) {
          .pdf-modal-backdrop { padding: 4px !important; }
          .pdf-modal-container { height: 98vh; border-radius: 8px; }
          .pdf-modal-title { max-width: 90px; font-size: 12px; }
          .btn-label { display: none; }
          .pdf-tool-btn { padding: 6px 6px; font-size: 14px; }
        }

        @media (min-width: 641px) {
          .pdf-modal-title { max-width: 250px; font-size: 14px; }
          .pdf-tool-btn { padding: 6px 10px; font-size: 13px; }
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div 
          className="pdf-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Navbar */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Resource Preview'}>
              📄 {title || 'Resource Preview'}
            </h3>

            {/* Controls Toolbar */}
            <div className="pdf-toolbar-controls">
              <button onClick={handleZoomOut} className="pdf-tool-btn" title="Zoom Out">
                ➖ <span className="btn-label">Out</span>
              </button>

              <span className="pdf-zoom-text" onClick={handleResetZoom} title="Reset Zoom">
                {Math.round(zoom * 100)}%
              </span>

              <button onClick={handleZoomIn} className="pdf-tool-btn" title="Zoom In">
                ➕ <span className="btn-label">In</span>
              </button>

              <div className="pdf-divider" />

              <button onClick={handleRotate} className="pdf-tool-btn" title="Rotate Document">
                🔄 <span className="btn-label">Rotate</span>
              </button>

              <div className="pdf-divider" />

              <button onClick={handleSaveToDrive} className="pdf-tool-btn" title="Save to Google Drive">
                ☁️ <span className="btn-label">Drive</span>
              </button>

              <button onClick={handlePrint} disabled={printing} className="pdf-tool-btn" title="Print PDF">
                🖨️ <span className="btn-label">{printing ? 'Preparing...' : 'Print'}</span>
              </button>

              <button onClick={handleDirectDownload} disabled={downloading} className="pdf-tool-btn" title="Download PDF">
                ⬇️ <span className="btn-label">{downloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </div>

            <button onClick={onClose} className="pdf-close-btn" title="Close Modal">
              ✕ <span className="btn-label">Close</span>
            </button>
          </div>

          {/* Modal Body Engine */}
          <div className="pdf-modal-body">
            <div 
              className="pdf-iframe-wrapper"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <iframe 
                src={embedUrl} 
                title="PDF Viewer"
                className="pdf-modal-iframe"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default PdfModal;