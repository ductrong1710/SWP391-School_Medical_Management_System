import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  // This effect runs once when the component mounts
  useEffect(() => {
    // If there's a hash in the URL (e.g., #about), scroll to that section
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Otherwise scroll to the top
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="home-container">
      <section id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Giải pháp y tế toàn diện cho cộng đồng</h1>
          <p className="hero-desc">
            HealthConnect kết nối bạn với dịch vụ chăm sóc sức khỏe chất lượng cao,
            từ khám bệnh đến tiêm chủng và quản lý hồ sơ y tế.
          </p>
        </div>
      </section>

      <section id="services" className="health-docs-section">
        <div style={{ maxWidth: "1100px", padding: "0 32px" }}>
          <h2 className="section-title">Các dịch vụ chính</h2>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-file-medical"></i>
              </div>
              <h3>Khai báo y tế</h3>
              <p>Khai báo thông tin sức khỏe trực tuyến cho học sinh, giúp theo dõi và phòng ngừa dịch bệnh trong trường học hiệu quả.</p>
              <Link to="/health-declaration" className="service-link">Khai báo ngay <i className="fas fa-arrow-right"></i></Link>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <h3>Khám sức khỏe định kỳ</h3>
              <p>Quản lý khám sức khỏe định kì đảm bảo sức khỏe về tinh thần và thể chất cho học sinh.</p>
              <Link to="/health-check-management" className="service-link">Đặt lịch khám <i className="fas fa-arrow-right"></i></Link>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-syringe"></i>
              </div>
              <h3>Tiêm chủng vắc-xin</h3>
              <p>Đăng ký và lịch tiêm chủng vắc-xin cho học sinh đảm bảo duy trì sức khỏe học đường.</p>
              <Link to="/vaccination-management" className="service-link">Đăng ký tiêm chủng <i className="fas fa-arrow-right"></i></Link>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-pills"></i>
              </div>
              <h3>Gửi thuốc cho học sinh</h3>
              <p>Đảm bảo giao thuốc đến tay học sinh và nhắc nhở học sinh uống thuốc đúng liều lượng.</p>
              <Link to="/send-medicine" className="service-link">Đặt thuốc <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="health-news-section">
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
          <div className="section-header">
            <h2 className="section-title">Tài liệu y tế học đường</h2>
            <a href="/documents-blog" className="view-all">Xem tất cả <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="news-grid">
            <div className="news-card">
              <div className="news-img-container">
                <img src="https://img.freepik.com/free-photo/teacher-giving-lecture-classroom_23-2148892402.jpg" alt="Hướng dẫn phòng chống dịch trong trường học" />
              </div>
              <div className="news-content">
                <span className="news-category">Phòng dịch</span>
                <h3>Hướng dẫn phòng chống dịch bệnh trong trường học</h3>
                <p>Tài liệu hướng dẫn các biện pháp phòng chống dịch bệnh, vệ sinh cá nhân và môi trường cho học sinh, giáo viên.</p>
                <a href="/documents-blog/phong-dich-truong-hoc" className="news-link">Xem tài liệu <i className="fas fa-arrow-right"></i></a>
              </div>
            </div>

            <div className="news-card">
              <div className="news-img-container">
                <img src="https://img.freepik.com/free-photo/healthy-lunchbox-school-kids_23-2148724922.jpg" alt="Dinh dưỡng học đường" />
              </div>
              <div className="news-content">
                <span className="news-category">Dinh dưỡng</span>
                <h3>Chế độ dinh dưỡng hợp lý cho học sinh</h3>
                <p>Tài liệu về thực đơn, chế độ ăn uống khoa học giúp học sinh phát triển toàn diện về thể chất và trí tuệ.</p>
                <a href="/documents-blog/dinh-duong-hoc-duong" className="news-link">Xem tài liệu <i className="fas fa-arrow-right"></i></a>
              </div>
            </div>

            <div className="news-card">
              <div className="news-img-container">
                <img src="https://img.freepik.com/free-photo/children-getting-vaccinated-school_23-2149212345.jpg" alt="Tiêm chủng học đường" />
              </div>
              <div className="news-content">
                <span className="news-category">Tiêm chủng</span>
                <h3>Lịch tiêm chủng và các lưu ý cho học sinh</h3>
                <p>Tài liệu cập nhật lịch tiêm chủng, các loại vắc-xin cần thiết và lưu ý khi tiêm phòng cho học sinh các cấp.</p>
                <a href="/documents-blog/tiem-chung-hoc-duong" className="news-link">Xem tài liệu <i className="fas fa-arrow-right"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="intro-section">
        <div className="intro-content">
          <h2 className="section-title">Về HealthConnect</h2>
          <p>
            HealthConnect là nền tảng quản lý y tế học đường hiện đại, kết nối liền mạch giữa nhà trường, phụ huynh và học sinh, mang đến giải pháp toàn diện từ khai báo hồ sơ sức khỏe, quản lý thuốc men đến xử lý sự cố y tế, tổ chức tiêm chủng và khám sức khỏe định kỳ. Với hệ thống bảo mật cao cấp nhưng vẫn đảm bảo khả năng truy cập nhanh chóng khi cần thiết, phần mềm không chỉ giúp tối ưu hóa quy trình quản lý mà còn hỗ trợ phát hiện sớm các vấn đề sức khỏe tiềm ẩn thông qua báo cáo trực quan và hệ thống cảnh báo thông minh. Health Connect là người bạn đồng hành đáng tin cậy của mỗi trường học trên hành trình kiến tạo môi trường học đường an toàn, lành mạnh - nơi sức khỏe thể chất và tinh thần của học sinh luôn được đặt lên hàng đầu.

          </p>
          <ul className="intro-features">
            <li><i className="fas fa-check-circle"></i> Đội ngũ y bác sĩ chuyên môn cao</li>
            <li><i className="fas fa-check-circle"></i> Hệ thống quản lý hồ sơ y tế hiện đại</li>
            <li><i className="fas fa-check-circle"></i> Bảo mật thông tin cá nhân tuyệt đối</li>
            <li><i className="fas fa-check-circle"></i> Tiếp cận dịch vụ y tế mọi lúc, mọi nơi</li>
          </ul>
          <a href="/about" className="btn-primary-outline">Tìm hiểu thêm</a>
        </div>
        <div className="intro-img-container">
          <img src="https://img.freepik.com/free-photo/medical-workers-covid-19-vaccination-concept-confident-professional-doctor-female-nurse-blue-scrubs-stethoscope-show-thumbs-up-assure-guarantee-best-quality-service-clinic_1258-57360.jpg"
            alt="Healthcare professionals"
            className="intro-img" />
        </div>
      </section>      <section id="contact" className="cta-section">
        <div className="cta-content">
          <h2>Bạn cần tư vấn y tế?</h2>
          <p>Đội ngũ y bác sĩ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
          <button className="cta-button">Liên hệ ngay</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
