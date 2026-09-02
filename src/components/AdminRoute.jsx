import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // 1. Session aur LocalStorage dono se values fetch karein
  const isLoggedIn = 
    sessionStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('isLoggedIn') === 'true';

  const rawRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole') || 
    '';

  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  // Case-insensitive & Clean Role format (e.g., "Admin" ya "ADMIN" -> "admin")
  const userRole = String(rawRole).toLowerCase().trim();

  // 2. Auth Check: Login status aur valid token ka hona zaroori hai
  if (!isLoggedIn || !token || token.trim() === '') {
    return <Navigate to="/" replace />;
  }

  // 3. Strict Role Check: Role 'admin' hona chahiye
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Access Granted: Admin dashboard components render honge
  return <Outlet />;
};

export default AdminRoute;