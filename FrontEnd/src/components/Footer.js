import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <div className="footer-logo-social">
          <img src="/assets/healthconnect-logo.svg" alt="HealthConnect Logo" className="footer-logo" />
          <div className="footer-social">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        
        <div className="footer-links">
          <h4>Dịch vụ</h4>
          <ul>
            <li><a href="/health-declaration">Khai báo y tế</a></li>
            <li><a href="/health-check-management">Khám sức khỏe định kỳ</a></li>
            <li><a href="/vaccination-management">Đăng ký tiêm chủng</a></li>
            <li><a href="/send-medicine">Đặt thuốc</a></li>
          </ul>
        </div>
        
        <div className="footer-links">
          <h4>Thông tin</h4>
          <ul>
            <li><a href="/about">Về chúng tôi</a></li>
            <li><a href="/doctors">Đội ngũ y bác sĩ</a></li>
            <li><a href="/locations">Địa điểm</a></li>
            <li><a href="/career">Tuyển dụng</a></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h4 className="footer-questions">Bạn có câu hỏi?</h4>
          <p className="footer-phone">Hotline: 1900 1234</p>
          <p className="footer-email">Email: info@healthconnect.vn</p>
          <p className="footer-address">123 Đường Y Tế, Quận Sức Khỏe, TP.HCM</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} HealthConnect. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
