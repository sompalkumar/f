import React from 'react';

function PdfModal({ isOpen, onClose, pdfUrl, title }) {
  if (!isOpen) return null;

  // Google Drive preview URL ko auto-fit zoom format me process karna
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let processedUrl = url;

    // Google Drive URL handling
    if (url.includes('drive.google.com')) {
      if (url.includes('/view')) {
        processedUrl = url.replace('/view', '/preview');
      } else if (!url.includes('/preview')) {
        processedUrl = `${url}/preview`;
      }
    }
    
    return processedUrl;
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
      {/* Modal Container - 90% Screen Width & Height */}
      <div 
        style={{
          backgroundColor: '#1e1e1e',
          width: '95%',
          maxWidth: '1100px',
          height: '92vh',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '12px 20px',
            backgroundColor: '#2a2a2a',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #333'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#06dfd1' }}>
            📄 {title || 'PDF Preview'}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {pdfUrl && (
              <a 
                href={pdfUrl} 
                download 
                target="_blank" 
                rel="noreferrer"
                style={{
                  backgroundColor: '#06dfd1',
                  color: '#000',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                ⬇ Download PDF
              </a>
            )}
            <button 
              onClick={onClose}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
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

        {/* Modal Body - Full Viewport Iframe */}
        <div style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#525659', position: 'relative' }}>
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