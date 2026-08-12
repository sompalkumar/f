import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function StudentRoute() {
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';

  // 1. अगर यूजर लॉगिन ही नहीं है तो लॉगिन पेज पर भेजें
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. अगर एडमिन लॉगिन है तो उसे एडमिन डैशबोर्ड पर भेजें (लॉगिन पेज पर नहीं)
  if (userRole === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // 3. अगर छात्र है तो एक्सेस दें
  return <Outlet />;
}

export default StudentRoute;