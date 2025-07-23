import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import healthRecordService from '../services/healthRecordService';
import './HealthRecord.css';

const HealthRecord = () => {
  const navigate = useNavigate();
  const { user, getUserRole } = useAuth();
  const [healthRecords, setHealthRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Thêm state cho bộ lọc nâng cao (giống HealthCheckManagement)
  const [filters, setFilters] = useState({
    recordDate: '',
    className: '',
    studentName: '',
    healthStatus: ''
  });
  
  // State cho danh sách lớp và options
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  const [formData, setFormData] = useState({
    healthRecordID: '',
    studentID: '',
    parentID: '',
    allergies: '',
    chronicDiseases: '',
    treatmentHistory: '',
    eyesight: '',
    hearing: '',
    vaccinationHistory: '',
    note: '',
    parentContact: '',
    fullName: '',
    className: ''
  });

  // Load danh sách lớp (giống HealthCheckManagement)
  useEffect(() => {
    apiClient.get('/SchoolClass')
      .then(res => {
        const classes = res.data.map(cls => ({
          ClassID: cls.ClassID || cls.classID || cls.id,
          ClassName: cls.ClassName || cls.className || cls.name
        }));
        setAvailableClasses(classes);
      })
      .catch(() => setAvailableClasses([]));
  }, []);

  // Load danh sách học sinh
  useEffect(() => {
    apiClient.get('/User/students')
      .then(res => {
        setAvailableStudents(res.data || []);
      })
      .catch(() => setAvailableStudents([]));
  }, []);

  // Filtered records với useMemo để tối ưu performance
  const filteredRecords = useMemo(() => {
    return healthRecords.filter(record => {
      const matchDate = !filters.recordDate || 
        new Date(record.recordDate).toISOString().split('T')[0] === filters.recordDate;
      const matchClass = !filters.className || 
        record.className === filters.className || record.childClass === filters.className;
      const matchStudent = !filters.studentName || 
        (record.childName && record.childName.toLowerCase().includes(filters.studentName.toLowerCase()));
      const matchHealthStatus = !filters.healthStatus || 
        record.healthStatus === filters.healthStatus;
      const matchStatus = filterStatus === 'all' || record.status === filterStatus;
      
      return matchDate && matchClass && matchStudent && matchHealthStatus && matchStatus;
    });
  }, [healthRecords, filters, filterStatus]);

  // Helper functions
  const getClassName = (record) => {
    return record.className || record.childClass || '---';
  };

  const handleApplyFilters = () => {
    // Trigger re-render with current filters
    setHealthRecords([...healthRecords]);
  };

  const handleResetFilters = () => {
    setFilters({
      recordDate: '',
      className: '',
      studentName: '',
      healthStatus: ''
    });
    setFilterStatus('all');
    setSelectedChild('');
  };

  const handleExportToExcel = () => {
    // TODO: Implement export functionality
    alert('Chức năng xuất Excel đang được phát triển');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRole = getUserRole();
        let records = [];
        let childrenData = [];

        if (userRole === 'Parent') {
          // Phụ huynh: Lấy danh sách con và hồ sơ sức khỏe của các con
          const childrenRes = await healthRecordService.getChildrenByParent(user.userID);
          childrenData = childrenRes.data;
          setChildren(childrenData);

          if (childrenData.length > 0) {
            // Lấy hồ sơ của tất cả các con
            const recordPromises = childrenData.map(child =>
              healthRecordService.getHealthRecordsByStudent(child.studentID)
            );
            const recordsRes = await Promise.all(recordPromises);
            records = recordsRes.flatMap(res => res.data);
          }
        } else if (userRole === 'MedicalStaff') {
          // Nhân viên y tế: Lấy tất cả hồ sơ
          const params = new URLSearchParams();
          if (selectedChild) params.append('studentId', selectedChild);
          if (filterStatus !== 'all') params.append('status', filterStatus);

          const recordsRes = await healthRecordService.getAllHealthRecords(params);
          records = recordsRes.data;
          
          // Lấy danh sách tất cả học sinh để lọc
          const childrenRes = await apiClient.get('/User/students'); 
          childrenData = childrenRes.data;
          setChildren(childrenData);
        }
        
        setHealthRecords(records);
      } catch (error) {
        console.error('Error fetching data:', error);
        setHealthRecords([]);
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getUserRole, selectedChild, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return '#3182ce';
      case 'Under Review':
        return '#d69e2e';
      case 'Approved':
        return '#38a169';
      case 'Rejected':
        return '#e53e3e';
      default:
        return '#718096';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Submitted':
        return 'Đã gửi';
      case 'Under Review':
        return 'Đang xem xét';
      case 'Approved':
        return 'Đã phê duyệt';
      case 'Rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'Good':
        return '#38a169';
      case 'Fair':
        return '#d69e2e';
      case 'Poor':
        return '#e53e3e';
      default:
        return '#718096';
    }
  };

  const getSymptomCount = (record) => {
    // Count symptoms based on record properties
    const symptoms = [
      record.hasFever, record.hasCough, record.hasShortnessOfBreath,
      record.hasFatigue, record.hasLossOfTaste, record.hasLossOfSmell,
      record.hasSoreThroat, record.hasHeadache, record.hasMusclePain,
      record.hasDiarrhea, record.hasNausea, record.hasVomiting,
      record.hasRunnyNose, record.hasCongestion, record.hasChills,
      record.hasBodyAches
    ];
    return symptoms.filter(Boolean).length;
  };

  const handleCreateRecord = () => {
    setFormData({
      healthRecordID: '',
      studentID: '',
      parentID: '',
      allergies: '',
      chronicDiseases: '',
      treatmentHistory: '',
      eyesight: '',
      hearing: '',
      vaccinationHistory: '',
      note: '',
      parentContact: '',
      fullName: '',
      className: ''
    });
    setShowCreateModal(true);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleEditRecord = (record) => {
    setFormData({
      healthRecordID: record.healthRecordID || record.id,
      studentID: record.studentID,
      allergies: record.allergies || '',
      chronicDiseases: record.chronicDiseases || '',
      treatmentHistory: record.treatmentHistory || '',
      eyesight: record.eyesight || '',
      hearing: record.hearing || '',
      vaccinationHistory: record.vaccinationHistory || '',
      note: record.note || '',
      parentContact: record.parentContact || '',
      fullName: record.childName || '',
      className: getClassName(record)
    });
    setShowCreateModal(true);
  };

  const handleApproveRecord = async (record) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt hồ sơ này?')) {
      try {
        await healthRecordService.updateHealthRecordStatus(record.healthRecordID || record.id, 'Approved');
        alert('Đã phê duyệt hồ sơ thành công!');
        // Refresh data
        window.location.reload();
      } catch (error) {
        console.error('Error approving record:', error);
        alert('Có lỗi xảy ra khi phê duyệt hồ sơ.');
      }
    }
  };

  const handleRejectRecord = async (record) => {
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (reason) {
      try {
        await healthRecordService.updateHealthRecordStatus(record.healthRecordID || record.id, 'Rejected', reason);
        alert('Đã từ chối hồ sơ thành công!');
        // Refresh data
        window.location.reload();
      } catch (error) {
        console.error('Error rejecting record:', error);
        alert('Có lỗi xảy ra khi từ chối hồ sơ.');
      }
    }
  };

  const handleSubmitRecord = async () => {
    try {
      if (formData.healthRecordID) {
        // Update existing record
        await healthRecordService.updateHealthRecord(formData.healthRecordID, formData);
        alert('Cập nhật hồ sơ thành công!');
      } else {
        // Create new record
        await healthRecordService.createHealthRecord({
          ...formData,
          parentID: user.userID,
          status: 'Submitted'
        });
        alert('Tạo hồ sơ thành công!');
      }
      setShowCreateModal(false);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Có lỗi xảy ra khi lưu hồ sơ.');
    }
  };

  const handleHealthRecordFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // 1. Gọi API lấy profile theo họ tên và lớp
      const profileRes = await apiClient.get('/Profile/search', {
        params: { name: formData.fullName, class: formData.className }
      });
      const studentProfile = profileRes.data;
      if (!studentProfile) {
        alert('Không tìm thấy học sinh với thông tin đã cung cấp.');
        setLoading(false);
        return;
      }

      // 2. Tạo bản ghi sức khỏe mới
      const newRecord = {
        studentID: studentProfile.userID,
        parentID: user.userID,
        allergies: formData.allergies,
        chronicDiseases: formData.chronicDiseases,
        treatmentHistory: formData.treatmentHistory,
        eyesight: formData.eyesight,
        hearing: formData.hearing,
        vaccinationHistory: formData.vaccinationHistory,
        note: formData.note,
        parentContact: formData.parentContact,
        status: 'Submitted'
      };

      await healthRecordService.createHealthRecord(newRecord);
      alert('Gửi thông tin sức khỏe thành công!');
      
      // 3. Reset form và tải lại dữ liệu
      setFormData({
        healthRecordID: '',
        studentID: '',
        parentID: '',
        allergies: '',
        chronicDiseases: '',
        treatmentHistory: '',
        eyesight: '',
        hearing: '',
        vaccinationHistory: '',
        note: '',
        parentContact: '',
        fullName: '',
        className: ''
      });
      window.location.reload();

    } catch (error) {
      console.error('Error submitting health record:', error);
      alert('Có lỗi xảy ra khi gửi thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>;
  }

  // Giao diện cho phụ huynh
  if (getUserRole() === 'Parent') {
    return (
      <div className="health-record-container parent-view">
        <h1 className="main-title">Khai báo sức khỏe hàng ngày</h1>
        <p className="sub-title">Vui lòng chọn tên con và cập nhật thông tin sức khỏe</p>

        {/* Form khai báo */}
        <div className="daily-declaration-form">
          <form onSubmit={handleHealthRecordFormSubmit}>
            <div className="form-grid">
              {/* Child Info */}
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên học sinh</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName ?? ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="className">Lớp</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={formData.className ?? ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Health Details */}
              <div className="form-group">
                <label htmlFor="allergies">Dị ứng</label>
                <input type="text" id="allergies" name="allergies" value={formData.allergies ?? ""} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="chronicDiseases">Bệnh mãn tính</label>
                <input type="text" id="chronicDiseases" name="chronicDiseases" value={formData.chronicDiseases ?? ""} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="treatmentHistory">Lịch sử điều trị</label>
                <input type="text" id="treatmentHistory" name="treatmentHistory" value={formData.treatmentHistory ?? ""} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="eyesight">Thị lực</label>
                <input type="text" id="eyesight" name="eyesight" value={formData.eyesight ?? ""} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="hearing">Thính lực</label>
                <input type="text" id="hearing" name="hearing" value={formData.hearing ?? ""} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="vaccinationHistory">Lịch sử tiêm chủng</label>
                <input type="text" id="vaccinationHistory" name="vaccinationHistory" value={formData.vaccinationHistory ?? ""} onChange={handleInputChange} />
              </div>

              <div className="form-group full-width">
                <label htmlFor="note">Ghi chú thêm</label>
                <textarea id="note" name="note" value={formData.note ?? ""} onChange={handleInputChange}></textarea>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Gửi thông tin</button>
            </div>
          </form>
        </div>

        {/* Danh sách đã khai báo */}
        <div className="records-list">
          <h2>Lịch sử khai báo</h2>
          {healthRecords.length > 0 ? (
            healthRecords.map(record => (
              <div key={record.healthRecordID} className="record-card">
                <div className="record-header">
                  <span>{record.childName} - {record.childClass}</span>
                  <span>Ngày: {new Date(record.recordDate).toLocaleDateString()}</span>
                  <span className="status" style={{ backgroundColor: getStatusColor(record.status) }}>
                    {getStatusText(record.status)}
                  </span>
                </div>
                <div className="record-body">
                  <p><strong>Ghi chú:</strong> {record.note}</p>
                </div>
              </div>
            ))
          ) : <p>Chưa có lịch sử khai báo.</p>}
        </div>
      </div>
    );
  }

  // Giao diện cho nhân viên y tế (thiết kế giống HealthCheckManagement)
  return (
    <div className="health-record-management-container">
      <div className="container py-4">
        {/* Header với tiêu đề và nút tạo mới */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Tra cứu hồ sơ sức khỏe</h1>
          <div>
            <button className="btn btn-primary" onClick={handleCreateRecord}>
              <i className="fas fa-plus-circle me-2"></i>Tạo hồ sơ mới
            </button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Tổng hồ sơ</h5>
                <p className="card-number">{filteredRecords.length}</p>
                <p className="card-text">Hồ sơ sức khỏe</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đã phê duyệt</h5>
                <p className="card-number">{filteredRecords.filter(record => record.status === 'Approved').length}</p>
                <p className="card-text">Hồ sơ</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đang xem xét</h5>
                <p className="card-number">{filteredRecords.filter(record => record.status === 'Under Review').length}</p>
                <p className="card-text">Hồ sơ</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Cần chú ý</h5>
                <p className="card-number">{filteredRecords.filter(record => getSymptomCount(record) > 3).length}</p>
                <p className="card-text">Triệu chứng nhiều</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc nâng cao */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Lọc danh sách hồ sơ</h5>
            <div className="row">
              <div className="col-md-3 mb-2">
                <input
                  type="date"
                  className="form-control"
                  value={filters.recordDate}
                  onChange={e => setFilters(prev => ({ ...prev, recordDate: e.target.value }))}
                  placeholder="Chọn ngày ghi nhận"
                />
              </div>
              <div className="col-md-3 mb-2">
                <select
                  className="form-select"
                  value={filters.className}
                  onChange={e => setFilters(prev => ({ ...prev, className: e.target.value }))}
                >
                  <option value="">Chọn lớp</option>
                  {availableClasses.map(cls => (
                    <option key={cls.ClassID} value={cls.ClassName}>
                      {cls.ClassName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={filters.studentName}
                  onChange={e => setFilters(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="Tên học sinh"
                />
              </div>
              <div className="col-md-3 mb-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Submitted">Đã gửi</option>
                  <option value="Under Review">Đang xem xét</option>
                  <option value="Approved">Đã phê duyệt</option>
                  <option value="Rejected">Từ chối</option>
                </select>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-12 d-flex align-items-end">
                <button className="btn btn-primary me-2" onClick={handleApplyFilters}>Lọc</button>
                <button className="btn btn-secondary" onClick={handleResetFilters}>Đặt lại</button>
              </div>
            </div>
          </div>
        </div>

        {/* Nút xuất báo cáo */}
        <div className="d-flex justify-content-end mb-3 btn-export-import">
          <button className="btn btn-outline-success me-2" onClick={handleExportToExcel}>
            <i className="fas fa-file-excel me-2"></i>Xuất Excel
          </button>
        </div>

        {/* Danh sách hồ sơ */}
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu hồ sơ sức khỏe...</p>
          </div>
        ) : (
          <div className="records-list">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div key={record.healthRecordID || record.id} className="record-card">
                  <div className="record-header">
                    <div className="record-title">
                      <h3>{record.childName || 'Không rõ tên'}</h3>
                      <span className="record-date">
                        <i className="fas fa-calendar"></i>
                        {record.recordDate ? new Date(record.recordDate).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <div className="record-meta">
                      <span className="record-class"><b>Lớp:</b> {getClassName(record)}</span>
                      <span className="record-status">
                        <b>Trạng thái:</b> 
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(record.status), color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '5px' }}>
                          {getStatusText(record.status)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="record-content">
                    <div className="record-description">
                      <div className="row">
                        <div className="col-md-6">
                          <b>Tình trạng sức khỏe:</b> 
                          <span className="health-status-badge" style={{ backgroundColor: getHealthStatusColor(record.healthStatus), color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '5px' }}>
                            {record.healthStatus || 'Chưa đánh giá'}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <b>Số triệu chứng:</b> {getSymptomCount(record)}
                          {getSymptomCount(record) > 3 && <i className="fas fa-exclamation-triangle text-warning ms-2"></i>}
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-md-12">
                          <b>Ghi chú:</b> {record.note || 'Không có ghi chú'}
                        </div>
                      </div>
                    </div>
                    <div className="record-actions mt-2">
                      <button className="btn btn-info btn-sm me-2" onClick={() => handleViewDetails(record)}>
                        <i className="fas fa-eye"></i> Xem chi tiết
                      </button>
                      <button className="btn btn-secondary btn-sm me-2" onClick={() => handleEditRecord(record)}>
                        <i className="fas fa-edit"></i> Chỉnh sửa
                      </button>
                      {record.status === 'Submitted' && (
                        <>
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleApproveRecord(record)}>
                            <i className="fas fa-check"></i> Phê duyệt
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRejectRecord(record)}>
                            <i className="fas fa-times"></i> Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results text-center my-5">
                <i className="fas fa-file-medical fa-3x mb-3" style={{color:'#bdbdbd'}}></i>
                <p>Không tìm thấy hồ sơ sức khỏe nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal chi tiết hồ sơ */}
      {showDetailsModal && selectedRecord && (
        <div className="modal show d-block" tabIndex="-1" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>
                  <i className="fas fa-file-medical"></i> Chi tiết hồ sơ sức khỏe
                </h3>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h5>Thông tin học sinh</h5>
                    <p><strong>Họ tên:</strong> {selectedRecord.childName}</p>
                    <p><strong>Lớp:</strong> {getClassName(selectedRecord)}</p>
                    <p><strong>Ngày ghi nhận:</strong> {selectedRecord.recordDate ? new Date(selectedRecord.recordDate).toLocaleDateString('vi-VN') : ''}</p>
                  </div>
                  <div className="col-md-6">
                    <h5>Tình trạng sức khỏe</h5>
                    <p><strong>Dị ứng:</strong> {selectedRecord.allergies || 'Không có'}</p>
                    <p><strong>Bệnh mãn tính:</strong> {selectedRecord.chronicDiseases || 'Không có'}</p>
                    <p><strong>Thị lực:</strong> {selectedRecord.eyesight || 'Bình thường'}</p>
                    <p><strong>Thính lực:</strong> {selectedRecord.hearing || 'Bình thường'}</p>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-12">
                    <h5>Ghi chú</h5>
                    <p>{selectedRecord.note || 'Không có ghi chú'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Đóng
                </button>
                {selectedRecord.status === 'Submitted' && (
                  <>
                    <button type="button" className="btn btn-success" onClick={() => handleApproveRecord(selectedRecord)}>
                      Phê duyệt
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleRejectRecord(selectedRecord)}>
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo/chỉnh sửa hồ sơ */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Tạo hồ sơ sức khỏe mới</h3>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitRecord}>
                  <div className="mb-3">
                    <label className="form-label">Học sinh</label>
                    <select 
                      className="form-select" 
                      value={formData.studentID}
                      onChange={e => setFormData(prev => ({ ...prev, studentID: e.target.value }))}
                      required
                    >
                      <option value="">Chọn học sinh</option>
                      {availableStudents.map(student => (
                        <option key={student.userID} value={student.userID}>
                          {student.fullName} - {student.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dị ứng</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formData.allergies}
                      onChange={e => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={formData.note}
                      onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitRecord}>
                  Tạo hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecord;
