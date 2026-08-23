import React, { useState } from 'react';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const isGoogleDrive = pdfUrl && pdfUrl.includes('drive.google.com');

  // Embed Preview URL Generator
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let processedUrl = url;

    if (isGoogleDrive) {
      if (url.includes('/view')) {
        processedUrl = url.replace('/view', '/preview');
      } else if (!url.includes('/preview')) {
        processedUrl = `${url}/preview`;
      }
    }
    return processedUrl;
  };

  // Google Drive File ID Extractor
  const getDriveFileId = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // 🚀 DIRECT IN-APP BLOB DOWNLOAD (No New Tab Redirection)
  const handleDirectDownload = async () => {
    if (!pdfUrl) return;
    setDownloading(true);

    try {
      let downloadLink = pdfUrl;

      // Google Drive Direct Export Link Conversion
      const fileId = getDriveFileId(pdfUrl);
      if (fileId) {
        downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }

      // Fetching File as Blob to Force Direct Browser Save
      const response = await fetch(downloadLink);
      const blob = await response.blob();
      
      // Creating In-Memory Blob Object URL
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'Study_Material'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("Direct blob download restricted, executing fallback export download:", error);
      
      // Fallback Direct Download Trigger
      const fileId = getDriveFileId(pdfUrl);
      if (fileId) {
        const directExportUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        const hiddenFrame = document.createElement('iframe');
        hiddenFrame.style.display = 'none';
        hiddenFrame.src = directExportUrl;
        document.body.appendChild(hiddenFrame);
        setTimeout(() => document.body.removeChild(hiddenFrame), 6000);
      } else {
        window.location.href = pdfUrl;
      }
    } finally {
      setDownloading(false);
    }
  };

  const embedUrl = getEmbedUrl(pdfUrl);

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
      {/* Modal Container */}
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
        {/* Header Section */}
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
            
            {/* Direct In-App Download Button */}
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

            {/* Close Button */}
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
          
          {/* Pop-Out Arrow Protection Blocker */}
          {isGoogleDrive && (
            <div 
              title="External redirect is disabled for security"
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                width: '70px',
                height: '70px',
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

          {/* PDF View Iframe */}
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