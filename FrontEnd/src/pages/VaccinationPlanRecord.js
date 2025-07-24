import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import './HealthRecord.css';
import Sidebar from '../components/Sidebar';

const VaccinationPlanRecord = () => {
  const { id: planId } = useParams();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [modalConsentFormId, setModalConsentFormId] = useState(null);
  const [form, setForm] = useState({
    vaccineTypeId: '',
    actualVaccinationDate: '',
    performer: '',
    postVaccinationReaction: '',
    notes: '',
    needToContactParent: false,
  });
  const [vaccineTypes, setVaccineTypes] = useState([]);
  const [plan, setPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Lấy thông tin kế hoạch tiêm chủng
    const fetchPlan = async () => {
      try {
        const res = await apiClient.get(`/VaccinationPlan/${planId}`);
        setPlan(res.data);
      } catch {
        setPlan(null);
      }
    };
    fetchPlan();
  }, [planId]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/VaccinationConsentForm/plan/${planId}`);
        // Lọc các học sinh đã xác nhận
        const confirmed = res.data.filter(f => (f.statusID === 1 || f.consentStatus === "Approved") && f.studentID);
        // Lấy thông tin profile cho từng studentID (UserID)
        const studentProfiles = await Promise.all(
          confirmed.map(async (f) => {
            try {
              const profileRes = await apiClient.get(`/Profile/user/${f.studentID}`);
              return {
                userID: f.studentID,
                name: profileRes.data?.name || profileRes.data?.Name || 'Không rõ tên',
                classID: profileRes.data?.classID || profileRes.data?.ClassID || 'Không rõ',
                consentFormId: f.id,
              };
            } catch {
              return {
                userID: f.studentID,
                name: 'Không rõ tên',
                classID: 'Không rõ',
                consentFormId: f.id,
              };
            }
          })
        );
        setStudents(studentProfiles);
      } catch (err) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [planId]);

  useEffect(() => {
    // Lấy danh sách loại vaccine
    apiClient.get('/VaccineType').then(res => setVaccineTypes(res.data)).catch(() => setVaccineTypes([]));
  }, []);

  const openModal = (student, consentFormId) => {
    let vaccineTypeId = '';
    let vaccineTypeName = '';
    if (plan && vaccineTypes.length > 0) {
      // Loại bỏ từ 'Tiêm' ở đầu nếu có
      const planName = (plan.PlanName || '').toLowerCase().replace(/^tiêm\s*/i, '').trim();
      const found = vaccineTypes.find(v => {
        const vaccineName = (v.vaccineName || v.VaccineName || '').toLowerCase().trim();
        return planName.includes(vaccineName) || vaccineName.includes(planName);
      });
      vaccineTypeId = found ? (found.vaccinationID || found.id) : '';
      vaccineTypeName = found ? (found.vaccineName || found.VaccineName) : '';
    }
    if (!vaccineTypeId) {
      alert('Không tìm thấy loại vaccine phù hợp với kế hoạch tiêm chủng này. Vui lòng kiểm tra lại dữ liệu!');
      return;
    }
    setModalStudent(student);
    setModalConsentFormId(consentFormId);
    setForm({
      vaccineTypeId,
      actualVaccinationDate: '',
      performer: user?.username || user?.Username || user?.name || user?.Name || '',
      postVaccinationReaction: '',
      notes: '',
      needToContactParent: false,
    });
    setMessage('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStudent(null);
    setModalConsentFormId(null);
    setMessage('');
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const payload = {
      ConsentFormID: modalConsentFormId,
      VaccineTypeID: form.vaccineTypeId,
      ActualVaccinationDate: form.actualVaccinationDate,
      Performer: form.performer,
      PostVaccinationReaction: form.postVaccinationReaction,
      Notes: form.notes,
      NeedToContactParent: form.needToContactParent,
    };
    console.log('Payload gửi lên:', payload);
    try {
      await apiClient.post('/VaccinationResult', payload);
      setMessage('Ghi nhận thành công!');
      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (err) {
      setMessage('Ghi nhận thất bại!');
      if (err.response) {
        console.log('Lỗi backend:', err.response.data);
      } else {
        console.log('Lỗi không xác định:', err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container with-sidebar">
      <Sidebar />
      <main className="content-container">
        <div className="page-wrapper">
          <div className="main-container" style={{ minHeight: '80vh' }}>
            <div className="main-content">
              <div className="page-header">
                <div className="page-title">
                  <i className="fas fa-syringe" style={{ color: 'var(--primary-blue)' }}></i>
                  Ghi nhận kết quả tiêm chủng
                </div>
                <div className="page-subtitle">
                  Chỉ hiển thị học sinh đã được phụ huynh xác nhận đồng ý tiêm chủng.
                </div>
              </div>
              <div className="main-panel" style={{ maxWidth: 900, margin: '0 auto' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: 48, height: 48, marginBottom: 12 }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Đang tải dữ liệu...</div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="alert alert-info" style={{ textAlign: 'center', fontSize: 18, padding: 32 }}>
                    <i className="fas fa-user-times" style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 8 }}></i>
                    <div>Không có học sinh nào đã xác nhận tiêm chủng.</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', padding: 24 }}>
                    <table className="table table-hover" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
                      <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                          <th style={{ padding: '12px 8px', textAlign: 'left' }}>STT</th>
                          <th style={{ padding: '12px 8px', textAlign: 'left' }}>Mã học sinh</th>
                          <th style={{ padding: '12px 8px', textAlign: 'left' }}>Họ tên</th>
                          <th style={{ padding: '12px 8px', textAlign: 'left' }}>Lớp</th>
                          <th style={{ padding: '12px 8px', textAlign: 'left' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => (
                          <tr key={student?.userID || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px 8px' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 8px' }}>{student?.userID || 'Không rõ'}</td>
                            <td style={{ padding: '10px 8px' }}>{student?.name || 'Không rõ tên'}</td>
                            <td style={{ padding: '10px 8px' }}>{student?.classID || 'Không rõ'}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <button className="btn btn-primary" onClick={() => openModal(student, student.consentFormId)}>
                                Ghi nhận
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal ghi nhận kết quả */}
              {showModal && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                  <div className="main-panel" style={{ maxWidth: 480, margin: '120px auto', background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 10px 25px rgba(59,130,246,0.1)' }}>
                    <h3 style={{ color: 'var(--primary-blue)', marginBottom: 16 }}>Ghi nhận kết quả tiêm chủng</h3>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group mb-3">
                        <label htmlFor="vaccineTypeInput">Loại vaccine</label>
                        <input
                          id="vaccineTypeInput"
                          type="text"
                          className="form-control"
                          value={
                            vaccineTypes.find(v => (v.vaccinationID || v.id) === form.vaccineTypeId)?.vaccineName
                            || vaccineTypes.find(v => (v.vaccinationID || v.id) === form.vaccineTypeId)?.VaccineName
                            || plan?.PlanName
                            || ''
                          }
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="actualVaccinationDateInput">Ngày tiêm thực tế</label>
                        <input id="actualVaccinationDateInput" type="date" name="actualVaccinationDate" className="form-control" value={form.actualVaccinationDate} onChange={handleChange} required />
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="performerInput">Người thực hiện</label>
                        <input id="performerInput" type="text" name="performer" className="form-control" value={form.performer} onChange={handleChange} required disabled />
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="postVaccinationReactionInput">Phản ứng sau tiêm</label>
                        <input id="postVaccinationReactionInput" type="text" name="postVaccinationReaction" className="form-control" value={form.postVaccinationReaction} onChange={handleChange} />
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="notesInput">Ghi chú</label>
                        <input id="notesInput" type="text" name="notes" className="form-control" value={form.notes} onChange={handleChange} />
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="needToContactParentInput">
                          <input id="needToContactParentInput" type="checkbox" name="needToContactParent" checked={form.needToContactParent} onChange={handleChange} style={{ marginRight: 8 }} />
                          Cần liên hệ phụ huynh
                        </label>
                      </div>
                      {message && <div style={{ color: message.includes('thành công') ? 'green' : 'red', marginBottom: 8 }}>{message}</div>}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu kết quả'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VaccinationPlanRecord; 