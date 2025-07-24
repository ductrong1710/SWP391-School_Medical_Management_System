import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import './HealthCheck.css'; // Add a CSS file for styling

const HealthCheck = () => {
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Corrected API endpoint based on project structure
        const response = await apiClient.get('/HealthCheck'); 
        setHealthChecks(response.data);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu khám sức khỏe. Vui lòng thử lại sau.');
        console.error("Fetch Health Checks Error:", err);
        setHealthChecks([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="health-check-container loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="health-check-container error">{error}</div>;
  }

  return (
    <div className="health-check-plan-list">
      <h1 className="plan-list-title">Danh sách Kế hoạch kiểm tra sức khỏe định kỳ</h1>
      {healthChecks.length > 0 ? (
        <div className="plan-list">
          {healthChecks.map((check) => (
            <div className="plan-card" key={check.id}>
              <div className="plan-header">
                <span className="plan-title">{check.planName || check.patientName}</span>
                <span className="plan-date">
                  <i className="fa fa-calendar" /> {new Date(check.date).toLocaleDateString()}
                </span>
              </div>
              <div className="plan-content">
                <b>Nội dung:</b> {check.checkupContent || check.checkupType}
              </div>
              <div className="plan-footer">
                <span><b>Lớp:</b> {check.className || check.class}</span>
                <span><b>Trạng thái:</b> {check.status}</span>
              </div>
              <div className="plan-actions">
                <button className="btn-view"><i className="fa fa-eye" /> Xem</button>
                <button className="btn-edit"><i className="fa fa-edit" /> Sửa</button>
                <button className="btn-notify"><i className="fa fa-bell" /> Gửi thông báo</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">Không có dữ liệu khám sức khỏe.</p>
      )}
    </div>
  );
};

export default HealthCheck; 