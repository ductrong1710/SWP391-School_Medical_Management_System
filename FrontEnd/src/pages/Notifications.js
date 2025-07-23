import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [selectedConsentFormId, setSelectedConsentFormId] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [denyError, setDenyError] = useState('');
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [selectedVaccineConsentFormId, setSelectedVaccineConsentFormId] = useState(null);
  const [vaccineDenyReason, setVaccineDenyReason] = useState('');
  const [vaccineDenyError, setVaccineDenyError] = useState('');

  const fetchNotifications = async () => {
    try {
      if (!user || !user.userID) return;
      const res = await apiClient.get(`/Notification/user/${user.userID}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    console.log('Notifications useEffect, notifications:', notifications);
  }, [notifications]);

  const handleApproveHealthCheck = async (consentFormId) => {
    try {
      await apiClient.post(`/HealthCheckConsentForm/${consentFormId}/approve`);
      alert('Đã xác nhận đồng ý khám sức khỏe!');
      fetchNotifications();
    } catch (err) {
      alert('Lỗi khi xác nhận đồng ý!');
    }
  };

  const handleDenyHealthCheck = async (consentFormId, reason) => {
    try {
      await apiClient.post(`/HealthCheckConsentForm/${consentFormId}/deny`, { Reason: reason });
      alert('Đã gửi từ chối khám sức khỏe!');
      fetchNotifications();
    } catch (err) {
      alert('Lỗi khi gửi từ chối!');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiClient.post(`/Notification/mark-as-read/${notificationId}`);
      fetchNotifications();
    } catch (err) {
      alert('Lỗi khi đánh dấu đã đọc!');
    }
  };

  const handleApproveConsent = async (consentFormId) => {
    try {
      await apiClient.post(`/VaccinationConsentForm/${consentFormId}/approve`);
      alert('Đã xác nhận đồng ý tiêm chủng!');
      fetchNotifications();
    } catch (err) {
      // Kiểm tra lỗi đã qua ngày tiêm chủng
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || '';
      if (msg && msg.toLowerCase().includes('past vaccination plan')) {
        alert('Kế hoạch đã qua ngày tiêm chủng, không thể xác nhận!');
      } else {
        alert('Lỗi khi xác nhận đồng ý tiêm chủng!');
      }
    }
  };

  const handleDenyConsent = async (consentFormId, reason) => {
    try {
      await apiClient.post(`/VaccinationConsentForm/${consentFormId}/deny`, { Reason: reason });
      alert('Đã gửi từ chối tiêm chủng!');
      fetchNotifications();
    } catch (err) {
      alert('Lỗi khi gửi từ chối tiêm chủng!');
    }
  };

  // Thêm hàm kiểm tra notification đã có kết quả hoặc là thông báo kết quả
  function hasResult(n) {
    // Nếu notification có trường resultStatus hoặc isConfirmed hoặc trạng thái đã hoàn thành, thì không hiện nút xác nhận
    if (n.resultStatus === 'Completed' || n.resultStatus === 'Hoàn thành' || n.isConfirmed === true) return true;
    // Nếu tiêu đề thông báo chứa từ 'kết quả' thì cũng không hiện nút xác nhận
    if (n.title && n.title.toLowerCase().includes('kết quả')) return true;
    return false;
  }

  if (loading) return <div>Đang tải thông báo...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Thông báo của bạn</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map((n, idx) => {
          // Log chi tiết các trường liên quan đến button xác nhận
          console.log('Notification item:', n);
          console.log('DEBUG: title:', n.title, '| consentFormID:', n.ConsentFormID, '| consentFormID (camel):', n.consentFormID, '| hasResult:', hasResult(n));
          const consentFormId = n.ConsentFormID || n.consentFormID || n.consentformid;
          // Sửa key để đảm bảo duy nhất
          const uniqueKey = n.notificationID ? n.notificationID : `notif-${idx}`;
          return (
            <li key={uniqueKey} style={{
              background: n.isRead ? '#f0f0f0' : '#e6f7ff',
              marginBottom: 12,
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontWeight: n.isRead ? 'normal' : 'bold' }}>{n.title}</div>
              <div style={{ margin: '8px 0' }}>{n.message}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
              {/* Nút xác nhận khám sức khỏe cho mọi notification có consentFormID, chỉ hiện nếu chưa có kết quả */}
              {n.title && n.title.toLowerCase().includes('sức khỏe') && consentFormId && !hasResult(n) && (
                <div style={{ marginTop: 8 }}>
                  <button
                    style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#38a169', color: '#fff', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedConsentFormId(consentFormId);
                      setShowHealthCheckModal(true);
                    }}
                  >
                    Xác nhận khám sức khỏe
                  </button>
                </div>
              )}
              {/* Nút xác nhận tiêm chủng - chỉ 1 nút, chỉ hiện nếu chưa có kết quả */}
              {n.title && n.title.toLowerCase().includes('tiêm chủng') && (n.ConsentFormID || n.consentFormID) && !hasResult(n) && (
                <div style={{ marginTop: 8 }}>
                  <button
                    style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: '#38a169', color: '#fff', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedVaccineConsentFormId(n.ConsentFormID || n.consentFormID);
                      setShowVaccineModal(true);
                    }}
                  >
                    Xác nhận tiêm chủng
                  </button>
                </div>
              )}
              {/* Nút đánh dấu đã đọc */}
              {!n.isRead && (
                <button onClick={() => handleMarkAsRead(n.notificationID)} style={{ marginTop: 8, marginLeft: 8, padding: '4px 12px', borderRadius: 4, border: 'none', background: '#3182ce', color: '#fff', cursor: 'pointer' }}>
                  Đánh dấu đã đọc
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {/* Modal xác nhận khám sức khỏe */}
      {showHealthCheckModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s'
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, padding: '36px 32px 28px 32px', minWidth: 340, maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)', fontFamily: 'Segoe UI, Arial, sans-serif', animation: 'fadeInModal 0.25s', position: 'relative'
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24, color: '#222', textAlign: 'center' }}>
              Bạn có đồng ý cho con tham gia khám sức khỏe không?
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 24 }}>
              <button
                onClick={async () => {
                  await handleApproveHealthCheck(selectedConsentFormId);
                  setShowHealthCheckModal(false);
                }}
                style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 600, boxShadow: '0 2px 8px rgba(56,161,105,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#2f855a'}
                onMouseOut={e => e.currentTarget.style.background = '#38a169'}
              >
                Đồng ý
              </button>
              <button
                style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 600, boxShadow: '0 2px 8px rgba(229,62,62,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => setDenyError(denyError ? '' : 'show')}
                onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
              >
                Từ chối
              </button>
            </div>
            {denyError === 'show' && (
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <textarea
                  placeholder="Nhập lý do từ chối..."
                  value={denyReason}
                  onChange={e => setDenyReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', borderRadius: 8, border: '1.5px solid #e2e8f0', padding: 12, fontSize: 16, fontFamily: 'inherit', resize: 'vertical', marginBottom: 8 }}
                />
                <div style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>{denyError && denyError !== 'show' ? denyError : ''}</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={async () => {
                      if (!denyReason.trim()) {
                        setDenyError('Vui lòng nhập lý do từ chối!');
                        return;
                      }
                      await handleDenyHealthCheck(selectedConsentFormId, denyReason);
                      setShowHealthCheckModal(false);
                      setDenyReason('');
                      setDenyError('');
                    }}
                    style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                    onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
                  >
                    Xác nhận từ chối
                  </button>
                  <button
                    onClick={() => { setShowHealthCheckModal(false); setDenyReason(''); setDenyError(''); }}
                    style={{ background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#718096'}
                    onMouseOut={e => e.currentTarget.style.background = '#a0aec0'}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
            {denyError !== 'show' && denyError && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{denyError}</div>}
            {!denyError && denyError !== 'show' && (
              <button
                onClick={() => { setShowHealthCheckModal(false); setDenyReason(''); setDenyError(''); }}
                style={{ background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', margin: '0 auto', display: 'block', marginTop: 18, transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#718096'}
                onMouseOut={e => e.currentTarget.style.background = '#a0aec0'}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal xác nhận tiêm chủng */}
      {showVaccineModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s'
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, padding: '36px 32px 28px 32px', minWidth: 340, maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)', fontFamily: 'Segoe UI, Arial, sans-serif', animation: 'fadeInModal 0.25s', position: 'relative'
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24, color: '#222', textAlign: 'center' }}>
              Bạn có đồng ý cho con tham gia tiêm chủng không?
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 24 }}>
              <button
                onClick={async () => {
                  await handleApproveConsent(selectedVaccineConsentFormId);
                  setShowVaccineModal(false);
                }}
                style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 600, boxShadow: '0 2px 8px rgba(56,161,105,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#2f855a'}
                onMouseOut={e => e.currentTarget.style.background = '#38a169'}
              >
                Đồng ý
              </button>
              <button
                style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 600, boxShadow: '0 2px 8px rgba(229,62,62,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => setVaccineDenyError(vaccineDenyError ? '' : 'show')}
                onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
              >
                Từ chối
              </button>
            </div>
            {vaccineDenyError === 'show' && (
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <textarea
                  placeholder="Nhập lý do từ chối..."
                  value={vaccineDenyReason}
                  onChange={e => setVaccineDenyReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', borderRadius: 8, border: '1.5px solid #e2e8f0', padding: 12, fontSize: 16, fontFamily: 'inherit', resize: 'vertical', marginBottom: 8 }}
                />
                <div style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>{vaccineDenyError && vaccineDenyError !== 'show' ? vaccineDenyError : ''}</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={async () => {
                      if (!vaccineDenyReason.trim()) {
                        setVaccineDenyError('Vui lòng nhập lý do từ chối!');
                        return;
                      }
                      await handleDenyConsent(selectedVaccineConsentFormId, vaccineDenyReason);
                      setShowVaccineModal(false);
                      setVaccineDenyReason('');
                      setVaccineDenyError('');
                    }}
                    style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                    onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
                  >
                    Xác nhận từ chối
                  </button>
                  <button
                    onClick={() => { setShowVaccineModal(false); setVaccineDenyReason(''); setVaccineDenyError(''); }}
                    style={{ background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#718096'}
                    onMouseOut={e => e.currentTarget.style.background = '#a0aec0'}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
            {vaccineDenyError !== 'show' && vaccineDenyError && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{vaccineDenyError}</div>}
            {!vaccineDenyError && vaccineDenyError !== 'show' && (
              <button
                onClick={() => { setShowVaccineModal(false); setVaccineDenyReason(''); setVaccineDenyError(''); }}
                style={{ background: '#a0aec0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', margin: '0 auto', display: 'block', marginTop: 18, transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#718096'}
                onMouseOut={e => e.currentTarget.style.background = '#a0aec0'}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 