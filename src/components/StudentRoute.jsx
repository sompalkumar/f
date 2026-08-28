import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const StudentRoute = () => {
  // 1. Session aur LocalStorage se values fetch karein
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  const rawRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole') || 
    '';

  // Role ko clean & lowercase format mein convert karein
  const userRole = String(rawRole).toLowerCase().trim();

  // Debugging log (F12 Console mein check karne ke liye)
  console.log("StudentRoute Check -> isLoggedIn:", isLoggedIn, "| Token Present:", !!token, "| Role:", userRole);

  // 2. Auth Check: Login status aur Token zaroori hai
  if (!isLoggedIn || !token || token.trim() === '') {
    console.warn("Access Denied: StudentRoute - User logged in nahi hai ya token missing hai.");
    return <Navigate to="/" replace />;
  }

  // 3. Allowed Roles Check (student, candidate, aur admin sabhi ke liye access valid hai)
  const isAllowed = ['student', 'candidate', 'admin'].includes(userRole);

  if (isAllowed) {
    return <Outlet />;
  }

  console.warn(`Access Denied: StudentRoute - Invalid role "${userRole}"`);
  return <Navigate to="/" replace />;
};

export default StudentRoute;