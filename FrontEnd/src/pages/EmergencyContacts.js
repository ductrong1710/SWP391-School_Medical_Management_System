import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmergencyContacts.css';
import apiClient from '../services/apiClient';

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const { getUserRole } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      const userRole = getUserRole();
      if (userRole !== 'Student') {
        navigate('/dashboard');
        return;
      }
      // Gọi API backend lấy emergency contacts
      // const response = await apiClient.get('/EmergencyContacts');
      // setEmergencyContacts(response.data);
      // Tạm thời dùng mock nếu API chưa có
      setEmergencyContacts(getMockEmergencyContacts());
    } catch (error) {
      setEmergencyContacts(getMockEmergencyContacts());
    } finally {
      setLoading(false);
    }
  };

  const getMockEmergencyContacts = () => {
    return [
      {
        id: 1,
        name: 'Phòng Y tế Trường học',
        type: 'Medical',
        phone: '028-1234-5678',
        email: 'yte@school.edu.vn',
        address: 'Tầng 1, Tòa nhà A, Trường THPT Nguyễn Du',
        description: 'Phòng y tế chính của trường, cung cấp dịch vụ sơ cứu và tư vấn sức khỏe',
        availability: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
        priority: 'High',
        services: ['Sơ cứu', 'Tư vấn sức khỏe', 'Khám sức khỏe định kỳ', 'Quản lý thuốc']
      },
      {
        id: 2,
        name: 'Bệnh viện Nhi đồng 1',
        type: 'Hospital',
        phone: '028-3927-1119',
        email: 'info@benhviennhi.org.vn',
        address: '341 Sư Vạn Hạnh, Phường 10, Quận 10, TP.HCM',
        description: 'Bệnh viện chuyên khoa nhi hàng đầu tại TP.HCM',
        availability: '24/7',
        priority: 'High',
        services: ['Cấp cứu', 'Khám bệnh', 'Điều trị nội trú', 'Phẫu thuật']
      },
      {
        id: 3,
        name: 'Bệnh viện Nhi đồng 2',
        type: 'Hospital',
        phone: '028-3898-9133',
        email: 'contact@benhviennhi2.org.vn',
        address: '14 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP.HCM',
        description: 'Bệnh viện nhi đồng uy tín tại trung tâm TP.HCM',
        availability: '24/7',
        priority: 'High',
        services: ['Cấp cứu', 'Khám bệnh', 'Điều trị nội trú', 'Chuyên khoa tim mạch']
      },
      {
        id: 4,
        name: 'Trung tâm Y tế Dự phòng Quận 1',
        type: 'Preventive',
        phone: '028-3822-4567',
        email: 'ytdpq1@tphcm.gov.vn',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        description: 'Trung tâm y tế dự phòng cung cấp dịch vụ tiêm chủng và phòng bệnh',
        availability: 'Thứ 2 - Thứ 6: 7:30 - 16:30',
        priority: 'Medium',
        services: ['Tiêm chủng', 'Khám sức khỏe', 'Tư vấn dinh dưỡng', 'Phòng chống dịch bệnh']
      },
      {
        id: 5,
        name: 'Phòng khám Đa khoa Quốc tế',
        type: 'Clinic',
        phone: '028-3910-1234',
        email: 'info@phongkhamquocte.com',
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        description: 'Phòng khám đa khoa cung cấp dịch vụ khám bệnh chất lượng cao',
        availability: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
        priority: 'Medium',
        services: ['Khám bệnh', 'Xét nghiệm', 'Chẩn đoán hình ảnh', 'Tư vấn dinh dưỡng']
      },
      {
        id: 6,
        name: 'Cấp cứu 115',
        type: 'Emergency',
        phone: '115',
        email: '',
        address: 'Toàn quốc',
        description: 'Số điện thoại cấp cứu quốc gia',
        availability: '24/7',
        priority: 'Critical',
        services: ['Cấp cứu khẩn cấp', 'Vận chuyển bệnh nhân', 'Hỗ trợ y tế']
      }
    ];
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Emergency':
        return '#e53e3e';
      case 'Hospital':
        return '#3182ce';
      case 'Medical':
        return '#38a169';
      case 'Clinic':
        return '#d69e2e';
      case 'Preventive':
        return '#805ad5';
      default:
        return '#718096';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'Emergency':
        return 'Cấp cứu';
      case 'Hospital':
        return 'Bệnh viện';
      case 'Medical':
        return 'Y tế trường';
      case 'Clinic':
        return 'Phòng khám';
      case 'Preventive':
        return 'Y tế dự phòng';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#e53e3e';
      case 'High':
        return '#d69e2e';
      case 'Medium':
        return '#3182ce';
      case 'Low':
        return '#38a169';
      default:
        return '#718096';
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleEmail = (email) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  };

  const handleMap = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <div className="emergency-contacts-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="emergency-contacts-container">
      <div className="contacts-header">
        <h1>Liên hệ khẩn cấp</h1>
        <p>Thông tin liên hệ khẩn cấp và hướng dẫn khi cần hỗ trợ y tế</p>
      </div>

      {/* Emergency Alert */}
      <div className="emergency-alert">
        <div className="alert-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <div className="alert-content">
          <h3>Trong trường hợp khẩn cấp</h3>
          <p>Gọi ngay số <strong>115</strong> hoặc liên hệ phòng y tế trường học</p>
          <button 
            className="emergency-call-btn"
            onClick={() => handleCall('115')}
          >
            <i className="fas fa-phone"></i>
            Gọi 115 ngay
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Hành động nhanh</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => handleCall('028-1234-5678')}>
            <div className="action-icon">
              <i className="fas fa-hospital"></i>
            </div>
            <h3>Phòng Y tế Trường</h3>
            <p>Liên hệ phòng y tế trường học</p>
          </div>
          
          <div className="action-card" onClick={() => handleCall('115')}>
            <div className="action-icon emergency">
              <i className="fas fa-ambulance"></i>
            </div>
            <h3>Cấp cứu 115</h3>
            <p>Gọi cấp cứu khẩn cấp</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/medical-history')}>
            <div className="action-icon">
              <i className="fas fa-file-medical"></i>
            </div>
            <h3>Hồ sơ Y tế</h3>
            <p>Xem hồ sơ sức khỏe của bạn</p>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="contacts-section">
        <h2>Danh sách liên hệ</h2>
        <div className="contacts-grid">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="contact-card" onClick={() => handleContactClick(contact)}>
              <div className="contact-header">
                <div className="contact-title">
                  <h3>{contact.name}</h3>
                  <div className="contact-badges">
                    <span 
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(contact.type) }}
                    >
                      {getTypeText(contact.type)}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(contact.priority) }}
                    >
                      {contact.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="contact-content">
                <div className="contact-info">
                  <div className="info-item">
                    <i className="fas fa-phone"></i>
                    <span>{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="info-item">
                      <i className="fas fa-envelope"></i>
                      <span>{contact.email}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{contact.address}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>{contact.availability}</span>
                  </div>
                </div>

                <div className="contact-description">
                  <p>{contact.description}</p>
                </div>

                <div className="contact-services">
                  <h4>Dịch vụ:</h4>
                  <div className="services-list">
                    {contact.services.map((service, index) => (
                      <span key={index} className="service-tag">{service}</span>
                    ))}
                  </div>
                </div>

                <div className="contact-actions">
                  <button 
                    className="call-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(contact.phone);
                    }}
                  >
                    <i className="fas fa-phone"></i>
                    Gọi
                  </button>
                  
                  {contact.email && (
                    <button 
                      className="email-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmail(contact.email);
                      }}
                    >
                      <i className="fas fa-envelope"></i>
                      Email
                    </button>
                  )}
                  
                  <button 
                    className="map-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMap(contact.address);
                    }}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    Bản đồ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details Modal */}
      {showContactModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedContact.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowContactModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-details">
                <div className="detail-section">
                  <h4>Thông tin liên hệ</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedContact.phone}</span>
                    </div>
                    {selectedContact.email && (
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{selectedContact.email}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <label>Địa chỉ:</label>
                      <span>{selectedContact.address}</span>
                    </div>
                    <div className="detail-item">
                      <label>Giờ làm việc:</label>
                      <span>{selectedContact.availability}</span>
                    </div>
                    <div className="detail-item">
                      <label>Loại:</label>
                      <span>{getTypeText(selectedContact.type)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Mức độ ưu tiên:</label>
                      <span>{selectedContact.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Mô tả</h4>
                  <p>{selectedContact.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Dịch vụ cung cấp</h4>
                  <div className="services-grid">
                    {selectedContact.services.map((service, index) => (
                      <div key={index} className="service-item">
                        <i className="fas fa-check"></i>
                        {service}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="call-btn"
                onClick={() => handleCall(selectedContact.phone)}
              >
                <i className="fas fa-phone"></i>
                Gọi ngay
              </button>
              
              {selectedContact.email && (
                <button 
                  className="email-btn"
                  onClick={() => handleEmail(selectedContact.email)}
                >
                  <i className="fas fa-envelope"></i>
                  Gửi email
                </button>
              )}
              
              <button 
                className="map-btn"
                onClick={() => handleMap(selectedContact.address)}
              >
                <i className="fas fa-map-marker-alt"></i>
                Xem bản đồ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts; 