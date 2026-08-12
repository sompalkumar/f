import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute() {
  const location = useLocation();
  const isLoggedIn =
    localStorage.getItem('isLoggedIn') === 'true' ||
    sessionStorage.getItem('isLoggedIn') === 'true';

  return isLoggedIn ? (
    <Outlet />
  ) : (
    // state में वर्तमान लोकेशन भेजें ताकि लॉगिन के बाद यूजर वापस यहीं आ सके
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

export default ProtectedRoute;