import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
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

  // Reset controls on modal open
  useEffect(() => {
    if (isOpen) {
      setRotation(0);
    }
  }, [isOpen]);

  // Construct Clean Embed URL
  const getEmbedUrl = () => {
    if (!pdfUrl) return '';
    if (isGoogleDrive && fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return pdfUrl.includes('#') ? pdfUrl : `${pdfUrl}#toolbar=1&navpanes=1`;
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

  // 🖨️ Real Native System Print Fix
  const handlePrint = useCallback(async () => {
    if (!pdfUrl) return;
    setPrinting(true);

    try {
      let fetchUrl = pdfUrl;
      if (isGoogleDrive && fileId) {
        fetchUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }

      // Fetch PDF as Blob to create native local printable object
      const response = await fetch(fetchUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create temporary printable iframe
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0px';
      printIframe.style.height = '0px';
      printIframe.style.border = 'none';
      printIframe.src = blobUrl;

      document.body.appendChild(printIframe);

      printIframe.onload = () => {
        setTimeout(() => {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setPrinting(false);
          setTimeout(() => {
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
            URL.revokeObjectURL(blobUrl);
          }, 2000);
        }, 300);
      };
    } catch (error) {
      console.warn("Direct blob print blocked, triggering fallback window print...", error);
      // Fallback Native Print Dialog
      const printWin = window.open(
        isGoogleDrive && fileId 
          ? `https://drive.google.com/file/d/${fileId}/preview` 
          : pdfUrl, 
        '_blank'
      );
      if (printWin) {
        printWin.focus();
        setTimeout(() => {
          printWin.print();
        }, 1000);
      }
      setPrinting(false);
    }
  }, [pdfUrl, isGoogleDrive, fileId]);

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

  // 🔄 Rotation Control
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!isOpen) return null;

  // React Portal ensures the Modal renders outside normal DOM hierarchy (Over Navbar)
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
          padding: 20px !important;
          box-sizing: border-box !important;
          z-index: 2147483647 !important; /* Maximum possible CSS Z-Index */
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
          padding: 12px 18px;
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

        /* Fixed Pop-out Shield Guard */
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
          {/* Header */}
          <div className="pdf-modal-header">
            <h3 className="pdf-modal-title" title={title || 'Document'}>
              📄 {title || 'Document'}
            </h3>

            {/* Navbar Controls */}
            <div className="pdf-toolbar-controls">
              <button onClick={handleRotate} className="pdf-tool-btn" title="Rotate Document">
                🔄 Rotate
              </button>

              <div className="pdf-divider" />

              <button onClick={handleSaveToDrive} className="pdf-tool-btn" title="Save to Google Drive">
                ☁️ Save to Drive
              </button>

              <button onClick={handlePrint} disabled={printing} className="pdf-tool-btn" title="Print PDF">
                {printing ? '⏳ Opening Print...' : '🖨️ Print'}
              </button>

              <button onClick={handleDirectDownload} disabled={downloading} className="pdf-tool-btn" title="Download PDF">
                {downloading ? '⏳ Downloading...' : '⬇️ Download'}
              </button>
            </div>

            <button onClick={onClose} className="pdf-close-btn">
              ✕ Close
            </button>
          </div>

          {/* Body */}
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
              ref={iframeRef}
              src={embedUrl} 
              title="PDF Preview"
              className="pdf-modal-iframe"
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            />
          </div>
        </div>
      </div>
    </>,
    document.body // Appends directly to HTML body to overlap everything
  );
}

export default PdfModal;