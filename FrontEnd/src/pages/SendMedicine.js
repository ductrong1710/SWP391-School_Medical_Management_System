import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SendMedicine.css';
import apiClient from '../services/apiClient';
import ErrorDialog from '../components/ErrorDialog';

const SendMedicine = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);  const [showForm, setShowForm] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState('individual');

  // State cho form đơn lẻ
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    class: '',
    medicineName: '',
    dosage: '',
    frequency: 'Ngày 2 lần',
    duration: '7 ngày',
    dateOrdered: new Date().toISOString().split('T')[0],
    deliveryAddress: 'Phòng Y tế Trường',
    specialInstructions: ''
  });

  // State cho các bộ lọc
  const [filters, setFilters] = useState({
    grade: '',
    className: '',
    status: ''
  });

  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  // Kiểm tra xác thực
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: { pathname: '/send-medicine' },
          manualLogin: true 
        } 
      });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.grade) params.append('grade', filters.grade);
        if (filters.className) params.append('className', filters.className);
        if (filters.status) params.append('status', filters.status);
        
        const response = await apiClient.get(`/MedicationSubmission?${params.toString()}`);
        setMedicines(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu gửi thuốc:", error);
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  // Handler for new medicine request (individual)
  const handleNewMedicine = () => {
    setShowForm(true);
  };

  // Handlers
  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const handleCloseDetails = () => {
    setSelectedMedicine(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/MedicationSubmission', formData);
      setShowForm(false);
      alert('Yêu cầu gửi thuốc đã được tạo thành công!');
      // Tải lại dữ liệu
      setFilters(prev => ({...prev}));
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu thuốc:', error);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };  

  const handleApplyFilters = () => {
    // useEffect lo việc fetch lại dữ liệu khi filter thay đổi
    console.log("Applying filters:", filters);
  };

  const handleResetFilters = () => {
    setFilters({
      grade: '',
      className: '',
      status: ''
    });
  };

  const handleExportToExcel = () => {
    alert('Tính năng xuất Excel đang được phát triển!');
  };

  const handleImportFromExcel = () => {
    alert('Tính năng nhập từ Excel đang được phát triển!');
  };
  return (
    <div className="send-medicine-container">
      <div className="container py-4">
        {/* Header */}
        <div className="alert alert-info mb-4">
          <strong>Hướng dẫn:</strong> Phụ huynh gửi thuốc cho học sinh thông qua nhà trường. Vui lòng điền đầy đủ thông tin thuốc và hướng dẫn sử dụng để nhà trường phát thuốc đúng cho học sinh.
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Gửi thuốc cho học sinh</h1>
          <button className="btn btn-primary" onClick={handleNewMedicine}>
            <i className="fas fa-plus-circle me-2"></i>Gửi thuốc cá nhân
          </button>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Tổng số lượt gửi thuốc</h5>
                <p className="card-number">{medicines.length}</p>
                <p className="card-text">Đã đăng ký</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đã tiếp nhận</h5>
                <p className="card-number">{medicines.filter(m => m.status === 'Đã gửi').length}</p>
                <p className="card-text">Đơn thuốc</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đang chờ xử lý</h5>
                <p className="card-number">{medicines.filter(m => m.status === 'Đang xử lý').length}</p>
                <p className="card-text">Đơn thuốc</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đợt phát thuốc</h5>
                <p className="card-number">02</p>
                <p className="card-text">Học kỳ 2, 2024-2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Lọc danh sách gửi thuốc</h5>
            <div className="row">
              <div className="col-md-3 mb-2">
                <select 
                  id="grade" 
                  className="form-select"
                  value={filters.grade ?? ""}
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                >
                  <option value="">Chọn khối</option>
                  <option value="10">Khối 10</option>
                  <option value="11">Khối 11</option>
                  <option value="12">Khối 12</option>
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <select 
                  id="className" 
                  className="form-select"
                  value={filters.className ?? ""}
                  onChange={(e) => setFilters({...filters, className: e.target.value})}
                >
                  <option value="">Chọn lớp</option>
                  <option value="10A1">10A1</option>
                  <option value="10A2">10A2</option>
                  <option value="10A3">10A3</option>
                  <option value="11A1">11A1</option>
                  <option value="11A2">11A2</option>
                  <option value="12A1">12A1</option>
                  <option value="12A2">12A2</option>
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <select 
                  id="status" 
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">Trạng thái</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã gửi">Đã gửi</option>
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <div className="d-flex">
                  <button className="btn btn-primary flex-grow-1 me-2" onClick={handleApplyFilters}>
                    <i className="fas fa-search me-2"></i>Lọc
                  </button>
                  <button className="btn btn-secondary" onClick={handleResetFilters}>
                    <i className="fas fa-redo"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export/Import Buttons */}
        <div className="d-flex justify-content-end mb-3 btn-export-import">
          <button className="btn btn-outline-success me-2" onClick={handleExportToExcel}>
            <i className="fas fa-file-excel me-2"></i>Xuất Excel
          </button>
          <button className="btn btn-outline-primary" onClick={handleImportFromExcel}>
            <i className="fas fa-file-import me-2"></i>Nhập danh sách
          </button>
        </div>        {/* Main Table */}
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu gửi thuốc...</p>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mã học sinh</th>
                      <th>Họ tên</th>
                      <th>Lớp</th>
                      <th>Tên thuốc</th>
                      <th>Liều lượng</th>
                      <th>Ngày gửi thuốc</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length > 0 ? (
                      medicines.map((medicine) => (
                        <tr key={medicine.id}>
                          <td>{medicine.id}</td>
                          <td>{medicine.patientId}</td>
                          <td>{medicine.patientName}</td>
                          <td>{medicine.class}</td>
                          <td>{medicine.medicineName}</td>
                          <td>{medicine.dosage}</td>
                          <td>{medicine.dateOrdered}</td>
                          <td>
                            <span className={`badge ${
                              medicine.status === 'Đã gửi' 
                                ? 'bg-success' 
                                : 'bg-primary'
                            }`}>
                              {medicine.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleViewDetails(medicine)}
                            >
                              <i className="fas fa-eye me-1"></i>Xem
                            </button>
                            <button className="btn btn-sm btn-secondary">
                              <i className="fas fa-edit me-1"></i>Sửa
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-3">
                          <p className="mb-0 text-muted">Không có dữ liệu đơn thuốc nào phù hợp với điều kiện lọc</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Details Modal */}
        {selectedMedicine && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chi tiết gửi thuốc</h5>
                  <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Mã học sinh:</strong> {selectedMedicine.patientId}
                  </div>
                  <div className="mb-3">
                    <strong>Họ tên:</strong> {selectedMedicine.patientName}
                  </div>
                  <div className="mb-3">
                    <strong>Lớp:</strong> {selectedMedicine.class}
                  </div>
                  <div className="mb-3">
                    <strong>Tên thuốc:</strong> {selectedMedicine.medicineName}
                  </div>
                  <div className="mb-3">
                    <strong>Liều lượng:</strong> {selectedMedicine.dosage}
                  </div>
                  <div className="mb-3">
                    <strong>Tần suất:</strong> {selectedMedicine.frequency}
                  </div>
                  <div className="mb-3">
                    <strong>Thời gian dùng:</strong> {selectedMedicine.duration}
                  </div>
                  <div className="mb-3">
                    <strong>Ngày gửi thuốc:</strong> {selectedMedicine.dateOrdered}
                  </div>
                  <div className="mb-3">
                    <strong>Địa điểm nhận:</strong> {selectedMedicine.deliveryAddress}
                  </div>
                  <div className="mb-3">
                    <strong>Trạng thái:</strong> <span className={`badge ${
                      selectedMedicine.status === 'Đã gửi' 
                        ? 'bg-success' 
                        : 'bg-primary'
                    }`}>{selectedMedicine.status}</span>
                  </div>
                  <div className="mb-3">
                    <strong>Ghi chú phụ huynh:</strong> {selectedMedicine.specialInstructions}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>Đóng</button>
                  {selectedMedicine.status !== 'Đã gửi' && (
                    <button type="button" className="btn btn-primary">Đánh dấu đã gửi</button>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </div>
        )}        {/* Individual Medicine Form Modal */}
        {showForm && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Gửi thuốc cá nhân</h5>
                  <button type="button" className="btn-close" onClick={handleCancelForm}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmitForm} className="individual-form">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="patientId" className="form-label">Mã học sinh</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="patientId" 
                          value={formData.patientId}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="patientName" className="form-label">Họ tên học sinh</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="patientName" 
                          value={formData.patientName}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="class" className="form-label">Lớp</label>
                        <select 
                          className="form-select" 
                          id="class" 
                          value={formData.class}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn lớp</option>
                          <option value="10A1">10A1</option>
                          <option value="10A2">10A2</option>
                          <option value="10A3">10A3</option>
                          <option value="11A1">11A1</option>
                          <option value="11A2">11A2</option>
                          <option value="12A1">12A1</option>
                          <option value="12A2">12A2</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="medicineName" className="form-label">Tên thuốc</label>
                        <select 
                          className="form-select" 
                          id="medicineName" 
                          value={formData.medicineName}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn thuốc</option>
                          <option value="Paracetamol">Paracetamol</option>
                          <option value="Vitamin C">Vitamin C</option>
                          <option value="Amoxicillin">Amoxicillin</option>
                          <option value="Cetirizine">Cetirizine</option>
                          <option value="Ibuprofen">Ibuprofen</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="dosage" className="form-label">Liều lượng</label>
                        <select 
                          className="form-select" 
                          id="dosage" 
                          value={formData.dosage}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn liều lượng</option>
                          <option value="250mg">250mg</option>
                          <option value="500mg">500mg</option>
                          <option value="1000mg">1000mg</option>
                          <option value="10mg">10mg</option>
                          <option value="20mg">20mg</option>
                          <option value="400mg">400mg</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="frequency" className="form-label">Tần suất</label>
                        <select 
                          className="form-select" 
                          id="frequency" 
                          value={formData.frequency}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn tần suất</option>
                          <option value="Ngày 1 lần">Ngày 1 lần</option>
                          <option value="Ngày 2 lần">Ngày 2 lần</option>
                          <option value="Ngày 3 lần">Ngày 3 lần</option>
                          <option value="Ngày 4 lần">Ngày 4 lần</option>
                          <option value="Khi cần">Khi cần</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="duration" className="form-label">Thời gian dùng</label>
                        <select 
                          className="form-select" 
                          id="duration" 
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn thời gian</option>
                          <option value="3 ngày">3 ngày</option>
                          <option value="5 ngày">5 ngày</option>
                          <option value="7 ngày">7 ngày</option>
                          <option value="10 ngày">10 ngày</option>
                          <option value="14 ngày">14 ngày</option>
                          <option value="30 ngày">30 ngày</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="dateOrdered" className="form-label">Ngày gửi thuốc</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="dateOrdered" 
                          value={formData.dateOrdered}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="deliveryAddress" className="form-label">Địa điểm nhận</label>
                        <select 
                          className="form-select" 
                          id="deliveryAddress" 
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Phòng Y tế Trường">Phòng Y tế Trường</option>
                          <option value="Phòng học lớp">Phòng học lớp</option>
                          <option value="Ký túc xá">Ký túc xá</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="parentName" className="form-label">Tên phụ huynh</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="parentName" 
                          value={formData.parentName || ''}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="specialInstructions" className="form-label">Ghi chú phụ huynh</label>
                        <textarea 
                          className="form-control" 
                          id="specialInstructions" 
                          rows="2"
                          value={formData.specialInstructions}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>Hủy</button>
                      <button type="submit" className="btn btn-primary">Gửi thuốc</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </div>
        )}
        <ErrorDialog open={showError} message={error} onClose={() => setShowError(false)} />
      </div>
    </div>
  );
};

export default SendMedicine;
