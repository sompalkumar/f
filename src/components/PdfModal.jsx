import React from 'react';

const PdfModal = ({ isOpen, onClose, pdfUrl, title }) => {
  if (!isOpen) return null;

  // 1. Google Drive Preview Link Auto-Formatter
  let formattedUrl = pdfUrl || '';
  if (formattedUrl.includes('drive.google.com')) {
    if (formattedUrl.includes('/view')) {
      formattedUrl = formattedUrl.replace(/\/view.*$/, '/preview');
    } else if (!formattedUrl.endsWith('/preview')) {
      formattedUrl = `${formattedUrl.replace(/\/$/, '')}/preview`;
    }
  }

  // 2. Direct Download Link Generator
  const getDownloadUrl = (url) => {
    if (!url) return '#';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header containing Title, Download, and Close Buttons */}
        <div style={styles.header}>
          <h3 style={styles.titleText}>{title || "PDF Viewer"}</h3>
          <div style={styles.headerActions}>
            {/* Direct Download Button */}
            <a 
              href={getDownloadUrl(pdfUrl)} 
              target="_blank" 
              rel="noopener noreferrer" 
              download
              style={styles.downloadBtn}
            >
              ⬇️ Download PDF
            </a>
            <button onClick={onClose} style={styles.closeBtn}>✕ Close</button>
          </div>
        </div>

        {/* Modal Body containing Security Overlay and Iframe */}
        <div style={styles.body}>
          {/* 🛡️ SECURITY FIX: Top-Right Pop-out Arrow Blocker */}
          <div 
            style={styles.securityBlocker} 
            title="External tab redirect is disabled for security."
          />

          <iframe
            src={formattedUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="PDF Preview"
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

// CSS Styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '10px',
    boxSizing: 'border-box',
  },
  modal: {
    backgroundColor: '#fff',
    width: '95%',
    maxWidth: '950px',
    height: '88vh',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    position: 'relative',
  },
  header: {
    padding: '12px 20px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  titleText: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '50%',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  downloadBtn: {
    backgroundColor: '#06dfd1',
    color: '#000',
    padding: '6px 14px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  closeBtn: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  body: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#222',
  },
  securityBlocker: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '65px',
    height: '60px',
    backgroundColor: 'transparent',
    zIndex: 999,
    cursor: 'not-allowed',
  }
};

export default PdfModal;