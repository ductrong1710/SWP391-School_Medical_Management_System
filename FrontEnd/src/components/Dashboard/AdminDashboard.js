import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 2456,
    todayCheckups: 127,
    healthAlerts: 3,
    monthlyDeclarations: 8567,
    vaccinationRate: 94
  });

  // Cập nhật thống kê mỗi 30 giây
  useEffect(() => {
    const updateStats = () => {
      setStats({
        totalStudents: Math.floor(Math.random() * 500) + 2000,
        todayCheckups: Math.floor(Math.random() * 200) + 50,
        healthAlerts: Math.floor(Math.random() * 20) + 1,
        monthlyDeclarations: Math.floor(Math.random() * 2000) + 7000,
        vaccinationRate: Math.floor(Math.random() * 10) + 90
      });
    };
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-layout">
      <div className="main-container">
        <main className="main-content">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Chào mừng đến với HealthConnect</h1>
              <p className="hero-subtitle">Hệ thống quản lý sức khỏe học đường thông minh và hiệu quả</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.totalStudents.toLocaleString()}</div>
                  <div className="hero-stat-label">Học sinh đang theo dõi</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.todayCheckups.toLocaleString()}</div>
                  <div className="hero-stat-label">Khai báo hôm nay</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">{stats.healthAlerts.toLocaleString()}</div>
                  <div className="hero-stat-label">Cảnh báo sức khỏe</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2 className="section-title">Các chức năng chính</h2>
            <div className="actions-grid">
              <div className="action-card" onClick={() => navigateTo('/health-declaration')}>
                <div className="action-icon"><i className="fas fa-file-medical"></i></div>
                <h3 className="action-title">Khai báo sức khỏe</h3>
                <p className="action-description">Theo dõi và quản lý tình trạng sức khỏe học sinh hàng ngày một cách chi tiết và chính xác</p>
              </div>
              <div className="action-card" onClick={() => navigateTo('/vaccination-management')}>
                <div className="action-icon"><i className="fas fa-syringe"></i></div>
                <h3 className="action-title">Quản lý tiêm chủng</h3>
                <p className="action-description">Lập lịch và theo dõi tiến độ tiêm vaccine cho học sinh, đảm bảo an toàn sức khỏe</p>
              </div>
              <div className="action-card" onClick={() => navigateTo('/send-medicine')}>
                <div className="action-icon"><i className="fas fa-pills"></i></div>
                <h3 className="action-title">Quản lý thuốc</h3>
                <p className="action-description">Phân phối và theo dõi việc sử dụng thuốc an toàn cho học sinh trong trường học</p>
              </div>
              <div className="action-card" onClick={() => navigateTo('/health-check-management')}>
                <div className="action-icon"><i className="fas fa-stethoscope"></i></div>
                <h3 className="action-title">Khám sức khỏe</h3>
                <p className="action-description">Lên lịch và quản lý các buổi khám sức khỏe định kỳ cho học sinh</p>
              </div>
              <div className="action-card" onClick={() => navigateTo('/record-process')}>
                <div className="action-icon"><i className="fas fa-clipboard-list"></i></div>
                <h3 className="action-title">Quy trình hồ sơ</h3>
                <p className="action-description">Ghi nhận và xử lý các trường hợp y tế đặc biệt, quản lý hồ sơ sức khỏe</p>
              </div>
              <div className="action-card" onClick={() => navigateTo('/documents-blog')}>
                <div className="action-icon"><i className="fas fa-book-medical"></i></div>
                <h3 className="action-title">Tài liệu & Blog</h3>
                <p className="action-description">Tài liệu y tế và chia sẻ kinh nghiệm chăm sóc sức khỏe học đường</p>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="stats-section">
            <h2 className="section-title">Thống kê tổng quan</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-users"></i></div>
                <div className="stat-value">{stats.totalStudents.toLocaleString()}</div>
                <div className="stat-label">Tổng học sinh</div>
                <div className="stat-change stat-increase">+15% so với tháng trước</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-file-medical-alt"></i></div>
                <div className="stat-value">{stats.monthlyDeclarations.toLocaleString()}</div>
                <div className="stat-label">Khai báo tháng này</div>
                <div className="stat-change stat-increase">+8% so với tháng trước</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                <div className="stat-value">{stats.vaccinationRate}%</div>
                <div className="stat-label">Tỷ lệ tiêm chủng</div>
                <div className="stat-change stat-increase">+3% so với quý trước</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
                <div className="stat-value">{stats.healthAlerts}</div>
                <div className="stat-label">Cảnh báo sức khỏe</div>
                <div className="stat-change stat-decrease">-25% so với tuần trước</div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <h2 className="section-title">Hoạt động gần đây</h2>
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-icon"><i className="fas fa-file-medical"></i></div>
                <div className="activity-content">
                  <div className="activity-title">Khai báo sức khỏe mới từ lớp 10A1 - THPT Nguyễn Du</div>
                  <div className="activity-time">5 phút trước</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><i className="fas fa-syringe"></i></div>
                <div className="activity-content">
                  <div className="activity-title">Hoàn thành tiêm vaccine cho 45 học sinh lớp 11B2</div>
                  <div className="activity-time">30 phút trước</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><i className="fas fa-pills"></i></div>
                <div className="activity-content">
                  <div className="activity-title">Phân phối thuốc cảm cúm cho học sinh THCS Lê Lợi</div>
                  <div className="activity-time">1 giờ trước</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><i className="fas fa-stethoscope"></i></div>
                <div className="activity-content">
                  <div className="activity-title">Khám sức khỏe định kỳ cho học sinh lớp 12C1 - THPT Trần Hưng Đạo</div>
                  <div className="activity-time">2 giờ trước</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><i className="fas fa-book"></i></div>
                <div className="activity-content">
                  <div className="activity-title">Cập nhật tài liệu hướng dẫn chăm sóc sức khỏe mùa đông</div>
                  <div className="activity-time">3 giờ trước</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 