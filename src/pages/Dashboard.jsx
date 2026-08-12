import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // 🟢 Session, Local Storage दोनों जगह से डेटा चेक करें
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const userName = 
    sessionStorage.getItem('userName') || 
    localStorage.getItem('userName') || 
    'Student';

  // 🛡️ 1. सुरक्षा जांच: अगर यूजर लॉगिन नहीं है तो /login पर रिडायरेक्ट करें
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // कोर्सेज की लिस्ट (BCA, B.Com, Arts, Science)
  const courses = [
    { id: 'bca', name: '💻 BCA (Bachelor of Computer Applications)' },
    { id: 'bcom', name: '📊 B.Com (Bachelor of Commerce)' },
    { id: 'arts', name: '🎨 Arts (Bachelor of Arts)' },
    { id: 'science', name: '🔬 Science (Bachelor of Science)' }
  ];

  // अगर लॉगिन नहीं है तो कुछ भी रेंडर न करें
  if (!isLoggedIn) {
    return null; 
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, color: '#333' }}>Welcome, {userName}! 👋</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Please select your course to see the list of semesters:
        </p>
      </div>
      
      <div style={gridStyle}>
        {courses.map((course) => (
          <div key={course.id} style={cardStyle}>
            <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px' }}>
              {course.name}
            </h3>
            <button 
              onClick={() => navigate(`/course/${course.id}`)}
              style={buttonStyle}
            >
              View Semesters
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 Clean Styles Object
const containerStyle = {
  padding: '30px 20px',
  maxWidth: '800px',
  margin: '0 auto',
  fontFamily: 'Arial, sans-serif'
};

const headerStyle = {
  marginBottom: '25px',
  textAlign: 'center'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px'
};

const cardStyle = {
  padding: '24px',
  border: '1px solid #eaeaea',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  justify: 'space-between',
  alignItems: 'center'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#06dfd1',
  color: 'black',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
  transition: 'background-color 0.2s'
};

export default Dashboard;