import apiClient from './apiClient';

// Lấy danh sách học sinh đã đồng ý khám của 1 kế hoạch
export const getApprovedStudents = (planId) =>
  apiClient.get(`/HealthCheckConsentForm/plan/${planId}/filter?statusId=1`);

// Lấy tất cả học sinh của 1 kế hoạch
export const getAllStudents = (planId) =>
  apiClient.get(`/HealthCheckConsentForm/plan/${planId}/filter`);

// Xác nhận đồng ý
export const approveConsent = (consentFormId) =>
  apiClient.post(`/HealthCheckConsentForm/${consentFormId}/approve`);

// Từ chối, truyền lý do
export const denyConsent = (consentFormId, reason) =>
  apiClient.post(`/HealthCheckConsentForm/${consentFormId}/deny`, { Reason: reason });

// Nhập kết quả khám
export const createHealthCheckResult = (data) =>
  apiClient.post('/HealthCheckResult', data);

// Cập nhật kết quả khám
export const updateHealthCheckResult = (id, data) =>
  apiClient.put(`/HealthCheckResult/${id}`, data);

// Lấy kết quả khám theo consentFormId
export const getResultByConsent = (consentFormId) =>
  apiClient.get(`/HealthCheckResult/consent/${consentFormId}`);

// Lấy lịch sử kiểm tra y tế định kỳ của học sinh (kèm kết quả khám)
export const getHealthCheckHistoryWithResult = (studentId) =>
  apiClient.get(`/HealthCheckConsentForm/student/${studentId}/history`);

// Lấy tất cả kết quả khám sức khỏe
export const getAllHealthCheckResults = () =>
  apiClient.get('/HealthCheckResult'); 