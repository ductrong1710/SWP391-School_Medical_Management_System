import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HealthCheckResultForm from '../components/HealthCheckResultForm';
import * as healthCheckService from '../services/healthCheckService';

jest.mock('../services/healthCheckService');

// --- Các describe/test liên quan đến HealthCheckResultForm ---

describe('HealthCheckResultForm', () => {
  const defaultProps = {
    consentFormId: 'c1',
    existingResult: {},
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
    checkUpType: 'Khám sức khỏe định kỳ',
    checker: 'doctor1',
  };
  
//////////////////////UI rendering
//kiểm tra component HealthCheckResultForm có render đầy 
// đủ các trường bắt buộc (required), các trường chỉ đọc (read-only),
// checkbox, trường trạng thái (không bắt buộc), và các nút submit/hủy hay không.
  test('renders all required and read-only fields', () => {
    render(<HealthCheckResultForm {...defaultProps} />);
    // Required fields
    expect(screen.getByLabelText(/chiều cao/i)).toBeRequired();
    expect(screen.getByLabelText(/cân nặng/i)).toBeRequired();
    expect(screen.getByLabelText(/huyết áp/i)).toBeRequired();
    expect(screen.getByLabelText(/nhịp tim/i)).toBeRequired();
    expect(screen.getByLabelText(/thị lực/i)).toBeRequired();
    expect(screen.getByLabelText(/thính lực/i)).toBeRequired();
    expect(screen.getByLabelText(/răng miệng/i)).toBeRequired();
    expect(screen.getByLabelText(/cột sống/i)).toBeRequired();
    expect(screen.getByLabelText(/kết luận/i)).toBeRequired();
    expect(screen.getByLabelText(/người khám/i)).toBeRequired();
    // Read-only fields
    expect(screen.getByLabelText(/ngày khám/i)).toHaveAttribute('readonly');
    expect(screen.getByLabelText(/cơ sở khám/i)).toHaveAttribute('readonly');
    expect(screen.getByLabelText(/loại khám/i)).toHaveAttribute('readonly');
    // Checkbox
    expect(screen.getByLabelText(/cần liên hệ phụ huynh/i)).toBeInTheDocument();
    // Status (not required)
    expect(screen.getByLabelText(/trạng thái/i)).not.toBeRequired();
    // Submit and cancel buttons
    expect(screen.getByRole('button', { name: /lưu kết quả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hủy/i })).toBeInTheDocument();
  });
////////////////////State
  test('shows followUpDate only when needToContactParent is checked', () => {
    render(<HealthCheckResultForm {...defaultProps} />);
    // Initially not present
    expect(screen.queryByLabelText(/ngày hẹn tái khám/i)).toBeNull();
    // Check the box
    fireEvent.click(screen.getByLabelText(/cần liên hệ phụ huynh/i));
    expect(screen.getByLabelText(/ngày hẹn tái khám/i)).toBeInTheDocument();
  });
  test('có thể nhập checkbox và ngày hẹn tái khám', () => {
    render(<HealthCheckResultForm {...defaultProps} />);
    const checkbox = screen.getByLabelText(/cần liên hệ phụ huynh/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    const followUpDate = screen.getByLabelText(/ngày hẹn tái khám/i);
    fireEvent.change(followUpDate, { target: { value: '2025-08-01' } });
    expect(followUpDate.value).toBe('2025-08-01');
  });
/////////////////////Sự kiện
  test('submit form thành công', async () => {
    healthCheckService.createHealthCheckResult.mockResolvedValue({});
    const onSuccess = jest.fn();
    render(<HealthCheckResultForm {...defaultProps} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
    fireEvent.click(screen.getByTestId('submit-result-btn'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
/////////////////////Xử lý API call
  test('hiển thị lỗi khi submit thất bại', async () => {
    healthCheckService.createHealthCheckResult.mockRejectedValue({ response: { data: 'Lỗi backend' } });
    render(<HealthCheckResultForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
    fireEvent.click(screen.getByTestId('submit-result-btn'));
    expect(await screen.findByTestId('result-form-error')).toHaveTextContent(/lỗi lưu kết quả/i);
  });
  
});

describe('HealthCheckResultForm branch coverage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('default checker/checkUpType fallback', async () => {
    healthCheckService.createHealthCheckResult.mockResolvedValue({});
    render(<HealthCheckResultForm consentFormId="c1" />);
    fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
    fireEvent.click(screen.getByTestId('submit-result-btn'));
    await waitFor(() => expect(healthCheckService.createHealthCheckResult).toHaveBeenCalled());
  });

test('tạo mới record khi không có existingResult', async () => {
  healthCheckService.createHealthCheckResult.mockResolvedValue({});
  const onSuccess = jest.fn();
  render(<HealthCheckResultForm consentFormId="c1" onSuccess={onSuccess} />);
  fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
  fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
  fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
  fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
  fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});

/////////////////////Sự kiện
  test('submit với trường rỗng để nhận null', async () => {
    healthCheckService.createHealthCheckResult.mockResolvedValue({});
    render(<HealthCheckResultForm consentFormId="c1" disableRequired />);
    fireEvent.click(screen.getByTestId('submit-result-btn'));
    await waitFor(() => expect(healthCheckService.createHealthCheckResult).toHaveBeenCalled());
  });

  test('hiển thị lỗi không xác định khi submit thất bại không có error.response', async () => {
    healthCheckService.createHealthCheckResult.mockRejectedValue({ message: 'Network error' });
    render(<HealthCheckResultForm consentFormId="c1" />);
    fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
    fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
    fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
    fireEvent.click(screen.getByTestId('submit-result-btn'));
    expect(await screen.findByTestId('result-form-error')).toHaveTextContent(/lỗi không xác định/i);
  });

/////////////////////Sự kiện
  test('submit không nhập ngày khám và ngày hẹn tái khám', async () => {
    healthCheckService.createHealthCheckResult.mockResolvedValue({});
    render(<HealthCheckResultForm consentFormId="c1" disableRequired />);
    // Không nhập ngày khám, chỉ submit
    fireEvent.click(screen.getByTestId('submit-result-btn'));
    await waitFor(() => expect(healthCheckService.createHealthCheckResult).toHaveBeenCalled());
  });
});

test('hiển thị lỗi khi error.response.data là object', async () => {
  healthCheckService.createHealthCheckResult.mockRejectedValue({
    response: { data: { msg: 'Lỗi object' } }
  });
  render(<HealthCheckResultForm consentFormId="c1" />);
  fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
  fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
  fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
  fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
  fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  expect(await screen.findByTestId('result-form-error')).toHaveTextContent(/lỗi lưu kết quả/i);
});

test('hiển thị lỗi khi error.response.data là undefined', async () => {
  healthCheckService.createHealthCheckResult.mockRejectedValue({
    response: { status: 500, statusText: 'Internal Server Error' }
  });
  render(<HealthCheckResultForm consentFormId="c1" />);
  fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
  fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
  fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
  fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
  fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  expect(await screen.findByTestId('result-form-error')).toHaveTextContent(/http 500/i);
});

test('hiển thị lỗi khi error.response không có statusText', async () => {
  healthCheckService.createHealthCheckResult.mockRejectedValue({
    response: { status: 400 }
  });
  render(<HealthCheckResultForm consentFormId="c1" />);
  fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
  fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
  fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
  fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
  fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '10/10' } });
  fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: 'tốt' } });
  fireEvent.change(screen.getByLabelText(/người khám/i), { target: { value: 'doctor1' } });
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  expect(await screen.findByTestId('result-form-error')).toHaveTextContent(/lỗi lưu kết quả/i);
});
/////////////////////Sự kiện
test('submit với height, weight, bloodPressure, heartRate = 0', async () => {
  healthCheckService.createHealthCheckResult.mockResolvedValue({});
  render(<HealthCheckResultForm consentFormId="c1" disableRequired />);
  fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '0' } });
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  await waitFor(() => expect(healthCheckService.createHealthCheckResult).toHaveBeenCalled());
});
/////////////////////Sự kiện
test('submit với eyesight, hearing, oralHealth, spine, conclusion rỗng', async () => {
  healthCheckService.createHealthCheckResult.mockResolvedValue({});
  render(<HealthCheckResultForm consentFormId="c1" disableRequired />);
  fireEvent.change(screen.getByLabelText(/chiều cao/i), { target: { value: '150' } });
  fireEvent.change(screen.getByLabelText(/cân nặng/i), { target: { value: '40' } });
  fireEvent.change(screen.getByLabelText(/huyết áp/i), { target: { value: '120' } });
  fireEvent.change(screen.getByLabelText(/nhịp tim/i), { target: { value: '80' } });
  fireEvent.change(screen.getByLabelText(/thị lực/i), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText(/thính lực/i), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText(/răng miệng/i), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText(/cột sống/i), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText(/kết luận/i), { target: { value: '' } });
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  await waitFor(() => expect(healthCheckService.createHealthCheckResult).toHaveBeenCalled());
});
/////////////////////Sự kiện
test('submit với tất cả trường rỗng để cover nhánh null', async () => {
  healthCheckService.createHealthCheckResult.mockResolvedValue({});
  render(<HealthCheckResultForm consentFormId="c1" />);
  fireEvent.click(screen.getByTestId('submit-result-btn'));
  await waitFor(() => expect(healthCheckService.createHealthCheckResult).toHaveBeenCalled());
}); 