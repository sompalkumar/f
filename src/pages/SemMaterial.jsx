import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// 🌐 Centralized Backend Base URL
import { API_BASE_URL } from '../config'; 

// 🔲 In-App PDF Pop-up Modal Import
import PdfModal from '../components/PdfModal';

function SemMaterial() {
  const { courseId = '', semId = '' } = useParams();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Modal Controls State
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState('');

  // 📚 Static Fallback Data
  const localFallbackData = {
    bca: {
      1: [
        { id: 1, title: 'C Programming Complete Notes', fileName: 'c_notes.pdf', size: '2.5 MB' },
        { id: 2, title: 'Computer Fundamentals Syllabus', fileName: 'cf_syllabus.pdf', size: '1.1 MB' },
        { id: 3, title: 'Previous Year Question Paper (2023)', fileName: 'pyq_2023.pdf', size: '4.0 MB' }
      ],
      2: [
        { id: 1, title: 'Data Structures & Algorithms Notes', fileName: 'dsa_notes.pdf', size: '3.8 MB' },
        { id: 2, title: 'C++ Object Oriented Programming', fileName: 'cpp_oops.pdf', size: '2.9 MB' }
      ]
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/materials/${courseId}/${semId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setMaterials(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend materials fetch failed, using fallback data:', err);
      }

      const safeCourse = courseId.toLowerCase();
      const fallback = localFallbackData[safeCourse]?.[semId] || [
        { id: 1, title: `Syllabus Sem ${semId}`, fileName: `Syllabus_Sem_${semId}.pdf`, size: '1.5 MB' },
        { id: 2, title: 'Previous Year Question Papers', fileName: 'Previous_Year_Question_Papers.pdf', size: '3.2 MB' },
        { id: 3, title: 'Important Questions & Notes', fileName: 'Notes_Subject_1.pdf', size: '2.0 MB' }
      ];

      setMaterials(fallback);
      setLoading(false);
    };

    fetchMaterials();
  }, [courseId, semId]);

  // Target PDF URL Resolve karne ke liye Helper Function
  const getPdfUrl = (file) => {
    if (file.driveUrl) return file.driveUrl;
    if (file.fileUrl) return file.fileUrl;
    if (file.fileName && file.fileName.startsWith('http')) return file.fileName;
    return `${API_BASE_URL}/uploads/${file.fileName}`;
  };

  // PDF Popup Open karne ke liye Handler
  const handleViewPdf = (file) => {
    const targetUrl = getPdfUrl(file);
    setSelectedPdfUrl(targetUrl);
    setSelectedPdfTitle(file.title);
    setIsPdfOpen(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ borderBottom: '2px solid #28a745', paddingBottom: '12px', marginBottom: '25px' }}>
        <h2 style={{ textTransform: 'uppercase', color: '#28a745', margin: '0 0 8px 0' }}>
          📚 {courseId?.toUpperCase() || 'COURSE'} — Semester {semId}
        </h2>
        <p style={{ color: '#555', margin: 0 }}>
          इस सेमेस्टर के सभी आधिकारिक नोट्स, बुक्स और स्टडी फाइल्स नीचे से आसानी से डाउनलोड करें।
        </p>
      </div>

      {/* Materials List Container */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid #e0e0e0', 
        borderRadius: '10px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
        padding: '20px' 
      }}>
        <h3 style={{ marginTop: 0, color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
          📄 Study Files & Downloads
        </h3>

        {/* Loading Indicator */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#28a745', fontWeight: 'bold' }}>
            ⏳ Loading study materials...
          </div>
        ) : materials.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {materials.map((file) => (
              <div 
                key={file._id || file.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '8px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{file.title}</div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '3px' }}>
                    File: {file.fileName || 'Document'} {file.size ? `| Size: ${file.size}` : ''}
                  </div>
                </div>

                {/* In-App PDF View Button */}
                <button 
                  onClick={() => handleViewPdf(file)}
                  style={{
                    backgroundColor: '#28a745',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  👁️ View PDF
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>
            इस सेमेस्टर के लिए फिलहाल कोई स्टडी मटेरियल उपलब्ध नहीं है।
          </p>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <Link 
          to={`/course/${courseId}`} 
          style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
        >
          ⬅ Back to Semesters
        </Link>
        <Link 
          to="/dashboard" 
          style={{ color: '#6c757d', textDecoration: 'none', fontWeight: 'bold' }}
        >
          🏠 Main Dashboard
        </Link>
      </div>

      {/* 🔲 In-App Pop-up PDF Modal Component */}
      <PdfModal 
        isOpen={isPdfOpen} 
        onClose={() => setIsPdfOpen(false)} 
        pdfUrl={selectedPdfUrl} 
        title={selectedPdfTitle} 
      />

    </div>
  );
}

export default SemMaterial;