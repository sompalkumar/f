import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  // 1. YouTube Detection Helper
  const extractYouTubeId = useCallback((url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const youtubeId = extractYouTubeId(pdfUrl);
  const isYouTube = Boolean(youtubeId);

  // 2. Google Drive Helpers
  const isGoogleDriveFolder = Boolean(pdfUrl && pdfUrl.includes('/drive/folders/'));

  const extractDriveFileId = useCallback((url) => {
    if (!url || isGoogleDriveFolder) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  }, [isGoogleDriveFolder]);

  const fileId = extractDriveFileId(pdfUrl);
  const isGoogleDriveFile = Boolean(pdfUrl && (pdfUrl.includes('drive.google.com') || fileId) && !isGoogleDriveFolder);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setZoom(1);
    }
  }, [isOpen, pdfUrl]);

  // 3. Safe URL Generator
  const getEmbedUrl = () => {
    if (!pdfUrl || isGoogleDriveFolder) return '';

    if (isYouTube) {
      return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`;
    }

    if (isGoogleDriveFile && fileId) {
      const rawDirectUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
      return `https://docs.google.com/gview?url=${encodeURIComponent(rawDirectUrl)}&embedded=true`;
    }

    return pdfUrl;
  };

  const embedUrl = getEmbedUrl();

  // 4. Lock Background Scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const origOverflowBody = document.body.style.overflow;
    const origOverflowDoc = document.documentElement.style.overflow;
    const origTouchAction = document.body.style.touchAction;

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

  // Actions
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleOpenLink = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectDownload = useCallback(() => {
    if (!pdfUrl) return;
    setDownloading(true);
    const downloadLink = isGoogleDriveFile && fileId 
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : pdfUrl;

    window.open(downloadLink, '_blank');
    setDownloading(false);
  }, [pdfUrl, isGoogleDriveFile, fileId]);

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

        .pdf-modal-header {
          padding: 8px 12px;
          background: #020617;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          gap: 8px;
        }

        .pdf-modal-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .pdf-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 8px;
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
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
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
          display: flex;
          align-items: center;
          justify-content: center;
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
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          margin: 16px;
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
          display: flex;
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

        .pdf-iframe-wrapper {
          width: 100%;
          height: 100%;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pdf-modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: #ffffff;
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Resource'}>
              {isYouTube ? '🎥 ' : '📄 '} {title || 'Resource View'}
            </h3>

            {!isGoogleDriveFolder && !isYouTube && (
              <div className="pdf-toolbar-controls">
                <button onClick={handleZoomOut} className="pdf-tool-btn">➖ Out</button>
                <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={handleZoomIn} className="pdf-tool-btn">➕ In</button>
                <button onClick={handleRotate} className="pdf-tool-btn">🔄 Rotate</button>
                <button onClick={handleDirectDownload} className="pdf-tool-btn">⬇️ Download</button>
              </div>
            )}

            <button onClick={onClose} className="pdf-close-btn">✕ Close</button>
          </div>

          {/* Body */}
          <div className="pdf-modal-body">
            {isYouTube ? (
              /* YouTube Video Card / Embed View */
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
                  This is a video resource. You can watch it directly on YouTube by clicking the button below:
                </p>
                <button onClick={handleOpenLink} className="pdf-folder-btn" style={{ background: '#ef4444' }}>
                  ▶ Click Here to Watch Video
                </button>
              </div>
            ) : isGoogleDriveFolder ? (
              /* Google Drive Folder Safe Handler */
              <div className="pdf-folder-card">
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>
                  Google Drive Folder Access
                </h4>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Open it by clicking the button below:

                </p>
                <button onClick={handleOpenLink} className="pdf-folder-btn">
                  📂 Open Course Materials ↗
                </button>
              </div>
            ) : (
              /* PDF Single File Viewer */
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
            )}
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

export default PdfModal;