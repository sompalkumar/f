import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // 🟢 Session aur Local Storage dono jagah se Credentials fetch karein
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  const userName = 
    sessionStorage.getItem('userName') || 
    localStorage.getItem('userName') || 
    'Student';

  // 🛡️ User Role ('student' ya 'admin')
  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole') || 
    'student';

  // 🛡️ 1. Security Check: Agar user logged in nahi hai ya token missing hai toh Root (/) par bhejen
  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, token, navigate]);

  // Courses List
  const courses = [
    { id: 'bca', name: '💻 BCA (Bachelor of Computer Applications)' },
    { id: 'bcom', name: '📊 B.Com (Bachelor of Commerce)' },
    { id: 'arts', name: '🎨 Arts (Bachelor of Arts)' },
    { id: 'science', name: '🔬 Science (Bachelor of Science)' }
  ];

  // Agar login nahi hai ya token missing hai toh UI render hone se rokein
  if (!isLoggedIn || !token) {
    return null; 
  }

  return (
    <div style={containerStyle}>
      {/* 👑 Agar Admin logged-in hai toh Admin Panel par jaane ka Quick Shortcut Button */}
      {userRole === 'admin' && (
        <div style={adminNoticeStyle}>
          <span>👑 Logged in as <strong>Admin</strong></span>
          <button 
            onClick={() => navigate('/admin-dashboard')} 
            style={adminBtnStyle}
          >
            Go to Admin Panel ⚙️
          </button>
        </div>
      )}

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

const adminNoticeStyle = {
  backgroundColor: '#fff3cd',
  color: '#856404',
  border: '1px solid #ffeeba',
  padding: '12px 20px',
  borderRadius: '8px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: '500'
};

const adminBtnStyle = {
  backgroundColor: '#333',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px'
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
  justifyContent: 'space-between',
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