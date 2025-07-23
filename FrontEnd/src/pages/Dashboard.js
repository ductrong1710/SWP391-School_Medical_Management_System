import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MedicalStaffDashboard from '../components/Dashboard/MedicalStaffDashboard';
import ParentDashboard from '../components/Dashboard/ParentDashboard';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { isAuthenticated, loading, user, logout, getUserRole } = useAuth();
  const navigate = useNavigate();
  
  // Kiểm tra xác thực trực tiếp trong component
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("Dashboard: Not authenticated, redirecting to login");
      navigate('/login', { 
        state: { 
          from: { pathname: '/dashboard' },
          manualLogin: true 
        } 
      });
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng ?')) {
      logout();
      navigate('/login');
    }
  };
  
  // Nếu đang loading hoặc chưa đăng nhập, hiển thị thông báo loading
  if (loading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '50px 0' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Lấy role của user
  const userRole = getUserRole();
  
  // Render dashboard theo role
  const renderDashboardByRole = () => {
    if (userRole === 'Admin') {
      return <AdminDashboard />;
    }
    switch (userRole) {
      case 'MedicalStaff':
        return <MedicalStaffDashboard />;
      case 'Parent':
        return <ParentDashboard />;
      case 'Student':
        return <StudentDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return renderDashboardByRole();
};

export default Dashboard;