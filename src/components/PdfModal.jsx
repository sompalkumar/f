import React, { useState, useEffect, useCallback, useRef } from 'react';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const iframeRef = useRef(null);

  // 🔍 Extract Google Drive File ID safely
  const extractDriveFileId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  }, []);

  const fileId = extractDriveFileId(pdfUrl);
  const isGoogleDrive = Boolean(pdfUrl && (pdfUrl.includes('drive.google.com') || fileId));

  // 🛠 Reset controls on modal open
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen]);

  // 🛠 Construct Clean Embed URL
  const getEmbedUrl = () => {
    if (!pdfUrl) return '';
    if (isGoogleDrive && fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return pdfUrl.includes('#') ? pdfUrl : `${pdfUrl}#toolbar=1&navpanes=1`;
  };

  const embedUrl = getEmbedUrl();

  // ⌨️ Close Modal on 'Escape' key press & Strict Background Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow || 'unset';
      document.documentElement.style.overflow = originalHtmlOverflow || 'unset';
      document.body.style.touchAction = originalTouchAction || 'auto';
    };
  }, [isOpen, onClose]);

  // 🖨️ Direct Print Functionality
  const handlePrint = useCallback(async () => {
    if (!pdfUrl) return;
    setPrinting(true);

    try {
      let printSource = pdfUrl;
      if (fileId) {
        printSource = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }

      // Fetch PDF binary blob to bypass cross-origin restrictions
      const response = await fetch(printSource);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const printFrame = document.createElement('iframe');
      printFrame.style.display = 'none';
      printFrame.src = blobUrl;
      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setPrinting(false);
        }, 500);
      };
    } catch (error) {
      console.error("Direct print error, falling back to window print:", error);
      // Fallback if CORS blocks direct fetch
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.print();
      } else {
        window.open(pdfUrl, '_blank');
      }
      setPrinting(false);
    }
  }, [pdfUrl, fileId]);

  // ⬇️ Direct In-App Download Function
  const handleDirectDownload = useCallback(() => {
    if (!pdfUrl) return;
    setDownloading(true);

    if (fileId) {
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

  // ☁️ Save to Google Drive Action
  const handleSaveToDrive = () => {
    if (fileId) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
    } else {
      window.open(`https://drive.google.com/upload`, '_blank');
    }
  };

  // 🔍 Zoom & Rotate Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
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
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          z-index: 99999;
          animation: modalFadeIn 0.25s ease-out;
          overscroll-behavior: contain;
          touch-action: pan-y;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pdf-modal-container {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          width: 100%;
          max-width: 1250px;
          height: 92vh;
          border-radius: 16px;
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

        /* Toolbar Styling like PDF Viewer */
        .pdf-modal-header {
          padding: 10px 16px;
          background: #0f172a;
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
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
          font-family: 'Inter', -apple-system, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .pdf-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .pdf-tool-btn {
          background: transparent;
          color: #cbd5e1;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .pdf-tool-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .pdf-zoom-label {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          min-width: 42px;
          text-align: center;
        }

        .pdf-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 4px;
        }

        .pdf-close-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 6px 14px;
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
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pdf-modal-iframe-wrapper {
          width: 100%;
          height: 100%;
          transition: transform 0.2s ease-out;
        }

        .pdf-modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        @media screen and (max-width: 768px) {
          .pdf-modal-header {
            padding: 8px;
          }
          .pdf-modal-title {
            display: none;
          }
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div 
          className="pdf-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Toolbar Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Document'}>
              📄 {title || 'Document'}
            </h3>

            {/* Central Toolbar Actions (Zoom, Rotate, Print, Drive, Download) */}
            <div className="pdf-toolbar-controls">
              <button onClick={handleZoomOut} className="pdf-tool-btn" title="Zoom Out">
                ➖
              </button>
              <span className="pdf-zoom-label">{zoom}%</span>
              <button onClick={handleZoomIn} className="pdf-tool-btn" title="Zoom In">
                ➕
              </button>

              <div className="pdf-divider" />

              <button onClick={handleRotate} className="pdf-tool-btn" title="Rotate Document">
                🔄 Rotate
              </button>

              <div className="pdf-divider" />

              <button onClick={handleSaveToDrive} className="pdf-tool-btn" title="Save to Google Drive">
                ☁️ Save to Drive
              </button>

              <button onClick={handlePrint} disabled={printing} className="pdf-tool-btn" title="Print PDF">
                {printing ? '⏳ Printing...' : '🖨️ Print'}
              </button>

              <button onClick={handleDirectDownload} disabled={downloading} className="pdf-tool-btn" title="Download PDF">
                {downloading ? '⏳ ...' : '⬇️ Download'}
              </button>
            </div>

            <button onClick={onClose} className="pdf-close-btn">
              ✕ Close
            </button>
          </div>

          {/* Modal Body */}
          <div className="pdf-modal-body">
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

            <div 
              className="pdf-modal-iframe-wrapper"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <iframe 
                ref={iframeRef}
                src={embedUrl} 
                title="PDF Preview"
                className="pdf-modal-iframe"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PdfModal;