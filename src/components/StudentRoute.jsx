import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const StudentRoute = () => {
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole');

  // Agar login nahi hai, to Home/Register par redirect karo
  if (!isLoggedIn || !token) {
    return <Navigate to="/" replace />;
  }

  // Student Route 'student' aur 'admin' dono ke liye valid hai (Taaki Admin student view dekh sake)
  if (userRole === 'student' || userRole === 'admin') {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default StudentRoute;