import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import './Sidebar.css';

const Sidebar = ({ onSidebarToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, getUserRole, user } = useAuth();
  const userRole = getUserRole();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onSidebarToggle) {
      onSidebarToggle(newCollapsedState);
    }
  };
  // Update parent component on mount with initial state
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(collapsed);
    }
    
  // For web only, no mobile-specific code
    return () => {
      // Cleanup if needed
    };
  }, [collapsed, onSidebarToggle]);
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Sidebar tự động mở rộng khi hover
  const handleMouseEnter = () => {
    setCollapsed(false);
    if (onSidebarToggle) {
      onSidebarToggle(false);
    }
  };
  const handleMouseLeave = () => {
    setCollapsed(true);
    if (onSidebarToggle) {
      onSidebarToggle(true);
    }
  };

  return (
    <>
      <div
        className={`sidebar ${collapsed ? 'collapsed' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-logo">
            <div className="logo-img">
              <img src="/assets/healthconnect-logo.svg" alt="HealthConnect Logo" />
            </div>
            {!collapsed && <div className="logo-text">HEALTH CONNECT</div>}
          </Link>
        </div>
        
        <div className="sidebar-menu">
          <Link to="/dashboard" className={`menu-item ${isActive('/dashboard')}`}>
            <div className="menu-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            {!collapsed && <span className="menu-text">Tổng quan</span>}
          </Link>
          {/* Menu cho Admin: hiển thị tất cả các chức năng */}
          {userRole === 'Admin' && <>
            <Link to="/health-record" className={`menu-item ${isActive('/health-record')}`}>
              <div className="menu-icon"><i className="fas fa-clipboard-list"></i></div>
              {!collapsed && <span className="menu-text">Tra cứu hồ sơ sức khỏe</span>}
            </Link>
            <Link to="/send-medicine" className={`menu-item ${isActive('/send-medicine')}`}>
              <div className="menu-icon"><i className="fas fa-pills"></i></div>
              {!collapsed && <span className="menu-text">Quản lý thuốc</span>}
            </Link>
            <Link to="/vaccination-management" className={`menu-item ${isActive('/vaccination-management')}`}>
              <div className="menu-icon"><i className="fas fa-syringe"></i></div>
              {!collapsed && <span className="menu-text">Quản lý tiêm chủng</span>}
            </Link>
            <Link to="/health-check-management" className={`menu-item ${isActive('/health-check-management')}`}>
              <div className="menu-icon"><i className="fas fa-stethoscope"></i></div>
              {!collapsed && <span className="menu-text">Quản lý kiểm tra định kỳ</span>}
            </Link>
            <Link to="/documents-blog" className={`menu-item ${isActive('/documents-blog')}`}>
              <div className="menu-icon"><i className="fas fa-book-medical"></i></div>
              {!collapsed && <span className="menu-text">Blog & Tài liệu</span>}
            </Link>
            <Link to="/notifications" className={`menu-item ${isActive('/notifications')}`}>
              <div className="menu-icon"><i className="fas fa-bell"></i></div>
              {!collapsed && <span className="menu-text">Thông báo xác nhận</span>}
            </Link>
            <Link to="/medical-history" className={`menu-item ${isActive('/medical-history')}`}>
              <div className="menu-icon"><i className="fas fa-history"></i></div>
              {!collapsed && <span className="menu-text">Lịch sử kiểm tra y tế</span>}
            </Link>
            <Link to="/medical-incident-management" className={`menu-item ${isActive('/medical-incident-management')}`}> 
              <div className="menu-icon"><i className="fas fa-ambulance"></i></div>
              {!collapsed && <span className="menu-text">Khai báo tai nạn y tế</span>}
            </Link>
          </>}
          {/* Menu cho MedicalStaff */}
          {userRole === 'MedicalStaff' && <>
            <Link to="/health-record" className={`menu-item ${isActive('/health-record')}`}>
              <div className="menu-icon"><i className="fas fa-clipboard-list"></i></div>
              {!collapsed && <span className="menu-text">Tra cứu hồ sơ sức khỏe</span>}
            </Link>
            <Link to="/send-medicine" className={`menu-item ${isActive('/send-medicine')}`}>
              <div className="menu-icon"><i className="fas fa-pills"></i></div>
              {!collapsed && <span className="menu-text">Quản lý thuốc</span>}
            </Link>
            <Link to="/vaccination-management" className={`menu-item ${isActive('/vaccination-management')}`}>
              <div className="menu-icon"><i className="fas fa-syringe"></i></div>
              {!collapsed && <span className="menu-text">Quản lý tiêm chủng</span>}
            </Link>
            <Link to="/health-check-management" className={`menu-item ${isActive('/health-check-management')}`}>
              <div className="menu-icon"><i className="fas fa-stethoscope"></i></div>
              {!collapsed && <span className="menu-text">Quản lý kiểm tra định kỳ</span>}
            </Link>
            <Link to="/documents-blog" className={`menu-item ${isActive('/documents-blog')}`}>
              <div className="menu-icon"><i className="fas fa-book-medical"></i></div>
              {!collapsed && <span className="menu-text">Blog & Tài liệu</span>}
            </Link>
            <Link to="/medical-incident-management" className={`menu-item ${isActive('/medical-incident-management')}`}> 
              <div className="menu-icon"><i className="fas fa-ambulance"></i></div>
              {!collapsed && <span className="menu-text">Khai báo tai nạn y tế</span>}
            </Link>
          </>}
          {/* Menu cho Parent */}
          {userRole === 'Parent' && <>
            <Link to="/health-record" className={`menu-item ${isActive('/health-record')}`}>
              <div className="menu-icon"><i className="fas fa-clipboard-list"></i></div>
              {!collapsed && <span className="menu-text">Khai báo hồ sơ sức khỏe</span>}
            </Link>
            <Link to="/send-medicine" className={`menu-item ${isActive('/send-medicine')}`}>
              <div className="menu-icon"><i className="fas fa-pills"></i></div>
              {!collapsed && <span className="menu-text">Gửi thuốc</span>}
            </Link>
            <Link to="/notifications" className={`menu-item ${isActive('/notifications')}`}>
              <div className="menu-icon"><i className="fas fa-bell"></i></div>
              {!collapsed && <span className="menu-text">Thông báo xác nhận</span>}
            </Link>
            <Link to="/medical-history" className={`menu-item ${isActive('/medical-history')}`}>
              <div className="menu-icon"><i className="fas fa-history"></i></div>
              {!collapsed && <span className="menu-text">Lịch sử kiểm tra y tế</span>}
            </Link>
            <Link to="/documents-blog" className={`menu-item ${isActive('/documents-blog')}`}>
              <div className="menu-icon"><i className="fas fa-book-medical"></i></div>
              {!collapsed && <span className="menu-text">Blog & Tài liệu</span>}
            </Link>
            <Link to="/medical-incident-history" className={`menu-item ${isActive('/medical-incident-history')}`}> 
              <div className="menu-icon"><i className="fas fa-ambulance"></i></div>
              {!collapsed && <span className="menu-text">Lịch sử tai nạn y tế</span>}
            </Link>
          </>}
          {/* Menu cho Student */}
          {userRole === 'Student' && <>
            <Link to="/medical-history" className={`menu-item ${isActive('/medical-history')}`}>
              <div className="menu-icon"><i className="fas fa-history"></i></div>
              {!collapsed && <span className="menu-text">Lịch sử kiểm tra y tế</span>}
            </Link>
            <Link to="/documents-blog" className={`menu-item ${isActive('/documents-blog')}`}>
              <div className="menu-icon"><i className="fas fa-book-medical"></i></div>
              {!collapsed && <span className="menu-text">Blog & Tài liệu</span>}
            </Link>
            <Link to="/medical-incident-history" className={`menu-item ${isActive('/medical-incident-history')}`}> 
              <div className="menu-icon"><i className="fas fa-ambulance"></i></div>
              {!collapsed && <span className="menu-text">Lịch sử tai nạn y tế</span>}
            </Link>
          </>}
        </div>
        
        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || user?.Name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div className="user-details">
                  <div className="user-name">{user?.name || user?.Name || 'Người dùng'}</div>
                  <div className="user-role">{
                    userRole === 'Admin' ? 'Quản trị viên' :
                    userRole === 'MedicalStaff' ? 'Nhân viên y tế' :
                    userRole === 'Parent' ? 'Phụ huynh' :
                    userRole === 'Student' ? 'Học sinh' :
                    'Khách'
                  }</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogoutClick}>
                <i className="fas fa-sign-out-alt"></i>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="user-menu collapsed">
              <div className="user-avatar" title={`${user?.name || user?.Name || 'Người dùng'} - ${userRole === 'Admin' ? 'Quản trị viên' : userRole === 'MedicalStaff' ? 'Nhân viên y tế' : userRole === 'Parent' ? 'Phụ huynh' : userRole === 'Student' ? 'Học sinh' : 'Khách'}`}>{user?.name?.charAt(0)?.toUpperCase() || user?.Name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <button className="logout-btn collapsed" title="Đăng xuất" onClick={handleLogoutClick}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Modal 
        isOpen={showLogoutModal}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
};

export default Sidebar;
