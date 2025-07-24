import React, { useState, useEffect } from 'react';
import { createHealthCheckResult, updateHealthCheckResult } from '../services/healthCheckService';
import './HealthCheckResultForm.css';

function generateId() {
  // Sinh ID dạng HR + 4 số ngẫu nhiên, ví dụ: HR1234
  return 'HR' + Math.floor(1000 + Math.random() * 9000);
}

function HealthCheckResultForm({ consentFormId, existingResult, onSuccess, onCancel, checkUpType, checker }) {
  // Lấy ngày hiện tại yyyy-MM-dd
  const today = new Date().toISOString().split('T')[0];
  const defaultResult = {
    height: '',
    weight: '',
    bloodPressure: '',
    heartRate: '',
    eyesight: '',
    hearing: '',
    oralHealth: '',
    spine: '',
    conclusion: '',
    checkUpDate: today,
    checker: checker || '',
    needToContactParent: false,
    followUpDate: '',
    status: '',
    healthFacility: 'Phòng Y Tế Trường',
    checkUpType: checkUpType || '',
  };
  const [resultData, setResultData] = useState({
    ...defaultResult,
    ...existingResult
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setResultData(prev => ({
      ...prev,
      checkUpDate: today,
      healthFacility: 'Phòng Y Tế Trường',
      checkUpType: checkUpType || '',
      checker: checker || prev.checker
    }));
    // eslint-disable-next-line
  }, [checkUpType, checker]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResultData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Generate ID for new records
    const recordId = existingResult && (existingResult.ID || existingResult.id) 
      ? (existingResult.ID || existingResult.id) 
      : generateId();
    
    const payload = {
      ID: recordId,
      HealthCheckConsentID: consentFormId,
      Height: resultData.height ? Number(resultData.height) : null,
      Weight: resultData.weight ? Number(resultData.weight) : null,
      BloodPressure: resultData.bloodPressure ? Number(resultData.bloodPressure) : null,
      HeartRate: resultData.heartRate ? Number(resultData.heartRate) : null,
      Eyesight: resultData.eyesight || null,
      Hearing: resultData.hearing || null,
      OralHealth: resultData.oralHealth || null,
      Spine: resultData.spine || null,
      Conclusion: resultData.conclusion || null,
      CheckUpDate: resultData.checkUpDate ? new Date(resultData.checkUpDate).toISOString() : new Date().toISOString(),
      Checker: resultData.checker || null,
      NeedToContactParent: resultData.needToContactParent || false,
      FollowUpDate: resultData.followUpDate ? new Date(resultData.followUpDate).toISOString() : null,
      Status: resultData.status || null,
      HealthFacility: resultData.healthFacility || null,
      CheckupType: resultData.checkUpType || null
    };
    
    console.log('DATA TO SEND:', payload);
    console.log('ConsentFormId:', consentFormId);
    
    try {
      await createHealthCheckResult(payload);
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error creating health check result:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response) {
        const errorMessage = error.response.data 
          ? (typeof error.response.data === 'string' 
              ? error.response.data 
              : JSON.stringify(error.response.data))
          : `HTTP ${error.response.status}: ${error.response.statusText}`;
        alert('Lỗi lưu kết quả: ' + errorMessage);
      } else {
        alert('Lỗi không xác định: ' + error.message);
      }
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay result-modal">
      <div className="modal-content">
        <div className="modal-title">NHẬP KẾT QUẢ KHÁM SỨC KHỎE</div>
        <form onSubmit={handleSubmit} className="health-check-result-form center-form">
          <table className="result-table">
            <tbody>
              <tr>
                <td className="label-cell">
                  <label htmlFor="height">Chiều cao (cm) <span className="required-star">*</span></label>
                </td>
                <td><input id="height" type="number" name="height" value={resultData.height} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="weight">Cân nặng (kg) <span className="required-star">*</span></label>
                </td>
                <td><input id="weight" type="number" name="weight" value={resultData.weight} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="bloodPressure">Huyết áp <span className="required-star">*</span></label>
                </td>
                <td><input id="bloodPressure" type="number" name="bloodPressure" value={resultData.bloodPressure} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="heartRate">Nhịp tim <span className="required-star">*</span></label>
                </td>
                <td><input id="heartRate" type="number" name="heartRate" value={resultData.heartRate} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="eyesight">Thị lực <span className="required-star">*</span></label>
                </td>
                <td><input id="eyesight" type="text" name="eyesight" value={resultData.eyesight} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="hearing">Thính lực <span className="required-star">*</span></label>
                </td>
                <td><input id="hearing" type="text" name="hearing" value={resultData.hearing} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="oralHealth">Răng miệng <span className="required-star">*</span></label>
                </td>
                <td><input id="oralHealth" type="text" name="oralHealth" value={resultData.oralHealth} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="spine">Cột sống <span className="required-star">*</span></label>
                </td>
                <td><input id="spine" type="text" name="spine" value={resultData.spine} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="conclusion">Kết luận <span className="required-star">*</span></label>
                </td>
                <td><input id="conclusion" type="text" name="conclusion" value={resultData.conclusion} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="checkUpDate">Ngày khám <span className="required-star">*</span></label>
                </td>
                <td><input id="checkUpDate" type="text" name="checkUpDate" value={today} readOnly className="input-cell" /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="checker">Người khám <span className="required-star">*</span></label>
                </td>
                <td><input id="checker" type="text" name="checker" value={resultData.checker} onChange={handleInputChange} className="input-cell" required /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="needToContactParent">Cần liên hệ phụ huynh</label>
                </td>
                <td><input id="needToContactParent" type="checkbox" name="needToContactParent" checked={resultData.needToContactParent} onChange={handleInputChange} /></td>
              </tr>
              {resultData.needToContactParent && (
                <tr>
                  <td className="label-cell">
                    <label htmlFor="followUpDate">Ngày hẹn tái khám</label>
                  </td>
                  <td><input id="followUpDate" type="date" name="followUpDate" value={resultData.followUpDate} onChange={handleInputChange} className="input-cell" /></td>
                </tr>
              )}
              <tr>
                <td className="label-cell">
                  <label htmlFor="status">Trạng thái</label>
                </td>
                <td><input id="status" type="text" name="status" value={resultData.status} onChange={handleInputChange} className="input-cell" /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="healthFacility">Cơ sở khám</label>
                </td>
                <td><input id="healthFacility" type="text" name="healthFacility" value={resultData.healthFacility} readOnly className="input-cell" /></td>
              </tr>
              <tr>
                <td className="label-cell">
                  <label htmlFor="checkUpType">Loại khám</label>
                </td>
                <td><input id="checkUpType" type="text" name="checkUpType" value={resultData.checkUpType} readOnly className="input-cell" /></td>
              </tr>
            </tbody>
          </table>
          <div className="modal-actions center-actions">
            <button type="submit" className="submit-btn">Lưu kết quả</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HealthCheckResultForm; 