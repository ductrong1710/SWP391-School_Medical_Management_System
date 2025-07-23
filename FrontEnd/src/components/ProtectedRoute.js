import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Thêm debug
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "loading:", loading);

  // Nếu đang loading, trả về null hoặc spinner
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
      <div className="loading-spinner">Loading...</div>
    </div>;
  }

  // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  // và lưu lại đường dẫn hiện tại để sau khi đăng nhập có thể quay lại
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location, manualLogin: true }} replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập
  console.log("Authenticated, allowing access");
  return <Outlet />;
};

export default ProtectedRoute;
