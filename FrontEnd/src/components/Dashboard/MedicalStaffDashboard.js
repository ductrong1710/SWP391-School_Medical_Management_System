import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const MedicalStaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 2456,
    todayCheckups: 127,
    healthAlerts: 3,
    vaccinationPlans: 15,
    pendingConsents: 8
  });

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-layout">
      <div className="main-container">
        <main className="main-content">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                Chào mừng đến với HealthConnect - Medical Staff
              </h1>
              <p className="hero-subtitle">
                Hệ thống quản lý sức khỏe học đường cho nhân viên y tế
              </p>
              
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.totalStudents.toLocaleString()}</div>
                  <div className="hero-stat-label">Học sinh đang theo dõi</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.todayCheckups.toLocaleString()}</div>
                  <div className="hero-stat-label">Kiểm tra hôm nay</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.pendingConsents}</div>
                  <div className="hero-stat-label">Chờ xác nhận tiêm chủng</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2 className="section-title">Chức năng chính</h2>
            
            <div className="actions-grid">
              <div className="action-card" onClick={() => handleNavigate('/health-records')}>
                <div className="action-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
                <div className="action-title">Tra cứu hồ sơ sức khỏe</div>
                <div className="action-description">
                  Xem toàn bộ hồ sơ sức khỏe mà Parent đã khai báo. Tìm kiếm theo tên, lớp và quản lý hồ sơ.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/medication-management')}>
                <div className="action-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <div className="action-title">Quản lý thuốc</div>
                <div className="action-description">
                  Quản lý danh sách thuốc, nhận thuốc từ phụ huynh và theo dõi quá trình sử dụng.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/vaccination-management')}>
                <div className="action-icon">
                  <i className="fas fa-syringe"></i>
                </div>
                <div className="action-title">Quản lý tiêm chủng</div>
                <div className="action-description">
                  Lên kế hoạch tiêm chủng, gửi thông báo xác nhận đến Parent và nhận phản hồi.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/periodic-checkups')}>
                <div className="action-icon">
                  <i className="fas fa-stethoscope"></i>
                </div>
                <div className="action-title">Quản lý kiểm tra định kỳ</div>
                <div className="action-description">
                  Lên lịch và quản lý quá trình kiểm tra sức khỏe định kỳ cho học sinh.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/blog-management')}>
                <div className="action-icon">
                  <i className="fas fa-blog"></i>
                </div>
                <div className="action-title">Viết Blog & Tài liệu</div>
                <div className="action-description">
                  Tạo và quản lý các bài viết, tài liệu về sức khỏe cho học sinh và phụ huynh.
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="stats-section">
            <h2 className="section-title">Thống kê tổng quan</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-value">{stats.totalStudents.toLocaleString()}</div>
                <div className="stat-label">Tổng học sinh</div>
                <div className="stat-change stat-increase">+15% so với tháng trước</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-file-medical-alt"></i>
                </div>
                <div className="stat-value">{stats.todayCheckups.toLocaleString()}</div>
                <div className="stat-label">Kiểm tra hôm nay</div>
                <div className="stat-change stat-increase">+8% so với hôm qua</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-syringe"></i>
                </div>
                <div className="stat-value">{stats.vaccinationPlans}</div>
                <div className="stat-label">Kế hoạch tiêm chủng</div>
                <div className="stat-change stat-increase">+3 kế hoạch mới</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-value">{stats.pendingConsents}</div>
                <div className="stat-label">Chờ xác nhận</div>
                <div className="stat-change stat-decrease">-2 so với tuần trước</div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <h2 className="section-title">Hoạt động gần đây</h2>
            
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Cập nhật hồ sơ sức khỏe cho học sinh Nguyễn Văn A</div>
                  <div className="activity-time">2 giờ trước</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-syringe"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Gửi thông báo tiêm chủng cho lớp 5A</div>
                  <div className="activity-time">4 giờ trước</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Nhận thuốc từ phụ huynh học sinh Trần Thị B</div>
                  <div className="activity-time">6 giờ trước</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-blog"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Đăng bài viết mới về dinh dưỡng cho học sinh</div>
                  <div className="activity-time">1 ngày trước</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MedicalStaffDashboard; 