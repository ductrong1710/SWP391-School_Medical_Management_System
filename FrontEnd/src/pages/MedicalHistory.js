import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import healthCheckService from '../services/healthRecordService';
import './MedicalHistory.css';
import Sidebar from '../components/Sidebar';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const { user, getUserRole } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchVaccinationResults = async (studentId) => {
    try {
      const res = await apiClient.get(`/VaccinationResult/student/${studentId}`);
      return res.data || [];
    } catch {
      return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    let mappedHistory = [];
    try {
      const userRole = getUserRole();
      const params = new URLSearchParams({
        year: filterYear,
        type: filterType,
      });
      let endpoint = '';
      let studentIds = [];
      if (userRole === 'Parent') {
        if (selectedChild !== 'all') {
          params.append('studentId', selectedChild);
          studentIds = [selectedChild];
        } else {
          if (children.length === 0) {
            const childrenResponse = await apiClient.get(`/User/parent/${user.UserID || user.userID}/children`);
            console.log('childrenResponse.data:', childrenResponse.data);
            childrenResponse.data.forEach((c, idx) => {
              console.log(`childrenResponse.data[${idx}]:`, c);
            });
            setChildren(childrenResponse.data);
            studentIds = childrenResponse.data.map(c => c.id || c.userID || c.UserID);
            console.log('studentIds sau khi map từ childrenResponse:', studentIds);
          } else {
            children.forEach((c, idx) => {
              console.log(`children[${idx}]:`, c);
            });
            studentIds = children.map(c => c.id || c.userID || c.UserID);
            console.log('studentIds từ state children:', studentIds);
          }
        }
        endpoint = `/HealthCheckResult/parent/${user.UserID || user.userID}/history`;
      } else if (userRole === 'Student') {
        studentIds = [user.UserID || user.userID];
        endpoint = `/HealthCheckResult/student/${user.UserID || user.userID}/history`;
      } else {
        navigate('/dashboard');
        return;
      }
      console.log('studentIds:', studentIds);
      // Lấy lịch sử kiểm tra y tế (khám định kỳ)
      try {
        const historyResponse = await apiClient.get(`${endpoint}?${params.toString()}`);
        mappedHistory = (historyResponse.data || []).map(mapBackendToFrontend);
        console.log('mappedHistory:', mappedHistory);
      } catch (err) {
        console.warn('Không lấy được dữ liệu khám định kỳ:', err);
        mappedHistory = [];
      }
      // Lấy kết quả tiêm chủng cho từng học sinh
      let vaccinationRecords = [];
      for (const sid of studentIds) {
        if (!sid) {
          console.warn('studentId bị undefined hoặc null, bỏ qua fetchVaccinationResults');
          continue;
        }
        console.log('Gọi fetchVaccinationResults với studentId:', sid);
        const results = await fetchVaccinationResults(sid);
        console.log('Vaccination results for student', sid, results);
        for (const v of results) {
          // Lấy profile học sinh
          let profile = null;
          try {
            const profileRes = await apiClient.get(`/Profile/user/${v.consentForm?.studentID || v.consentFormID}`);
            profile = profileRes.data;
          } catch (e) {
            console.log('Không lấy được profile cho studentID:', v.consentForm?.studentID || v.consentFormID, e);
          }
          const record = {
            id: v.id || v.ID,
            childId: profile?.userID || v.consentForm?.studentID || v.consentFormID,
            childName: profile?.name || profile?.Name || v.consentForm?.student?.userID || v.consentForm?.studentID || 'Không rõ tên',
            className: profile?.classID || profile?.ClassID || '',
            checkupDate: v.actualVaccinationDate || v.ActualVaccinationDate,
            checkupType: 'Vaccination',
            doctor: v.performer || v.Performer || 'N/A',
            status: 'Completed',
            result: {
              vaccineType: v.vaccineTypeID || v.VaccineTypeID,
              postVaccinationReaction: v.postVaccinationReaction || v.PostVaccinationReaction,
              notes: v.notes || v.Notes,
            }
          };
          console.log('Mapped vaccination record:', record);
          vaccinationRecords.push(record);
        }
      }
      console.log('Vaccination records mapped:', vaccinationRecords);
      setMedicalHistory([...mappedHistory, ...vaccinationRecords]);
      console.log('setMedicalHistory:', [...mappedHistory, ...vaccinationRecords]);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch sử y tế và tiêm chủng:", error);
      // KHÔNG setMedicalHistory([]) ở đây, để giữ lại vaccinationRecords nếu có
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedChild, filterYear, filterType]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Periodic':
        return '#3182ce';
      case 'Special':
        return '#d69e2e';
      case 'Follow-up':
        return '#38a169';
      default:
        return '#718096';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'Periodic':
        return 'Định kỳ';
      case 'Special':
        return 'Đặc biệt';
      case 'Follow-up':
        return 'Theo dõi';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#38a169';
      case 'In Progress':
        return '#d69e2e';
      case 'Scheduled':
        return '#3182ce';
      default:
        return '#718096';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Completed':
        return 'Hoàn thành';
      case 'In Progress':
        return 'Đang thực hiện';
      case 'Scheduled':
        return 'Đã lên lịch';
      default:
        return status;
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { category: 'Thiếu cân', color: '#d69e2e' };
    if (bmi < 25) return { category: 'Bình thường', color: '#38a169' };
    if (bmi < 30) return { category: 'Thừa cân', color: '#d69e2e' };
    return { category: 'Béo phì', color: '#e53e3e' };
  };

  const mapBackendToFrontend = (record) => {
    // Map đúng các trường từ backend Health_Check_Result
    return {
      id: record.id || record.ID,
      childId: record.healthCheckConsentID || record.HealthCheckConsentID,
      childName: record.studentName || record.StudentName || '', // Nếu backend trả về tên học sinh, nếu không thì để trống
      className: record.className || record.ClassName || '',
      checkupDate: record.checkUpDate || record.CheckUpDate ? new Date(record.checkUpDate || record.CheckUpDate).toISOString().split('T')[0] : 'N/A',
      checkupType: record.checkupType || record.CheckupType || 'Định kỳ',
      doctor: record.checker || record.Checker || '',
      status: record.status || record.Status || 'Completed',
      result: {
        height: record.height || record.Height || 'N/A',
        weight: record.weight || record.Weight || 'N/A',
        bloodPressure: record.bloodPressure || record.BloodPressure || 'N/A',
        heartRate: record.heartRate || record.HeartRate || 'N/A',
        vision: record.eyesight || record.Eyesight || 'N/A',
        hearing: record.hearing || record.Hearing || 'N/A',
        dental: record.oralHealth || record.OralHealth || 'N/A',
        musculoskeletal: record.spine || record.Spine || 'N/A',
        notes: record.conclusion || record.Conclusion || 'Không có',
        followUpRequired: record.needToContactParent || record.NeedToContactParent || false,
        followUpDate: record.followUpDate || record.FollowUpDate ? new Date(record.followUpDate || record.FollowUpDate).toISOString().split('T')[0] : null,
        // Các trường khác nếu có thể bổ sung thêm ở đây
      }
    };
  };

  const uniqueYears = [...new Set(medicalHistory.map(r => new Date(r.checkupDate).getFullYear()))];

  // Thêm component bảng kết quả tạm thời cho phụ huynh
  const tempFields = [
    { label: 'Chiều cao', key: 'height' },
    { label: 'Cân nặng', key: 'weight' },
    { label: 'Huyết áp', key: 'bloodPressure' },
    { label: 'Nhịp tim', key: 'heartRate' },
    { label: 'Thị lực', key: 'vision' },
    { label: 'Thính lực', key: 'hearing' },
    { label: 'Răng miệng', key: 'dental' },
    { label: 'Cột sống', key: 'musculoskeletal' },
    { label: 'Kết luận', key: 'notes' },
    { label: 'Ngày khám', key: 'checkupDate' },
    { label: 'Người khám', key: 'doctor' },
    { label: 'Trạng thái', key: 'status' },
  ];
  function ParentHealthResultTableTemp({ planName, childName }) {
    return (
      <div className="history-card">
        <div className="history-header">
          <div className="history-title">
            <h3>Kiểm tra - {childName || 'Học sinh'}</h3>
            <span className="type-badge" style={{ backgroundColor: '#d69e2e' }}>Định kỳ</span>
            <span className="status-badge" style={{ backgroundColor: '#d69e2e' }}>Đang đợi kết quả</span>
          </div>
          <div className="history-date">
            <i className="fas fa-calendar"></i> -
          </div>
        </div>
        <div className="history-content">
          <div className="basic-info">
            <h4>Thông tin cơ bản</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Học sinh:</span>
                <span className="info-value">{childName || 'Học sinh'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Kế hoạch:</span>
                <span className="info-value">{planName || '-'}</span>
              </div>
            </div>
          </div>
          <table className="table table-bordered" style={{ marginTop: 12, marginBottom: 12 }}>
            <tbody>
              {tempFields.map(f => (
                <tr key={f.key}>
                  <td><b>{f.label}</b></td>
                  <td>Đang đợi kết quả</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Thêm component TempConsentPlanList:
  function TempConsentPlanList({ children }) {
    const [consentPlans, setConsentPlans] = useState([]);
    useEffect(() => {
      async function fetchConsentPlans() {
        let allPlans = [];
        for (const child of children) {
          try {
            const res = await apiClient.get(`/HealthCheckConsentForm/student/${child.id || child.userID || child.UserID}`);
            // Lọc các kế hoạch đã đồng ý
            const agreed = (res.data || []).filter(f => f.consentStatus === 'Đồng ý' || f.statusID === 1);
            allPlans = allPlans.concat(agreed.map(plan => ({ planName: plan.healthCheckPlan?.planName, childName: child.name })));
          } catch {}
        }
        setConsentPlans(allPlans);
      }
      fetchConsentPlans();
    }, [children]);
    if (consentPlans.length === 0) return <div className="no-results"><i className="fas fa-stethoscope"></i><p>Không tìm thấy lịch sử kiểm tra nào</p></div>;
    return (
      <>
        {consentPlans.map((p, idx) => (
          <ParentHealthResultTableTemp key={idx} planName={p.planName} childName={p.childName} />
        ))}
      </>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6ff' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
          <div style={{ maxWidth: 600, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 24, minHeight: 400 }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
        <div style={{ maxWidth: 600, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 24, minHeight: 400 }}>
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Lịch sử kiểm tra y tế</h2>
          <div className="history-header">
            <p>Xem lịch sử các lần kiểm tra sức khỏe và kết quả chi tiết</p>
          </div>

          {/* Filters */}
          <div className="filters-section">
            {getUserRole() === 'Parent' && (
              <div className="filter-group">
                <label>Con em:</label>
                <select 
                  value={selectedChild ?? ""} 
                  onChange={(e) => setSelectedChild(e.target.value)}
                >
                  <option value="all">Tất cả con em</option>
                  {children.map(child => (
                    <option key={child.id || child.userID || child.UserID} value={child.id}>
                      {child.name} - {child.className}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="filter-group">
              <label>Năm:</label>
              <select 
                value={filterYear ?? ""} 
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
              >
                {uniqueYears.sort((a, b) => b - a).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Loại kiểm tra:</label>
              <select 
                value={filterType ?? ""} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                <option value="Periodic">Định kỳ</option>
                <option value="Special">Đặc biệt</option>
                <option value="Follow-up">Theo dõi</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{medicalHistory.length}</div>
                <div className="stat-label">Tổng số lần kiểm tra</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon completed">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {medicalHistory.filter(r => r.status === 'Completed').length}
                </div>
                <div className="stat-label">Đã hoàn thành</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon followup">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {medicalHistory.filter(r => r.result?.followUpRequired).length}
                </div>
                <div className="stat-label">Cần theo dõi</div>
              </div>
            </div>
          </div>

          {/* Medical History List */}
          <div className="history-list">
            {console.log('Render medicalHistory:', medicalHistory)}
            {medicalHistory.map((record) => {
              const bmi = calculateBMI(record.result?.height, record.result?.weight);
              const bmiCategory = getBMICategory(bmi);
              
              return (
                <div key={record.id || record.ID || record._id} className="history-card">
                  <div className="history-header">
                    <div className="history-title">
                      <h3>Kiểm tra - {record.childName || 'Học sinh'}</h3>
                      <div className="history-badges">
                        <span 
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(record.checkupType) }}
                        >
                          {getTypeText(record.checkupType)}
                        </span>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(record.status) }}
                        >
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </div>
                    <div className="history-date">
                      <i className="fas fa-calendar"></i>
                      {new Date(record.checkupDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="history-content">
                    <div className="basic-info">
                      <h4>Thông tin cơ bản</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Học sinh:</span>
                          <span className="info-value">{record.childName || 'Học sinh'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Lớp:</span>
                          <span className="info-value">{record.className}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Ngày kiểm tra:</span>
                          <span className="info-value">{new Date(record.checkupDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    {record.result && (
                      <>
                        <div className="vital-signs">
                          <div className="vitals-grid">
                            {record.result.height && (
                              <div className="vital-item">
                                <span className="vital-label">Chiều cao:</span>
                                <span className="vital-value">{record.result.height}</span>
                              </div>
                            )}
                            {record.result.weight && (
                              <div className="vital-item">
                                <span className="vital-label">Cân nặng:</span>
                                <span className="vital-value">{record.result.weight}</span>
                              </div>
                            )}
                            {bmi && (
                              <div className="vital-item">
                                <span className="vital-label">BMI:</span>
                                <span 
                                  className="vital-value"
                                  style={{ color: bmiCategory?.color }}
                                >
                                  {bmi} ({bmiCategory?.category})
                                </span>
                              </div>
                            )}
                            {record.result.bloodPressure && (
                              <div className="vital-item">
                                <span className="vital-label">Huyết áp:</span>
                                <span className="vital-value">{record.result.bloodPressure}</span>
                              </div>
                            )}
                            {record.result.heartRate && (
                              <div className="vital-item">
                                <span className="vital-label">Nhịp tim:</span>
                                <span className="vital-value">{record.result.heartRate} bpm</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="examination-results">
                          <h4>Kết quả khám</h4>
                          <div className="exam-grid">
                            {record.result.vision && (
                              <div className="exam-item">
                                <span className="exam-label">Thị lực:</span>
                                <span className="exam-value">{record.result.vision}</span>
                              </div>
                            )}
                            {record.result.hearing && (
                              <div className="exam-item">
                                <span className="exam-label">Thính lực:</span>
                                <span className="exam-value">{record.result.hearing}</span>
                              </div>
                            )}
                            {record.result.dental && (
                              <div className="exam-item">
                                <span className="exam-label">Răng miệng:</span>
                                <span className="exam-value">{record.result.dental}</span>
                              </div>
                            )}
                            {record.result.skin && (
                              <div className="exam-item">
                                <span className="exam-label">Da:</span>
                                <span className="exam-value">{record.result.skin}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {record.result.notes && (
                          <div className="notes-section">
                            <h4>Ghi chú</h4>
                            <p>{record.result.notes}</p>
                          </div>
                        )}

                        {record.result.recommendations && (
                          <div className="recommendations-section">
                            <h4>Khuyến nghị</h4>
                            <p>{record.result.recommendations}</p>
                          </div>
                        )}

                        {record.result.followUpRequired && (
                          <div className="followup-section">
                            <h4>Theo dõi</h4>
                            <p><strong>Ngày theo dõi:</strong> {new Date(record.result.followUpDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Lý do:</strong> {record.result.followUpReason}</p>
                          </div>
                        )}
                      </>
                    )}

                    {record.checkupType === 'Vaccination' ? (
                      <div className="vaccination-info">
                        <h4>Kết quả tiêm chủng</h4>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Loại vắc xin:</span>
                            <span className="info-value">{record.result?.vaccineType}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Ngày tiêm:</span>
                            <span className="info-value">{new Date(record.checkupDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Người thực hiện:</span>
                            <span className="info-value">{record.doctor}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phản ứng sau tiêm:</span>
                            <span className="info-value">{record.result?.postVaccinationReaction || 'Không có'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Ghi chú:</span>
                            <span className="info-value">{record.result?.notes || 'Không có'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="history-actions">
                        <button 
                          className="view-details-btn"
                          onClick={() => handleViewDetails(record)}
                        >
                          <i className="fas fa-eye"></i>
                          Xem chi tiết
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {medicalHistory.length === 0 && getUserRole() === 'Parent' && (
              <TempConsentPlanList children={children} />
            )}
          </div>

          {/* Details Modal */}
          {showDetailsModal && selectedRecord && (
            <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Chi tiết kiểm tra - {selectedRecord.childName || 'Học sinh'}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Học sinh:</label>
                        <span>{selectedRecord.childName || 'Học sinh'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Lớp:</label>
                        <span>{selectedRecord.className}</span>
                      </div>
                      <div className="detail-item">
                        <label>Loại kiểm tra:</label>
                        <span>{getTypeText(selectedRecord.checkupType)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Ngày kiểm tra:</label>
                        <span>{new Date(selectedRecord.checkupDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="detail-item">
                        <label>Trạng thái:</label>
                        <span>{getStatusText(selectedRecord.status)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRecord.result && (
                    <>
                      <div className="detail-section">
                        <h4>Thông tin sức khỏe</h4>
                        <div className="detail-grid">
                          {selectedRecord.result.height && (
                            <div className="detail-item">
                              <label>Chiều cao:</label>
                              <span>{selectedRecord.result.height}</span>
                            </div>
                          )}
                          {selectedRecord.result.weight && (
                            <div className="detail-item">
                              <label>Cân nặng:</label>
                              <span>{selectedRecord.result.weight}</span>
                            </div>
                          )}
                          {selectedRecord.result.bloodPressure && (
                            <div className="detail-item">
                              <label>Huyết áp:</label>
                              <span>{selectedRecord.result.bloodPressure}</span>
                            </div>
                          )}
                          {selectedRecord.result.heartRate && (
                            <div className="detail-item">
                              <label>Nhịp tim:</label>
                              <span>{selectedRecord.result.heartRate} bpm</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h4>Khám lâm sàng</h4>
                        <div className="detail-grid">
                          {selectedRecord.result.vision && (
                            <div className="detail-item">
                              <label>Thị lực:</label>
                              <span>{selectedRecord.result.vision}</span>
                            </div>
                          )}
                          {selectedRecord.result.hearing && (
                            <div className="detail-item">
                              <label>Thính lực:</label>
                              <span>{selectedRecord.result.hearing}</span>
                            </div>
                          )}
                          {selectedRecord.result.dental && (
                            <div className="detail-item">
                              <label>Răng miệng:</label>
                              <span>{selectedRecord.result.dental}</span>
                            </div>
                          )}
                          {selectedRecord.result.skin && (
                            <div className="detail-item">
                              <label>Da:</label>
                              <span>{selectedRecord.result.skin}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h4>Khám hệ thống</h4>
                        <div className="detail-grid">
                          {selectedRecord.result.respiratory && (
                            <div className="detail-item">
                              <label>Hô hấp:</label>
                              <span>{selectedRecord.result.respiratory}</span>
                            </div>
                          )}
                          {selectedRecord.result.cardiovascular && (
                            <div className="detail-item">
                              <label>Tim mạch:</label>
                              <span>{selectedRecord.result.cardiovascular}</span>
                            </div>
                          )}
                          {selectedRecord.result.gastrointestinal && (
                            <div className="detail-item">
                              <label>Tiêu hóa:</label>
                              <span>{selectedRecord.result.gastrointestinal}</span>
                            </div>
                          )}
                          {selectedRecord.result.musculoskeletal && (
                            <div className="detail-item">
                              <label>Cơ xương khớp:</label>
                              <span>{selectedRecord.result.musculoskeletal}</span>
                            </div>
                          )}
                          {selectedRecord.result.neurological && (
                            <div className="detail-item">
                              <label>Thần kinh:</label>
                              <span>{selectedRecord.result.neurological}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedRecord.result.notes && (
                        <div className="detail-section">
                          <h4>Ghi chú</h4>
                          <p>{selectedRecord.result.notes}</p>
                        </div>
                      )}

                      {selectedRecord.result.recommendations && (
                        <div className="detail-section">
                          <h4>Khuyến nghị</h4>
                          <p>{selectedRecord.result.recommendations}</p>
                        </div>
                      )}

                      {selectedRecord.result.followUpRequired && (
                        <div className="detail-section">
                          <h4>Theo dõi</h4>
                          <div className="detail-grid">
                            <div className="detail-item">
                              <label>Ngày theo dõi:</label>
                              <span>{new Date(selectedRecord.result.followUpDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="detail-item">
                              <label>Lý do:</label>
                              <span>{selectedRecord.result.followUpReason}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedRecord.checkupType === 'Vaccination' ? (
                    <div className="detail-section">
                      <h4>Kết quả tiêm chủng</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Loại vắc xin:</label>
                          <span>{selectedRecord.result?.vaccineType}</span>
                        </div>
                        <div className="detail-item">
                          <label>Ngày tiêm:</label>
                          <span>{new Date(selectedRecord.checkupDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="detail-item">
                          <label>Người thực hiện:</label>
                          <span>{selectedRecord.doctor}</span>
                        </div>
                        <div className="detail-item">
                          <label>Phản ứng sau tiêm:</label>
                          <span>{selectedRecord.result?.postVaccinationReaction || 'Không có'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Ghi chú:</label>
                          <span>{selectedRecord.result?.notes || 'Không có'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="history-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(selectedRecord)}
                      >
                        <i className="fas fa-eye"></i>
                        Xem chi tiết
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory; 