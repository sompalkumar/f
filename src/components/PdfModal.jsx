import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1); // 🔍 Zoom Level State

  // Extract Google Drive File ID safely
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
    }
  }, [isOpen]);

  // Embed URL Generator
  const getEmbedUrl = () => {
    if (!pdfUrl) return '';
    if (isGoogleDrive && fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return pdfUrl;
  };

  const embedUrl = getEmbedUrl();

  // 🛑 BACKGROUND SCROLL LOCK & ESCAPE KEY ENGINE
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Store original styles
    const origOverflowBody = document.body.style.overflow;
    const origOverflowDoc = document.documentElement.style.overflow;
    const origTouchAction = document.body.style.touchAction;

    // Completely freeze background page scroll (Desktop + Mobile Touch)
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore background scroll on modal close
      document.body.style.overflow = origOverflowBody || '';
      document.documentElement.style.overflow = origOverflowDoc || '';
      document.body.style.touchAction = origTouchAction || '';
    };
  }, [isOpen, onClose]);

  // 🔍 ZOOM ACTIONS
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  // 🔄 ROTATION ACTION
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // 🖨️ SYSTEM PRINT ENGINE
  const handlePrint = useCallback(async () => {
    if (!pdfUrl) return;
    setPrinting(true);

    try {
      let fetchUrl = pdfUrl;
      if (isGoogleDrive && fileId) {
        fetchUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Fetch failed");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      printFrame.style.width = '0px';
      printFrame.style.height = '0px';
      printFrame.src = blobUrl;

      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setPrinting(false);

          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
            URL.revokeObjectURL(blobUrl);
          }, 3000);
        }, 500);
      };
    } catch (err) {
      console.warn("Direct print restricted, fallback preview trigger:", err);
      const fallbackUrl = isGoogleDrive && fileId 
        ? `https://drive.google.com/file/d/${fileId}/preview` 
        : pdfUrl;
        
      const tempFrame = document.createElement('iframe');
      tempFrame.style.display = 'none';
      tempFrame.src = fallbackUrl;
      document.body.appendChild(tempFrame);

      setTimeout(() => {
        try {
          tempFrame.contentWindow?.focus();
          tempFrame.contentWindow?.print();
        } catch (e) {
          window.open(fallbackUrl, '_blank');
        }
        if (document.body.contains(tempFrame)) {
          document.body.removeChild(tempFrame);
        }
        setPrinting(false);
      }, 1000);
    }
  }, [pdfUrl, isGoogleDrive, fileId]);

  // ⬇️ DIRECT FILE DOWNLOAD ENGINE
  const handleDirectDownload = useCallback(async () => {
    if (!pdfUrl) return;
    setDownloading(true);

    try {
      let downloadSource = pdfUrl;
      if (isGoogleDrive && fileId) {
        downloadSource = `https://lh3.googleusercontent.com/d/${fileId}`;
      }

      const response = await fetch(downloadSource);
      if (!response.ok) throw new Error("Download stream failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = `${title || 'Resource-Document'}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setDownloading(false);
    } catch (err) {
      console.warn("Fallback download triggered:", err);
      const downloadLink = isGoogleDrive && fileId 
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : pdfUrl;

      const hiddenIframe = document.createElement('iframe');
      hiddenIframe.style.display = 'none';
      hiddenIframe.src = downloadLink;
      document.body.appendChild(hiddenIframe);

      setTimeout(() => {
        if (document.body.contains(hiddenIframe)) {
          document.body.removeChild(hiddenIframe);
        }
        setDownloading(false);
      }, 3000);
    }
  }, [pdfUrl, fileId, title]);

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
          touch-action: none; /* Prevents touch dragging background */
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

        /* 📱 RESPONSIVE NAVBAR HEADER */
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

        /* TOOLBAR SCROLL CONTAINER */
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

        /* 🖼️ VIEWER BODY */
        .pdf-modal-body {
          flex: 1;
          width: 100%;
          height: 100%;
          background-color: #0f172a;
          position: relative;
          overflow: auto; /* Internal scrolling only */
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: pan-x pan-y; /* Allows modal internal panning */
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
        }

        /* 📱 MOBILE RESPONSIVE QUERIES */
        @media (max-width: 640px) {
          .pdf-modal-backdrop {
            padding: 4px !important;
          }
          .pdf-modal-container {
            height: 98vh;
            border-radius: 8px;
          }
          .pdf-modal-title {
            max-width: 90px;
            font-size: 12px;
          }
          .btn-label {
            display: none;
          }
          .pdf-tool-btn {
            padding: 6px 6px;
            font-size: 14px;
          }
        }

        @media (min-width: 641px) {
          .pdf-modal-title {
            max-width: 250px;
            font-size: 14px;
          }
          .pdf-tool-btn {
            padding: 6px 10px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div 
          className="pdf-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Custom Navbar Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Resource Preview'}>
              📄 {title || 'Resource Preview'}
            </h3>

            {/* Custom Responsive Toolbar Controls */}
            <div className="pdf-toolbar-controls">
              {/* Zoom Out Button */}
              <button onClick={handleZoomOut} className="pdf-tool-btn" title="Zoom Out">
                ➖ <span className="btn-label">Out</span>
              </button>

              {/* Reset Zoom Percentage Label */}
              <span className="pdf-zoom-text" onClick={handleResetZoom} title="Reset Zoom">
                {Math.round(zoom * 100)}%
              </span>

              {/* Zoom In Button */}
              <button onClick={handleZoomIn} className="pdf-tool-btn" title="Zoom In">
                ➕ <span className="btn-label">In</span>
              </button>

              <div className="pdf-divider" />

              {/* Rotate Button */}
              <button onClick={handleRotate} className="pdf-tool-btn" title="Rotate Document">
                🔄 <span className="btn-label">Rotate</span>
              </button>

              <div className="pdf-divider" />

              {/* Save to Drive Button */}
              <button onClick={handleSaveToDrive} className="pdf-tool-btn" title="Save to Google Drive">
                ☁️ <span className="btn-label">Drive</span>
              </button>

              {/* Print Button */}
              <button onClick={handlePrint} disabled={printing} className="pdf-tool-btn" title="Print PDF">
                🖨️ <span className="btn-label">{printing ? 'Preparing...' : 'Print'}</span>
              </button>

              {/* Download Button */}
              <button onClick={handleDirectDownload} disabled={downloading} className="pdf-tool-btn" title="Download PDF">
                ⬇️ <span className="btn-label">{downloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </div>

            {/* Close Button */}
            <button onClick={onClose} className="pdf-close-btn" title="Close Modal">
              ✕ <span className="btn-label">Close</span>
            </button>
          </div>

          {/* Viewer Container */}
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