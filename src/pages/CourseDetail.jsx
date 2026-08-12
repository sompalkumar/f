import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'; // सही इम्पोर्ट

function CourseDetail() {
  const { courseId } = useParams(); 
  const navigate = useNavigate();
  
  const [selectedSem, setSelectedSem] = useState(null);
  const [dbMaterials, setDbMaterials] = useState([]);
  
  // 🟢 लाइव इमेज प्रीव्यू (पॉप-अप) कंट्रोल
  const [previewImage, setPreviewImage] = useState(null);

  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';

  // 🟢 लॉगिन चेक (बिना लॉगिन के होम/लॉगिन पेज पर भेजें)
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 🟢 डेटाबेस से मटेरियल खींचना
  useEffect(() => {
    if (selectedSem && courseId) {
      fetch(`${API_BASE_URL}/api/materials/${courseId}/${selectedSem}`)
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            sessionStorage.clear(); 
            localStorage.clear();
            alert('⏰ आपका सुरक्षा सेशन समाप्त हो चुका है! कृपया दोबारा लॉगिन करें।');
            navigate('/', { replace: true });
            return null;
          }
          return res.json();
        })
        .then(data => { 
          if (data) setDbMaterials(data); 
        })
        .catch(err => console.error("API Error:", err));
    }
  }, [selectedSem, courseId, navigate]);

  const semesters = [1, 2, 3, 4, 5, 6];

  // 🟢 व्यू बटन ऐक्शन
  const handleViewFile = (fileUrl, fileType) => {
    if (fileType === 'pdf') {
      window.open(fileUrl, '_blank');
    } else {
      setPreviewImage(fileUrl);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textTransform: 'uppercase', color: '#06dfd1', textAlign: 'center', fontWeight: 'bold' }}>
        📚 {courseId} Course Panel
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
        Click on any semester below to view its study material:
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {semesters.map((sem) => (
          <div key={sem} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <div 
              onClick={() => setSelectedSem(selectedSem === sem ? null : sem)} 
              style={{ 
                padding: '15px', 
                backgroundColor: selectedSem === sem ? '#06dfd1' : '#f8f9fa', 
                color: selectedSem === sem ? 'black' : '#06dfd1', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                userSelect: 'none' 
              }}
            >
              <span>{sem}. Sem-{sem}</span>
              <span>{selectedSem === sem ? '▲ Hide Materials' : '▼ View Materials'}</span>
            </div>
            
            {/* सेमेस्टर के अंदर की लिस्ट */}
            {selectedSem === sem && (
              <div style={{ padding: '15px', backgroundColor: '#fff', borderTop: '1px solid #ddd' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'black', fontWeight: 'bold' }}>Available Materials:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dbMaterials.length > 0 ? (
                    dbMaterials.map((mat) => (
                      <div key={mat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          {mat.fileType === 'pdf' ? '📄' : '🖼️'} {mat.title}
                        </span>
                        
                        {/* एक्शन बटन्स */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleViewFile(mat.fileUrl, mat.fileType)}
                            style={{ padding: '6px 14px', backgroundColor: '#ff6f00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                          >
                            View
                          </button>
                          
                          <a href={mat.fileUrl} target="_blank" rel="noreferrer" download>
                            <button style={{ padding: '6px 14px', backgroundColor: '#d1a933', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                              Download
                            </button>
                          </a>
                        </div>
                      </div>
                    ))
                  ) : ( 
                    <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>No material has been uploaded yet for this semester.</p> 
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🖼️ लाइव इमेज प्रीव्यू पॉप-अप बॉक्स (Lightbox) */}
      {previewImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <button 
              onClick={() => setPreviewImage(null)} 
              style={{ position: 'absolute', top: '-15px', right: '-15px', width: '35px', height: '35px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', outline: 'none' }}
            >
              ✕
            </button>
            <img 
              src={previewImage} 
              alt="Preview Notice" 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '6px' }} 
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/dashboard" style={{ color: '#06dfd1', textDecoration: 'none', fontWeight: 'bold' }}>
          ⬅ Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default CourseDetail;