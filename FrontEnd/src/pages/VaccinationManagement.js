import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import './VaccinationManagement.css';

// Đưa các hàm export ra ngoài component
export const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return '#3182ce';
    case 'Completed':
      return '#38a169';
    case 'Cancelled':
      return '#e53e3e';
    case 'Pending':
      return '#d69e2e';
    default:
      return 'gray';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'Active':
      return 'Đang thực hiện';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    case 'Pending':
      return 'Chờ thực hiện';
    default:
      return 'Không xác định';
  }
};

const VaccinationManagement = () => {
  const navigate = useNavigate();
  const { getUserRole } = useAuth();
  const [vaccinationPlans, setVaccinationPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    PlanName: '',
    ScheduledDate: '',
    Description: '',
    Status: 'Active',
    Grade: 'Toàn trường',
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    PlanName: '',
    ScheduledDate: '',
    Description: '',
    Status: '',
    Grade: 'Toàn trường',
  });
  const [vaccineList, setVaccineList] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [planToNotify, setPlanToNotify] = useState(null);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [addVaccineData, setAddVaccineData] = useState({ VaccineName: '', Description: '' });
  const [addVaccineLoading, setAddVaccineLoading] = useState(false);
  const [showVaccineManager, setShowVaccineManager] = useState(false);
  const [editVaccineId, setEditVaccineId] = useState(null);
  const [editVaccineData, setEditVaccineData] = useState({ VaccineName: '', Description: '' });
  const [deleteVaccineId, setDeleteVaccineId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const gradeOptions = ['Toàn trường', '6', '7', '8', '9'];
  const [formError, setFormError] = useState('');
  const [vaccineError, setVaccineError] = useState('');

  // Thống kê
  const totalStudents = vaccinationPlans.reduce((sum, plan) => sum + (plan.totalStudents || 0), 0);
  const completed = vaccinationPlans.reduce((sum, plan) => sum + (plan.completedStudents || 0), 0);
  const pending = vaccinationPlans.reduce((sum, plan) => sum + (plan.pendingStudents || 0), 0);
  const totalRounds = vaccinationPlans.length;

  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [showDateErrorModal, setShowDateErrorModal] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState('');

  // Thêm debug log vào đầu component
  console.log('formError:', formError);
  console.log('vaccineError:', vaccineError);

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    if (showCreateModal) {
      apiClient.get('/VaccineType').then(res => {
        setVaccineList(res.data);
      });
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (showEditModal && vaccineList.length === 0) {
      apiClient.get('/VaccineType').then(res => {
        setVaccineList(res.data);
      });
    }
  }, [showEditModal]);

  useEffect(() => {
    if (notifyMessage && notifyMessage.includes('Thêm vaccine thành công')) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [notifyMessage]);

  // Fetch plans with correct mapping
  const fetchData = async () => {
    setLoading(true);
    try {
      const userRole = getUserRole();
      if (userRole !== 'MedicalStaff') {
        navigate('/dashboard');
        return;
      }
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      const plansResponse = await apiClient.get(`/VaccinationPlan?${params.toString()}`);
      // Map backend fields to FE fields if needed
      setVaccinationPlans((plansResponse.data || []).map(plan => ({
        id: plan.ID || plan.id,
        PlanName: plan.PlanName,
        status: plan.Status || plan.status,
        scheduledDate: plan.ScheduledDate || plan.scheduledDate,
        description: plan.Description || plan.description,
        grade: plan.Grade || plan.grade,
        totalStudents: plan.TotalStudents || plan.totalStudents,
        completedStudents: plan.CompletedStudents || plan.completedStudents,
        pendingStudents: plan.PendingStudents || plan.pendingStudents,
        confirmedCount: plan.ConfirmedCount || plan.confirmedCount,
        pendingCount: plan.PendingCount || plan.pendingCount,
        completedCount: plan.CompletedCount || plan.completedCount,
        ConsentForms: plan.ConsentForms || plan.consentForms,
        targetClass: plan.TargetClass || plan.targetClass,
        creatorID: plan.CreatorID || plan.creatorID,
      })));
    } catch (err) {
      setVaccinationPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Create plan with correct mapping and error handling
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Lấy user đúng key
    const userStr = localStorage.getItem('user');
    let user = null;
    try { user = JSON.parse(userStr); } catch {}
    const CreatorID = user?.userID || user?.UserID || '';
    if (!formData.PlanName || !CreatorID) {
      setFormError('login');
      setLoading(false);
      return; // KHÔNG đóng modal khi lỗi
    }
    if (formData.ScheduledDate) {
      const selectedDate = new Date(formData.ScheduledDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        setFormError('date');
        setLoading(false);
        return; // KHÔNG đóng modal khi lỗi
      }
    }
    try {
      await apiClient.post('/VaccinationPlan', { ...formData, CreatorID });
      setShowCreateModal(false);
      setFormError('');
      fetchData();
    } catch (error) {
      setFormError('api');
      setLoading(false);
      // KHÔNG đóng modal khi lỗi
    }
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenNotifyModal = (plan) => {
    setPlanToNotify(plan);
    setShowConfirmModal(true);
    setNotifyMessage('');
  };

  const handleSendNotificationsConfirmed = async () => {
    if (!planToNotify) return;
    setNotifyLoading(true);
    setNotifyMessage('');
    try {
      await apiClient.post(`/VaccinationPlan/${planToNotify.id}/send-notifications`);
      setNotifyMessage('Gửi thông báo thành công!');
      setTimeout(() => {
        setShowConfirmModal(false);
        setPlanToNotify(null);
        setNotifyMessage('');
      }, 1200);
    } catch (error) {
      setNotifyMessage('Gửi thông báo thất bại!');
    } finally {
      setNotifyLoading(false);
    }
  };

  const normalize = str => (str || '').toLowerCase().replace(/\s+/g, ' ').trim();

  const handleEditPlan = (plan) => {
    console.log('plan object:', plan);
    const setEditData = (vaccineListData) => {
      console.log('plan.planName:', plan.PlanName);
      console.log('vaccineList:', vaccineListData.map(v => v.vaccineName || v.VaccineName));
      let matchedVaccine = '';
      if (vaccineListData.length > 0) {
        const found = vaccineListData.find(
          v => normalize(v.vaccineName || v.VaccineName) === normalize(plan.PlanName)
        );
        matchedVaccine = found ? (found.vaccineName || found.VaccineName) : plan.PlanName;
      } else {
        matchedVaccine = plan.PlanName;
      }
      setEditFormData({
        id: plan.id,
        PlanName: matchedVaccine,
        ScheduledDate: plan.scheduledDate ? plan.scheduledDate.slice(0, 10) : '',
        Description: plan.description,
        Status: plan.status,
        Grade: plan.grade || 'Toàn trường',
      });
      setShowEditModal(true);
    };

    if (vaccineList.length === 0) {
      apiClient.get('/VaccineType').then(res => {
        setVaccineList(res.data);
        setEditData(res.data);
      });
    } else {
      setEditData(vaccineList);
    }
  };

  // Update plan with correct mapping and error handling
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let CreatorID = selectedPlan?.creatorID || selectedPlan?.CreatorID || '';
      if (!CreatorID) {
        const user = JSON.parse(localStorage.getItem('user'));
        CreatorID = user?.userID || user?.UserID || '';
      }
      if (Array.isArray(CreatorID)) {
        CreatorID = CreatorID[0] || '';
      }
      await apiClient.put(`/VaccinationPlan/${editFormData.id}`, {
        ID: editFormData.id,
        PlanName: editFormData.PlanName,
        ScheduledDate: editFormData.ScheduledDate ? new Date(editFormData.ScheduledDate).toISOString() : null,
        Description: editFormData.Description,
        Status: editFormData.Status,
        CreatorID,
        Grade: editFormData.Grade,
      });
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      let msg = 'Có lỗi khi cập nhật kế hoạch!';
      if (error.response && error.response.data) {
        msg = typeof error.response.data === 'string' ? error.response.data : (error.response.data.message || msg);
      }
      setNotifyMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Thêm vaccine
  const handleAddVaccineInputChange = (e) => {
    const { name, value } = e.target;
    setAddVaccineData(prev => ({ ...prev, [name]: value }));
  };

  // Add vaccine with correct mapping and error handling
  const handleAddVaccine = async (e) => {
    e.preventDefault();
    setAddVaccineLoading(true);
    setNotifyMessage('');
    try {
      if (!addVaccineData.VaccineName || !addVaccineData.Description) {
        setNotifyMessage('Vui lòng nhập đầy đủ tên vaccine và mô tả!');
        setAddVaccineLoading(false);
        return;
      }
      await apiClient.post('/VaccineType', {
        VaccineName: addVaccineData.VaccineName,
        Description: addVaccineData.Description
      });
      setShowAddVaccineModal && setShowAddVaccineModal(false);
      setAddVaccineData({ VaccineName: '', Description: '' });
      const res = await apiClient.get('/VaccineType');
      setVaccineList(res.data);
      setNotifyMessage('Thêm vaccine thành công!');
    } catch (err) {
      let msg = 'Có lỗi khi thêm vaccine!';
      if (err.response && err.response.data) {
        msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
      }
      setNotifyMessage(msg);
    } finally {
      setAddVaccineLoading(false);
    }
  };

  // Quản lý vaccine
  const openVaccineManager = async () => {
    setShowVaccineManager(true);
    try {
      const res = await apiClient.get('/VaccineType');
      setVaccineList(res.data);
    } catch {}
  };
  const closeVaccineManager = () => {
    setShowVaccineManager(false);
    setEditVaccineId(null);
    setEditVaccineData({ VaccineName: '', Description: '' });
    setDeleteVaccineId(null);
    setVaccineError(''); // reset lỗi khi đóng modal
  };
  const handleEditVaccineClick = (v) => {
    setEditVaccineId(v.vaccinationID || v.VaccinationID);
    setEditVaccineData({ VaccineName: v.vaccineName || v.VaccineName, Description: v.description || v.Description });
  };
  const handleEditVaccineInputChange = (e) => {
    const { name, value } = e.target;
    setEditVaccineData(prev => ({ ...prev, [name]: value }));
  };
  // Edit vaccine with correct mapping and error handling
  const handleEditVaccineSave = async (id) => {
    try {
      await apiClient.put(`/VaccineType/${id}`, {
        VaccinationID: id,
        VaccineName: editVaccineData.VaccineName,
        Description: editVaccineData.Description
      });
      const res = await apiClient.get('/VaccineType');
      setVaccineList(res.data);
      setEditVaccineId(null);
      setNotifyMessage('Cập nhật vaccine thành công!');
    } catch (err) {
      let msg = 'Có lỗi khi cập nhật vaccine!';
      if (err.response && err.response.data) {
        msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
      }
      setNotifyMessage(msg);
    }
  };
  // Delete vaccine with correct mapping and error handling
  const handleDeleteVaccine = async (id) => {
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/VaccineType/${id}`);
      const res = await apiClient.get('/VaccineType');
      setVaccineList(res.data);
      setNotifyMessage('Xóa vaccine thành công!');
      setDeleteVaccineId(null); // chỉ đóng modal xác nhận khi thành công
      setVaccineError(''); // reset lỗi khi thành công
    } catch (err) {
      let msg = 'Có lỗi khi xóa vaccine!';
      if (err.response && err.response.data) {
        msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
      }
      setVaccineError(msg); // set lỗi API
      // KHÔNG đóng modal quản lý vaccine khi lỗi
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Giao diện chính ---
  return (
    <div className="vaccination-management-container">
      <div className="vaccination-header">
        <h1>Quản lý tiêm chủng</h1>
        <p>Lên kế hoạch và quản lý tiêm chủng cho học sinh</p>
        <h2 style={{fontSize: 20, marginTop: 8}}>Kế hoạch tiêm chủng</h2>
        {notifyMessage && <div className="notification-message">{notifyMessage}</div>}
      </div>

      {/* Thống kê */}
      <div className="row mb-4" style={{marginTop: 16}}>
        <div className="col-md-3">
          <div className="card health-stat-card">
            <div className="card-body">
              <h5 className="card-title">Tổng số học sinh</h5>
              <p className="card-number" data-testid="total-students">{totalStudents}</p>
              <p className="card-text">Đã đăng ký tiêm</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card health-stat-card">
            <div className="card-body">
              <h5 className="card-title">Đã tiêm</h5>
              <p className="card-number" data-testid="completed-students">{completed}</p>
              <p className="card-text">Học sinh</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card health-stat-card">
            <div className="card-body">
              <h5 className="card-title">Chờ tiêm</h5>
              <p className="card-number" data-testid="pending-students">{pending}</p>
              <p className="card-text">Học sinh</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card health-stat-card">
            <div className="card-body">
              <h5 className="card-title">Đợt tiêm</h5>
              <p className="card-number" data-testid="total-rounds">{totalRounds.toString().padStart(2, '0')}</p>
              <p className="card-text">Năm học hiện tại</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên vaccine hoặc mô tả..."
            value={searchTerm ?? ""}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterStatus ?? ""}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Active">Đang thực hiện</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
            <option value="Pending">Chờ thực hiện</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="add-vaccine-btn"
            role="button"
            aria-label="Quản lý vaccine"
            data-testid="open-vaccine-manager"
            onClick={openVaccineManager}
            style={{padding: '6px 16px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}
          >
            <i className="fas fa-syringe"></i> Quản lý vaccine
          </button>
          <button 
            className="create-plan-btn"
            role="button"
            aria-label="Tạo kế hoạch tiêm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Tạo kế hoạch tiêm
          </button>
        </div>
      </div>

      {/* Vaccination Plans List */}
      <div className="vaccination-plans-list">
        {vaccinationPlans.map((plan) => (
          <div key={plan.id} className="vaccination-plan-card">
            <div className="plan-header">
              <div className="plan-title">
                <h3>{plan.PlanName}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(plan.status) }}
                >
                  {getStatusText(plan.status)}
                </span>
              </div>
              <div className="plan-date">
                <i className="fas fa-calendar"></i>
                {new Date(plan.scheduledDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="plan-content">
              <div className="plan-description">
                <h4>Mô tả</h4>
                <p>{plan.description}</p>
              </div>

              <div className="plan-target">
                <h4>Đối tượng</h4>
                <p><strong>Khối:</strong> {plan.grade || 'Toàn trường'}</p>
                <p><strong>Lớp:</strong> {plan.targetClass}</p>
              </div>

              <div className="plan-stats">
                <h4>Thống kê</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Tổng học sinh:</span>
                    <span className="stat-value">{plan.totalStudents}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Đã xác nhận:</span>
                    <span className="stat-value confirmed">{plan.confirmedCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Chờ phản hồi:</span>
                    <span className="stat-value pending">{plan.pendingCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Đã tiêm:</span>
                    <span className="stat-value completed">{plan.completedCount}</span>
                  </div>
                </div>
              </div>

              <div className="plan-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDetails(plan)}
                >
                  <i className="fas fa-eye"></i>
                  Xem chi tiết
                </button>
                <button
                  className="edit-btn"
                  role="button"
                  aria-label="Chỉnh sửa"
                  onClick={() => handleEditPlan(plan)}
                >
                  <i className="fas fa-edit"></i>
                  Chỉnh sửa
                </button>
                <button
                  className="send-notifications-btn"
                  role="button"
                  aria-label="Gửi thông báo"
                  onClick={() => handleOpenNotifyModal(plan)}
                  disabled={notifyLoading}
                >
                  <i className="fas fa-bell"></i>
                  Gửi thông báo
                </button>
              </div>
            </div>
          </div>
        ))}

        {vaccinationPlans.length === 0 && !loading && (
          <div className="no-results">
            <i className="fas fa-syringe"></i>
            <p>Không có kế hoạch</p>
          </div>
        )}
      </div>

      {/* --- Các modal đặt ở cuối return, chỉ render khi đủ điều kiện --- */}
      {/* Modal tạo kế hoạch tiêm chủng */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-plan-modal">
            <div className="modal-header">
              <h3>Tạo kế hoạch tiêm chủng mới</h3>
              <button aria-label="Đóng" className="close-btn" role="button" onClick={() => { setShowCreateModal(false); setFormError(''); }}>
                <i className="fas fa-times" />
              </button>
            </div>
            {/* Thông báo lỗi trong modal tạo kế hoạch */}
            {formError === 'date' && (
              <div data-testid="global-date-error" style={{ color: 'red', marginBottom: 8 }}>
                <div>Lỗi ngày dự kiến</div>
                <div>Ngày dự kiến phải lớn hơn hoặc bằng hôm nay!</div>
              </div>
            )}
            {formError === 'login' && (
              <div data-testid="global-login-error" style={{ color: 'red', marginBottom: 8 }}>
                Vui lòng đăng nhập để thực hiện chức năng này.
              </div>
            )}
            {formError && formError !== 'date' && formError !== 'login' && (
              <div className="form-error" style={{ color: 'red', marginBottom: 8 }}>{formError}</div>
            )}
            <form onSubmit={handleCreatePlan}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="planName">Tên kế hoạch (Tên vaccine):</label>
                  <select
                    aria-label="Tên kế hoạch:"
                    id="planName"
                    name="PlanName"
                    required
                    value={formData.PlanName}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn vaccine...</option>
                    {vaccineList.map((v, idx) => (
                      <option key={idx} value={v.vaccineName || v.VaccineName}>{v.vaccineName || v.VaccineName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="scheduledDate">Ngày dự kiến:</label>
                  <input
                    aria-label="Ngày dự kiến:"
                    id="scheduledDate"
                    name="ScheduledDate"
                    required
                    type="date"
                    value={formData.ScheduledDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Mô tả:</label>
                  <textarea
                    aria-label="Mô tả:"
                    id="description"
                    name="Description"
                    placeholder="Mô tả chi tiết về kế hoạch tiêm chủng..."
                    required
                    rows={3}
                    value={formData.Description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Trạng thái:</label>
                  <select
                    aria-label="Trạng thái:"
                    id="status"
                    name="Status"
                    required
                    value={formData.Status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Đang thực hiện</option>
                    <option value="Pending">Chờ thực hiện</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="grade">Khối:</label>
                  <select
                    aria-label="Khối:"
                    id="grade"
                    name="Grade"
                    required
                    value={formData.Grade}
                    onChange={handleInputChange}
                  >
                    {gradeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button aria-label="Hủy" className="cancel-btn" role="button" type="button" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button aria-label="Tạo kế hoạch" className="submit-btn" role="button" type="submit">Tạo kế hoạch</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal quản lý vaccine */}
      {showVaccineManager && (
        <div className="modal-overlay">
          <div className="create-plan-modal" style={{ background: '#f4f8fb', minWidth: 600, maxWidth: 800 }}>
            <div className="modal-header">
              <h3 data-testid="vaccine-manager-title">Quản lý vaccine</h3>
              <button className="close-btn" onClick={closeVaccineManager}><i className="fas fa-times" /></button>
            </div>
            {/* Thông báo lỗi trong modal quản lý vaccine */}
            {vaccineError && (
              <div data-testid="global-vaccine-error" style={{ color: 'red', marginBottom: 8 }}>
                {vaccineError}
              </div>
            )}
            <div className="modal-body">
              {/* Form thêm vaccine mới */}
              <form onSubmit={handleAddVaccine} style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="managerVaccineName" style={{ fontWeight: 500 }}>Tên vaccine:</label>
                  <input
                    id="managerVaccineName"
                    type="text"
                    name="VaccineName"
                    value={addVaccineData.VaccineName}
                    onChange={handleAddVaccineInputChange}
                    required
                    style={{ width: '100%', padding: 8, marginBottom: 0 }}
                    aria-label="Tên vaccine:"
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label htmlFor="managerVaccineDesc" style={{ fontWeight: 500 }}>Mô tả:</label>
                  <textarea
                    id="managerVaccineDesc"
                    name="Description"
                    value={addVaccineData.Description}
                    onChange={handleAddVaccineInputChange}
                    rows={3}
                    style={{ width: '100%', padding: 8, marginBottom: 0 }}
                    required
                    aria-label="Mô tả:"
                  />
                </div>
                <button type="submit" className="create-plan-btn" role="button" aria-label="Thêm mới" disabled={addVaccineLoading} style={{ minWidth: 120 }}>
                  {addVaccineLoading ? 'Đang lưu...' : 'Thêm mới'}
                </button>
              </form>
              {/* Danh sách vaccine */}
              <table style={{ width: '100%', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <thead style={{ background: '#e2e8f0' }}>
                  <tr>
                    <th style={{ padding: 8 }}>Mã</th>
                    <th style={{ padding: 8 }}>Tên vaccine</th>
                    <th style={{ padding: 8 }}>Mô tả</th>
                    <th style={{ padding: 8, minWidth: 120 }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineList.map((v, idx) => (
                    <tr key={v.vaccinationID || v.VaccinationID || v.id || v.name || idx}>
                      <td style={{ padding: 8 }}>{v.vaccinationID || v.VaccinationID}</td>
                      <td style={{ padding: 8 }}>
                        {editVaccineId === (v.vaccinationID || v.VaccinationID) ? (
                          <input
                            type="text"
                            name="VaccineName"
                            value={editVaccineData.VaccineName}
                            onChange={handleEditVaccineInputChange}
                            style={{ width: '100%', padding: 4 }}
                            aria-label="Tên vaccine:"
                          />
                        ) : (v.vaccineName || v.VaccineName)}
                      </td>
                      <td style={{ padding: 8 }}>
                        {editVaccineId === (v.vaccinationID || v.VaccinationID) ? (
                          <textarea
                            name="Description"
                            value={editVaccineData.Description}
                            onChange={handleEditVaccineInputChange}
                            style={{ width: '100%', padding: 4 }}
                            aria-label="Mô tả:"
                          />
                        ) : (v.description || v.Description)}
                      </td>
                      <td style={{ padding: 8, display: 'flex', gap: 8 }}>
                        {editVaccineId === (v.vaccinationID || v.VaccinationID) ? (
                          <>
                            <button className="create-plan-btn" style={{ padding: '4px 12px' }} onClick={() => handleEditVaccineSave(v.vaccinationID || v.VaccinationID)}>Lưu</button>
                            <button className="close-btn" style={{ padding: '4px 12px' }} onClick={() => setEditVaccineId(null)}>Hủy</button>
                          </>
                        ) : (
                          <>
                            <button className="edit-btn" style={{ padding: '4px 12px' }} onClick={e => { e.preventDefault(); handleEditVaccineClick(v); }}>Sửa</button>
                            <button className="delete-btn" style={{ padding: '4px 12px', background: '#e53e3e', color: '#fff' }} onClick={e => { e.preventDefault(); setDeleteVaccineId(v.vaccinationID || v.VaccinationID); }}>Xóa</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Luôn render lỗi nếu có */}
              {vaccineError && (
                <div style={{ color: 'red', marginTop: 4 }}>
                  {vaccineError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="vaccination-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-syringe"></i> Chi tiết kế hoạch tiêm chủng
              </h3>
              <button className="close-btn" role="button" aria-label="Đóng" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="vaccination-status-badge" data-status={selectedPlan.status}>
                {getStatusText(selectedPlan.status)}
              </div>
              
              <div className="vaccination-title-section">
                <h2>{selectedPlan.PlanName}</h2>
                <p className="scheduled-date">
                  <i className="far fa-calendar-alt"></i>
                  {selectedPlan.scheduledDate ? new Date(selectedPlan.scheduledDate).toLocaleDateString('vi-VN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'Invalid Date'}
                </p>
              </div>

              {/* Hiển thị danh sách học sinh nếu có */}
              {selectedPlan.ConsentForms && selectedPlan.ConsentForms.length > 0 && (
                <div className="student-list-section">
                  <h4>Danh sách học sinh</h4>
                  <ul>
                    {selectedPlan.ConsentForms.map(f => (
                      <li key={f.studentId || f.studentID}>{f.name || f.Name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Nếu không có kết quả tiêm */}
              {selectedPlan.ConsentForms && selectedPlan.ConsentForms.length > 0 && selectedPlan.ConsentForms.every(f => !f.result) && (
                <div>Chưa có kết quả</div>
              )}
              {/* Các nút hành động */}
              <div className="detail-actions">
                <button className="action-btn view-students" role="button">
                  <i className="fas fa-users"></i> Xem danh sách học sinh
                </button>
                <button className="action-btn record-results" role="button">
                  <i className="fas fa-clipboard-check"></i> Ghi nhận kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-plan-modal" style={{ background: '#f4f8fb', width: '540px', maxWidth: '95%' }}>
            <div className="modal-header">
              <h3>Chỉnh sửa kế hoạch tiêm chủng</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdatePlan}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editPlanName">Tên kế hoạch (Tên vaccine):</label>
                  <select id="editPlanName" name="PlanName" value={editFormData.PlanName ?? ""} onChange={e => setEditFormData({ ...editFormData, PlanName: e.target.value })} required>
                    <option value="">Chọn vaccine...</option>
                    {vaccineList.map(v => (
                      <option key={v.id} value={v.vaccineName || v.VaccineName}>{v.vaccineName || v.VaccineName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editScheduledDate">Ngày dự kiến:</label>
                  <input id="editScheduledDate" type="date" name="ScheduledDate" value={editFormData.ScheduledDate ?? ""} onChange={e => setEditFormData({ ...editFormData, ScheduledDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="editDescription">Mô tả:</label>
                  <textarea id="editDescription" name="Description" value={editFormData.Description ?? ""} onChange={e => setEditFormData({ ...editFormData, Description: e.target.value })} placeholder="Mô tả chi tiết về kế hoạch tiêm chủng..." rows="3" required />
                </div>
                <div className="form-group">
                  <label htmlFor="editStatus">Trạng thái:</label>
                  <select id="editStatus" name="Status" value={editFormData.Status ?? ""} onChange={e => setEditFormData({ ...editFormData, Status: e.target.value })} required>
                    <option value="Active">Đang thực hiện</option>
                    <option value="Pending">Chờ thực hiện</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editGrade">Khối:</label>
                  <select id="editGrade" name="Grade" value={editFormData.Grade} onChange={e => setEditFormData({ ...editFormData, Grade: e.target.value })} required>
                    {gradeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  role="button"
                  aria-label="Hủy"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirmModal && planToNotify && (
        <div className="modal-overlay">
          <div className="confirm-modal" style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 400, margin: '120px auto' }}>
            <h3>Xác nhận gửi thông báo</h3>
            <p>Bạn có chắc chắn muốn gửi thông báo kế hoạch <b>{planToNotify.PlanName}</b> đến phụ huynh không?</p>
            {notifyMessage && <div style={{ color: notifyMessage.includes('thành công') ? 'green' : 'red', marginBottom: 8 }}>{notifyMessage}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="cancel-btn" role="button" aria-label="Hủy" onClick={() => setShowConfirmModal(false)} disabled={notifyLoading}>Hủy</button>
              <button className="submit-btn" onClick={handleSendNotificationsConfirmed} disabled={notifyLoading}>
                {notifyLoading ? 'Đang gửi...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddVaccineModal && (
        <div className="modal-overlay">
          <div className="create-plan-modal" style={{ background: '#f4f8fb', minWidth: 400 }}>
            <div className="modal-header">
              <h3>Thêm vaccine mới</h3>
              <button className="close-btn" onClick={() => setShowAddVaccineModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddVaccine}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="addVaccineName">Tên vaccine:</label>
                  <input
                    id="addVaccineName"
                    type="text"
                    name="VaccineName"
                    value={addVaccineData.VaccineName}
                    onChange={handleAddVaccineInputChange}
                    required
                    style={{ width: '100%', padding: 8, marginBottom: 12 }}
                    aria-label="Tên vaccine:"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addVaccineDesc">Mô tả:</label>
                  <textarea
                    id="addVaccineDesc"
                    name="Description"
                    value={addVaccineData.Description}
                    onChange={handleAddVaccineInputChange}
                    rows={3}
                    style={{ width: '100%', padding: 8 }}
                    required
                    aria-label="Mô tả:"
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ textAlign: 'right' }}>
                <button type="button" className="close-btn" role="button" aria-label="Hủy" onClick={() => setShowAddVaccineModal(false)} style={{ marginRight: 8 }}>
                  Hủy
                </button>
                <button type="submit" className="create-plan-btn" role="button" aria-label="Thêm mới" disabled={addVaccineLoading}>
                  {addVaccineLoading ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDateErrorModal && (
        <div className="modal-overlay" style={{ zIndex: 10001, background: 'rgba(0,0,0,0.25)' }}>
          <div style={{
            background: '#fff',
            minWidth: 340,
            maxWidth: 400,
            margin: '120px auto',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 32,
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#e53e3e' }}>Lỗi ngày dự kiến</div>
            <div style={{ marginBottom: 24 }}>{dateErrorMessage}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button className="close-btn" role="button" aria-label="Đóng" style={{ padding: '8px 24px', borderRadius: 6 }} onClick={() => setShowDateErrorModal(false)}>
                Đóng
              </button>
            </div>
                </div>
                </div>
      )}
      {deleteVaccineId && (
        <div className="modal-overlay" style={{ zIndex: 10001, background: 'rgba(0,0,0,0.25)' }}>
          <div style={{
            background: '#fff',
            minWidth: 340,
            maxWidth: 400,
            margin: '120px auto',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 32,
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#e53e3e' }}>Xác nhận xóa vaccine</div>
            <div style={{ marginBottom: 24 }}>Bạn có chắc chắn muốn xóa vaccine này không?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button className="delete-btn" style={{ background: '#e53e3e', color: '#fff', padding: '8px 24px', borderRadius: 6 }} onClick={() => handleDeleteVaccine(deleteVaccineId)} disabled={deleteLoading}>Xóa</button>
              <button className="close-btn" role="button" aria-label="Hủy" style={{ padding: '8px 24px', borderRadius: 6 }} onClick={() => setDeleteVaccineId(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#38a169',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: 18,
          fontWeight: 500
        }}>
          {notifyMessage}
        </div>
      )}
      {/* Thông báo lỗi toàn cục */}
      {formError === 'date' && (
        <div data-testid="global-date-error" style={{ color: 'red', marginBottom: 8 }}>
          <div>Lỗi ngày dự kiến</div>
          <div>Ngày dự kiến phải lớn hơn hoặc bằng hôm nay!</div>
        </div>
      )}
      {formError === 'login' && (
        <div data-testid="global-login-error" style={{ color: 'red', marginBottom: 8 }}>
          Vui lòng đăng nhập để thực hiện chức năng này.
        </div>
      )}
      {formError && formError !== 'date' && formError !== 'login' && (
        <div data-testid="global-form-error" style={{ color: 'red', marginBottom: 8 }}>{formError}</div>
      )}
      {vaccineError && (
        <div data-testid="global-vaccine-error" style={{ color: 'red', marginBottom: 8 }}>
          {vaccineError}
        </div>
      )}
    </div>
  );
};

export default VaccinationManagement;
