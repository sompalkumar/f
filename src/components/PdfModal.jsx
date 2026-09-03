import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Extract Google Drive File ID
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
    }
  }, [isOpen]);

  // Construct Embed URL
  const getEmbedUrl = () => {
    if (!pdfUrl) return '';
    if (isGoogleDrive && fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return pdfUrl;
  };

  const embedUrl = getEmbedUrl();

  // Close on Escape & Lock Scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow || 'unset';
    };
  }, [isOpen, onClose]);

  // 🖨️ DIRECT PRINT ENGINE (Bypasses Google Drive CORS Block)
  const handlePrint = useCallback(async () => {
    if (!pdfUrl) return;
    setPrinting(true);

    try {
      let directPdfUrl = pdfUrl;
      if (isGoogleDrive && fileId) {
        directPdfUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }

      // Fetch PDF data directly and convert to Object Blob URL
      const response = await fetch(directPdfUrl);
      if (!response.ok) throw new Error("Fetch failed");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create hidden iframe dedicated to printing
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
          
          // Cleanup memory
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
            URL.revokeObjectURL(blobUrl);
          }, 2000);
        }, 500);
      };
    } catch (err) {
      console.warn("Direct blob print blocked, opening system print window:", err);
      // Fallback: Opens target URL directly in printable frame
      const win = window.open(
        isGoogleDrive && fileId ? `https://drive.google.com/file/d/${fileId}/view` : pdfUrl, 
        '_blank'
      );
      if (win) {
        win.focus();
        setTimeout(() => win.print(), 1000);
      }
      setPrinting(false);
    }
  }, [pdfUrl, isGoogleDrive, fileId]);

  // ⬇️ DIRECT DOWNLOAD ENGINE
  const handleDirectDownload = useCallback(() => {
    if (!pdfUrl) return;
    setDownloading(true);

    if (fileId) {
      const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
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

  // ☁️ SAVE TO DRIVE ACTION
  const handleSaveToDrive = () => {
    if (fileId) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
    } else {
      window.open(`https://drive.google.com/upload`, '_blank');
    }
  };

  // 🔄 ROTATION ACTION
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

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
          background: rgba(2, 6, 23, 0.95) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 16px !important;
          box-sizing: border-box !important;
          z-index: 2147483647 !important; /* Maximum possible Z-Index */
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
          gap: 12px;
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
          max-width: 250px;
        }

        .pdf-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pdf-tool-btn {
          background: transparent;
          color: #cbd5e1;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .pdf-tool-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .pdf-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 2px;
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
          overflow: hidden;
        }

        /* Pop-out shield guard overlay */
        .pdf-click-guard {
          position: absolute;
          top: 0;
          right: 0;
          width: 90px;
          height: 75px;
          background-color: transparent;
          z-index: 99999;
          cursor: not-allowed;
        }

        .pdf-modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
          transition: transform 0.2s ease;
        }
      `}</style>

      <div className="pdf-modal-backdrop" onClick={onClose}>
        <div 
          className="pdf-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Custom Navbar Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Document'}>
              📄 {title || 'Document'}
            </h3>

            {/* Custom Toolbar Controls */}
            <div className="pdf-toolbar-controls">
              <button onClick={handleRotate} className="pdf-tool-btn" title="Rotate Document">
                🔄 Rotate
              </button>

              <div className="pdf-divider" />

              <button onClick={handleSaveToDrive} className="pdf-tool-btn" title="Save to Google Drive">
                ☁️ Save to Drive
              </button>

              <button onClick={handlePrint} disabled={printing} className="pdf-tool-btn" title="Print PDF">
                {printing ? '⏳ Preparing Print...' : '🖨️ Print'}
              </button>

              <button onClick={handleDirectDownload} disabled={downloading} className="pdf-tool-btn" title="Download PDF">
                {downloading ? '⏳ Downloading...' : '⬇️ Download'}
              </button>
            </div>

            <button onClick={onClose} className="pdf-close-btn">
              ✕ Close
            </button>
          </div>

          {/* Viewer Container */}
          <div className="pdf-modal-body">
            {isGoogleDrive && (
              <div 
                className="pdf-click-guard"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            )}

            <iframe 
              src={embedUrl} 
              title="PDF Viewer"
              className="pdf-modal-iframe"
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default PdfModal;