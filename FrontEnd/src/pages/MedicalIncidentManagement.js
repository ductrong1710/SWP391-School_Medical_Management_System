import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ErrorDialog from '../components/ErrorDialog';

const MedicalIncidentManagement = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    IncidentType: '',
    Description: '',
    Severity: '',
    Location: '',
    ActionTaken: '',
    FollowUpRequired: '',
    Status: '',
    Notes: '',
    InvolvedStudents: [],
    UsedSupplies: [],
    UsedMedications: []
  });
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [medicalSupplies, setMedicalSupplies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/MedicalIncident');
      setIncidents(res.data);
    } catch (e) {
      setToast({ show: true, message: 'Lỗi tải danh sách sự cố', type: 'error' });
      setError('Lỗi tải danh sách sự cố');
      setShowError(true);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    const res = await axios.get('/api/Profile');
    const studentList = res.data.filter(p => p.RoleType === 'Student' || p.roleType === 'Student');
    setStudents(studentList);
    setLoadingStudents(false);
  };
  const fetchSupplies = async () => {
    setLoadingSupplies(true);
    const res = await axios.get('/api/MedicalSupply');
    setMedicalSupplies(res.data);
    setLoadingSupplies(false);
  };
  const fetchMedications = async () => {
    setLoadingMedications(true);
    const res = await axios.get('/api/Medication');
    setMedications(res.data);
    setLoadingMedications(false);
  };

  useEffect(() => { fetchIncidents(); fetchStudents(); fetchSupplies(); fetchMedications(); }, []);

  const handleSelect = (incident) => {
    setSelectedIncident(incident);
    setShowForm(false);
  };

  const handleAdd = () => {
    setSelectedIncident(null);
    setFormData({ IncidentType: '', Description: '', Severity: '', Location: '', ActionTaken: '', FollowUpRequired: '', Status: '', Notes: '', InvolvedStudents: [], UsedSupplies: [], UsedMedications: [] });
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = () => {
    if (!selectedIncident) return;
    setFormData({ ...selectedIncident, InvolvedStudents: selectedIncident.involvedStudents || [], UsedSupplies: selectedIncident.usedSupplies || [], UsedMedications: selectedIncident.usedMedications || [] });
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async () => {
    if (!selectedIncident) return;
    setLoading(true);
    try {
      await axios.delete(`/api/MedicalIncident/${selectedIncident.id}`);
      setToast({ show: true, message: 'Xóa sự cố thành công', type: 'success' });
      setSelectedIncident(null);
      fetchIncidents();
    } catch (e) {
      setToast({ show: true, message: 'Lỗi xóa sự cố', type: 'error' });
    }
    setLoading(false);
  };

  const validateForm = () => {
    if (!formData.IncidentType || !formData.Description || !formData.Severity || !formData.Location) {
      setFormError('Vui lòng nhập đầy đủ các trường bắt buộc.');
      return false;
    }
    if (formData.InvolvedStudents.length === 0) {
      setFormError('Vui lòng chọn ít nhất một học sinh liên quan.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (selectedIncident) {
        await axios.put(`/api/MedicalIncident/${selectedIncident.id}`, formData);
        setToast({ show: true, message: 'Cập nhật sự cố thành công', type: 'success' });
      } else {
        await axios.post('/api/MedicalIncident', formData);
        setToast({ show: true, message: 'Thêm sự cố thành công', type: 'success' });
      }
      setShowForm(false);
      fetchIncidents();
    } catch (e) {
      setToast({ show: true, message: 'Lỗi lưu sự cố', type: 'error' });
    }
    setLoading(false);
  };

  if (userRole !== 'Admin' && userRole !== 'MedicalStaff') {
    return <div style={{ color: 'red', padding: 20 }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="medical-incident-management">
      <h2>Quản lý khai báo tai nạn y tế</h2>
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
      <button onClick={handleAdd}>Thêm mới</button>
      {loading && <div>Đang tải...</div>}
      <div className="incident-list">
        <table>
          <thead>
            <tr>
              <th>Loại sự cố</th>
              <th>Mô tả</th>
              <th>Mức độ</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id} onClick={() => handleSelect(inc)}>
                <td>{inc.incidentType}</td>
                <td>{inc.description}</td>
                <td>{inc.severity}</td>
                <td>{inc.location}</td>
                <td>{inc.status}</td>
                <td>
                  <button onClick={handleEdit}>Sửa</button>
                  <button onClick={handleDelete}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="incident-form">
          <input placeholder="Loại sự cố*" value={formData.IncidentType} onChange={e => setFormData({ ...formData, IncidentType: e.target.value })} />
          <input placeholder="Mô tả*" value={formData.Description} onChange={e => setFormData({ ...formData, Description: e.target.value })} />
          <input placeholder="Mức độ*" value={formData.Severity} onChange={e => setFormData({ ...formData, Severity: e.target.value })} />
          <input placeholder="Vị trí*" value={formData.Location} onChange={e => setFormData({ ...formData, Location: e.target.value })} />
          <input placeholder="Biện pháp xử lý" value={formData.ActionTaken} onChange={e => setFormData({ ...formData, ActionTaken: e.target.value })} />
          <input placeholder="Yêu cầu theo dõi" value={formData.FollowUpRequired} onChange={e => setFormData({ ...formData, FollowUpRequired: e.target.value })} />
          <input placeholder="Trạng thái" value={formData.Status} onChange={e => setFormData({ ...formData, Status: e.target.value })} />
          <input placeholder="Ghi chú" value={formData.Notes} onChange={e => setFormData({ ...formData, Notes: e.target.value })} />
          <div>
            <label>Học sinh liên quan*:</label>
            {loadingStudents ? <span>Đang tải...</span> : (
              <select multiple value={formData.InvolvedStudents} onChange={e => setFormData({ ...formData, InvolvedStudents: Array.from(e.target.selectedOptions, option => option.value) })}>
                {students.map(s => (
                  <option key={s.UserID || s.userID} value={s.UserID || s.userID}>{s.Name || s.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label>Vật tư y tế sử dụng:</label>
            {loadingSupplies ? <span>Đang tải...</span> : (
              <select multiple value={formData.UsedSupplies} onChange={e => setFormData({ ...formData, UsedSupplies: Array.from(e.target.selectedOptions, option => option.value) })}>
                {medicalSupplies.map(s => (
                  <option key={s.supplyID || s.SupplyID} value={s.supplyID || s.SupplyID}>{s.supplyName || s.SupplyName}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label>Thuốc sử dụng:</label>
            {loadingMedications ? <span>Đang tải...</span> : (
              <select multiple value={formData.UsedMedications} onChange={e => setFormData({ ...formData, UsedMedications: Array.from(e.target.selectedOptions, option => option.value) })}>
                {medications.map(m => (
                  <option key={m.medicationID || m.MedicationID} value={m.medicationID || m.MedicationID}>{m.medicationName || m.MedicationName}</option>
                ))}
              </select>
            )}
          </div>
          {formError && <div style={{ color: 'red', margin: 8 }}>{formError}</div>}
          <button type="submit" disabled={loading}>Lưu</button>
          <button type="button" onClick={() => setShowForm(false)} disabled={loading}>Hủy</button>
        </form>
      )}
      {selectedIncident && !showForm && (
        <div className="incident-detail">
          <h3>Chi tiết sự cố</h3>
          <p><b>Loại:</b> {selectedIncident.incidentType}</p>
          <p><b>Mô tả:</b> {selectedIncident.description}</p>
          <p><b>Mức độ:</b> {selectedIncident.severity}</p>
          <p><b>Vị trí:</b> {selectedIncident.location}</p>
          <p><b>Biện pháp xử lý:</b> {selectedIncident.actionTaken}</p>
          <p><b>Yêu cầu theo dõi:</b> {selectedIncident.followUpRequired}</p>
          <p><b>Trạng thái:</b> {selectedIncident.status}</p>
          <p><b>Ghi chú:</b> {selectedIncident.notes}</p>
        </div>
      )}
      <ErrorDialog open={showError} message={error} onClose={() => setShowError(false)} />
    </div>
  );
};

export default MedicalIncidentManagement; 