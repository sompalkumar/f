import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole');

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  // Bilkul strict verification: Login + Token + Role Admin hona zaroori hai
  if (!isLoggedIn || !token) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== 'admin') {
    // Agar candidate /admin-dashboard kholne ki koshish kare, toh Candidate Dashboard par bhej do
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;