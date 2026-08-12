import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute() {
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';

  // 1. अगर यूजर लॉगिन ही नहीं है, तो उसे सीधे लॉगिन पेज पर भेजें
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. अगर यूजर लॉगिन है लेकिन एडमिन नहीं है, तो उसे डैशबोर्ड पर भेजें
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. अगर यूजर एडमिन है, तो पेज एक्सेस करने दें
  return <Outlet />;
}

export default AdminRoute;