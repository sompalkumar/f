import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hasError, setHasError] = useState(false);

  // 🛡️ 1. Backend Root & Broken URL Detection (Fixes X-Frame-Options sameorigin & 404)
  const isInvalidUrl = useCallback((url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return true;
    const cleanUrl = url.trim().toLowerCase();
    
    // Agar link sirf backend domain pe point kar raha ho (bina kisi file ke)
    if (
      cleanUrl === 'https://bca-35ms.onrender.com' ||
      cleanUrl === 'https://bca-35ms.onrender.com/' ||
      cleanUrl.endsWith('.onrender.com') ||
      cleanUrl.endsWith('.onrender.com/') ||
      cleanUrl.includes('/undefined') ||
      cleanUrl.includes('/null')
    ) {
      return true;
    }
    return false;
  }, []);

  const isBrokenUrl = isInvalidUrl(pdfUrl);

  // 🎥 2. YouTube Detection Helper
  const extractYouTubeId = useCallback((url) => {
    if (!url || isBrokenUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|m\.youtube\.com\/watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, [isBrokenUrl]);

  const youtubeId = extractYouTubeId(pdfUrl);
  const isYouTube = Boolean(youtubeId);

  // 📁 3. Google Drive Helpers
  const isGoogleDriveFolder = Boolean(pdfUrl && !isBrokenUrl && (pdfUrl.includes('/drive/folders/') || /\/folders\/[\w-]+/.test(pdfUrl)));

  const extractDriveFileId = useCallback((url) => {
    if (!url || isBrokenUrl || isGoogleDriveFolder) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  }, [isBrokenUrl, isGoogleDriveFolder]);

  const fileId = extractDriveFileId(pdfUrl);
  const isGoogleDriveFile = Boolean(pdfUrl && !isBrokenUrl && (pdfUrl.includes('drive.google.com') || fileId) && !isGoogleDriveFolder);

  // Reset modal state on open or URL change
  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setZoom(1);
      setHasError(false);
      setDownloading(false);
    }
  }, [isOpen, pdfUrl]);

  // 🌐 4. Safe Embed URL Generator (Direct 100% Height Preview)
  const getEmbedUrl = () => {
    if (isBrokenUrl || isGoogleDriveFolder) return '';

    if (isYouTube) {
      return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
    }

    // Google Drive official preview format (Fixes 10-15% collapse & gview errors)
    if (isGoogleDriveFile && fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return pdfUrl;
  };

  const embedUrl = getEmbedUrl();

  // 🔒 5. Safe Background Scroll & Keyboard Handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const origOverflowBody = document.body.style.overflow;
    const origOverflowDoc = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflowBody || '';
      document.documentElement.style.overflow = origOverflowDoc || '';
    };
  }, [isOpen, onClose]);

  // Actions
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleOpenLink = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectDownload = useCallback(() => {
    if (!pdfUrl || isBrokenUrl) return;
    setDownloading(true);
    const downloadLink = isGoogleDriveFile && fileId 
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : pdfUrl;

    window.open(downloadLink, '_blank', 'noopener,noreferrer');
    setDownloading(false);
  }, [pdfUrl, isBrokenUrl, isGoogleDriveFile, fileId]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        .pdf-modal-backdrop {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(2, 6, 23, 0.88) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          z-index: 2147483647 !important;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .pdf-modal-container {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 100%;
          max-width: 1350px;
          height: 94vh;
          max-height: 94vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
          position: relative;
          touch-action: auto !important;
        }

        .pdf-modal-header {
          padding: 10px 14px;
          background: #020617;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          gap: 8px;
          flex-shrink: 0;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }

        .pdf-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
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
        }

        .pdf-tool-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .pdf-close-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          transition: all 0.2s;
        }

        .pdf-close-btn:hover {
          background: #ef4444;
          color: #ffffff;
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
          overflow: hidden;
        }

        .pdf-iframe-wrapper {
          width: 100%;
          height: 100%;
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pdf-modal-iframe {
          width: 100%;
          height: 100%;
          flex: 1 1 0%;
          min-height: 0;
          border: none;
          background: #ffffff;
          display: block;
        }

        .pdf-folder-card-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .pdf-folder-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          text-align: center;
          background: #1e293b;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }

        .pdf-folder-btn {
          background: #2563eb;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 14px;
          margin-top: 16px;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .pdf-folder-btn:hover {
          background: #1d4ed8;
        }

        .yt-thumb-wrapper {
          position: relative;
          width: 100%;
          max-width: 420px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .yt-thumb-img {
          width: 100%;
          display: block;
          aspect-ratio: 16/9;
          object-fit: cover;
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Resource'}>
              {isYouTube ? '🎥 ' : isGoogleDriveFolder ? '📁 ' : '📄 '} {title || 'Resource View'}
            </h3>

            {!isGoogleDriveFolder && !isYouTube && !isBrokenUrl && (
              <div className="pdf-toolbar-controls">
                <button onClick={handleZoomOut} className="pdf-tool-btn" title="Zoom Out">➖ Out</button>
                <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', minWidth: '38px', textAlign: 'center' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={handleZoomIn} className="pdf-tool-btn" title="Zoom In">➕ In</button>
                <button onClick={handleRotate} className="pdf-tool-btn" title="Rotate">🔄 Rotate</button>
                <button onClick={handleDirectDownload} className="pdf-tool-btn" disabled={downloading} title="Download">
                  ⬇️ {downloading ? 'Wait...' : 'Download'}
                </button>
              </div>
            )}

            <button onClick={onClose} className="pdf-close-btn" aria-label="Close">✕ Close</button>
          </div>

          {/* Body */}
          <div className="pdf-modal-body">
            {isBrokenUrl || hasError ? (
              /* 🛡️ Safe Error View (Prevents X-Frame-Options: SAMEORIGIN and 404 Sad Face) */
              <div className="pdf-folder-card-wrapper">
                <div className="pdf-folder-card">
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>
                    Resource Unavailable
                  </h4>
                  <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                    This file link is missing or cannot be previewed inside the frame. Please check if the file was deleted during server restart.
                  </p>
                  {pdfUrl && !isBrokenUrl && (
                    <button onClick={handleOpenLink} className="pdf-folder-btn" style={{ background: '#475569' }}>
                      🔗 Try Opening Link Directly
                    </button>
                  )}
                </div>
              </div>
            ) : isYouTube ? (
              /* YouTube Video Card View */
              <div className="pdf-folder-card-wrapper">
                <div className="pdf-folder-card">
                  <div className="yt-thumb-wrapper">
                    <img 
                      src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} 
                      alt="YouTube Video Thumbnail" 
                      className="yt-thumb-img"
                    />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>
                    {title || 'YouTube Video Material'}
                  </h4>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                    This is a video resource. You can watch it directly on YouTube:
                  </p>
                  <button onClick={handleOpenLink} className="pdf-folder-btn" style={{ background: '#ef4444' }}>
                    ▶ Click Here to Watch Video
                  </button>
                </div>
              </div>
            ) : isGoogleDriveFolder ? (
              /* Google Drive Folder Safe Handler */
              <div className="pdf-folder-card-wrapper">
                <div className="pdf-folder-card">
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>
                    Google Drive Folder Access
                  </h4>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                    Folders cannot be embedded in frames. Open it by clicking the button below:
                  </p>
                  <button onClick={handleOpenLink} className="pdf-folder-btn">
                    📂 Open Course Materials ↗
                  </button>
                </div>
              </div>
            ) : (
              /* 100% Full Height PDF Single File Viewer */
              <div 
                className="pdf-iframe-wrapper"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <iframe 
                  src={embedUrl} 
                  title={title || 'PDF Viewer'}
                  className="pdf-modal-iframe"
                  allow="autoplay; encrypted-media; fullscreen"
                  onError={() => setHasError(true)}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

export default PdfModal;