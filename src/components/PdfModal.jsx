import React, { useState } from 'react';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  // 🔍 Extract Google Drive File ID safely using Regex
  const extractDriveFileId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:d\/|id=|file\/d\/|src=)([\w-]{25,})/);
    return match ? match[1] : null;
  };

  const fileId = extractDriveFileId(pdfUrl);
  const isGoogleDrive = Boolean(pdfUrl && (pdfUrl.includes('drive.google.com') || fileId));

  // 🛠 Construct Clean Embed URL
  const embedUrl = isGoogleDrive && fileId 
    ? `https://drive.google.com/file/d/${fileId}/preview` 
    : pdfUrl;

  // ⬇️ Direct In-App Download Function (No External Redirects)
  const handleDirectDownload = () => {
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
        document.body.removeChild(hiddenIframe);
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
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        padding: '10px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1e1e1e',
          width: '95%',
          maxWidth: '1200px',
          height: '94vh',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            padding: '12px 20px',
            backgroundColor: '#2a2a2a',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #333',
            zIndex: 10
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#06dfd1' }}>
            📄 {title || 'PDF Preview'}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleDirectDownload} 
              disabled={downloading}
              style={{
                backgroundColor: downloading ? '#888' : '#06dfd1',
                color: '#000',
                padding: '7px 15px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: downloading ? 'not-allowed' : 'pointer'
              }}
            >
              {downloading ? '⏳ Downloading...' : '⬇ Download PDF'}
            </button>

            <button 
              onClick={onClose}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '7px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#525659', position: 'relative', overflow: 'hidden' }}>
          
          {/* Top-Right Arrow Click Guard (Protects Admin Identity) */}
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
  );
}

export default PdfModal;