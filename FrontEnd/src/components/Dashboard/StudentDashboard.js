import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    healthChecks: 1,
    medicalHistory: 8,
    upcomingCheckups: 2,
    blogRead: 12
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
                Chào mừng đến với HealthConnect - Học sinh
              </h1>
              <p className="hero-subtitle">
                Theo dõi sức khỏe của bạn và tìm hiểu thông tin y tế hữu ích
              </p>
              
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.healthChecks}</div>
                  <div className="hero-stat-label">Hồ sơ sức khỏe</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.medicalHistory}</div>
                  <div className="hero-stat-label">Lần kiểm tra y tế</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.upcomingCheckups}</div>
                  <div className="hero-stat-label">Kiểm tra sắp tới</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2 className="section-title">Chức năng chính</h2>
            
            <div className="actions-grid">
              <div className="action-card" onClick={() => handleNavigate('/medical-history')}>
                <div className="action-icon">
                  <i className="fas fa-history"></i>
                </div>
                <div className="action-title">Lịch sử kiểm tra y tế</div>
                <div className="action-description">
                  Xem lịch sử các lần kiểm tra sức khỏe và kết quả của bạn.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/blog-documents')}>
                <div className="action-icon">
                  <i className="fas fa-book-medical"></i>
                </div>
                <div className="action-title">Blog & Tài liệu</div>
                <div className="action-description">
                  Đọc các bài viết và tài liệu về sức khỏe từ nhân viên y tế nhà trường.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/profile-management')}>
                <div className="action-icon">
                  <i className="fas fa-user-edit"></i>
                </div>
                <div className="action-title">Quản lý hồ sơ</div>
                <div className="action-description">
                  Cập nhật thông tin cá nhân và xem hồ sơ sức khỏe của bạn.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/upcoming-checkups')}>
                <div className="action-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="action-title">Lịch kiểm tra sắp tới</div>
                <div className="action-description">
                  Xem lịch trình các buổi kiểm tra sức khỏe sắp diễn ra.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/health-tips')}>
                <div className="action-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="action-title">Mẹo sức khỏe</div>
                <div className="action-description">
                  Khám phá các mẹo và lời khuyên để duy trì sức khỏe tốt.
                </div>
              </div>

              <div className="action-card" onClick={() => handleNavigate('/emergency-contacts')}>
                <div className="action-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="action-title">Liên hệ khẩn cấp</div>
                <div className="action-description">
                  Thông tin liên hệ khẩn cấp và hướng dẫn khi cần hỗ trợ y tế.
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
                  <i className="fas fa-file-medical-alt"></i>
                </div>
                <div className="stat-value">{stats.healthChecks}</div>
                <div className="stat-label">Hồ sơ sức khỏe</div>
                <div className="stat-change stat-increase">Cập nhật mới nhất</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-history"></i>
                </div>
                <div className="stat-value">{stats.medicalHistory}</div>
                <div className="stat-label">Lần kiểm tra y tế</div>
                <div className="stat-change stat-increase">+2 trong năm nay</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-value">{stats.upcomingCheckups}</div>
                <div className="stat-label">Kiểm tra sắp tới</div>
                <div className="stat-change stat-increase">Lần tiếp theo: 2 tuần</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-book-medical"></i>
                </div>
                <div className="stat-value">{stats.blogRead}</div>
                <div className="stat-label">Bài viết đã đọc</div>
                <div className="stat-change stat-increase">+3 trong tháng này</div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <h2 className="section-title">Hoạt động gần đây</h2>
            
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-history"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Kiểm tra sức khỏe định kỳ - Kết quả tốt</div>
                  <div className="activity-time">1 tuần trước</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-book-medical"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Đọc bài viết về dinh dưỡng cho học sinh</div>
                  <div className="activity-time">3 ngày trước</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Nhận thông báo lịch kiểm tra sắp tới</div>
                  <div className="activity-time">5 ngày trước</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-user-edit"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-text">Cập nhật thông tin cá nhân</div>
                  <div className="activity-time">1 tuần trước</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard; 