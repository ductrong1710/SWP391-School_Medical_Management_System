import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MedicalIncidentHistory = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        let userId = user?.userID || user?.UserID || localStorage.getItem('userId');
        let apiUrl = '';
        if (userRole === 'Parent') {
          apiUrl = `/api/MedicalIncident/parent/${userId}/history`;
        } else if (userRole === 'Student') {
          apiUrl = `/api/MedicalIncident/student/${userId}/history`;
        }
        if (apiUrl) {
          const res = await axios.get(apiUrl);
          setIncidents(res.data);
        }
      } catch (e) {
        setToast({ show: true, message: 'Lỗi tải lịch sử sự cố', type: 'error' });
      }
      setLoading(false);
    };
    fetchIncidents();
  }, [userRole, user]);

  if (userRole !== 'Parent' && userRole !== 'Student') {
    return <div style={{ color: 'red', padding: 20 }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="medical-incident-history">
      <h2>Lịch sử tai nạn y tế của học sinh</h2>
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
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
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id} onClick={() => setSelectedIncident(inc)}>
                <td>{inc.incidentType}</td>
                <td>{inc.description}</td>
                <td>{inc.severity}</td>
                <td>{inc.location}</td>
                <td>{inc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedIncident && (
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
    </div>
  );
};

export default MedicalIncidentHistory; 