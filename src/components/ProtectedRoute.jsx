import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute({ requiredRole }) {
  const location = useLocation();

  // 1. Session aur LocalStorage dono se Auth Check
  const token = 
    sessionStorage.getItem('token') || 
    localStorage.getItem('token');

  const isLoggedIn = 
    (sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true') && 
    Boolean(token);

  const userRole = 
    sessionStorage.getItem('userRole') || 
    localStorage.getItem('userRole');

  // 2. Agar user logged in nahi hai -> Login page par bhejien (With state redirect)
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. Role Check (e.g. Admin specific routes ke liye)
  if (requiredRole && userRole !== requiredRole) {
    alert('⚠️ Aapke paas is page ko access karne ki anumati nahi hai!');
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Sabhi checks pass hone par Route Render karein
  return <Outlet />;
}

export default ProtectedRoute;