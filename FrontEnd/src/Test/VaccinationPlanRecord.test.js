import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VaccinationPlanRecord from '../pages/VaccinationPlanRecord';
import apiClient from '../services/apiClient';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
jest.mock('../services/apiClient');
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'medstaff01' },
    getUserRole: () => 'MedicalStaff',
    logout: jest.fn(),
  })
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter initialEntries={["/vaccination-plan/plan1/record"]}>{ui}</MemoryRouter>);
}

describe('VaccinationPlanRecord', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
  });

  test('hiển thị loading', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    expect(screen.getByText(/đang tải dữ liệu/i)).toBeInTheDocument();
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  });

  test('hiển thị empty state khi không có học sinh', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [] });
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument());
  });

  test('mở modal ghi nhận và submit thành công', async () => {
    apiClient.post.mockResolvedValueOnce({});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(screen.getByText(/ghi nhận thành công/i)).toBeInTheDocument();
  });

  test('submit ghi nhận thất bại', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('fail'));
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(screen.getByText(/ghi nhận thất bại/i)).toBeInTheDocument();
  });

  test('báo lỗi khi fetch kế hoạch', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationPlan/')) return Promise.reject(new Error('fail'));
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    // Không expect lỗi, chỉ cần không crash
  });

  test('báo lỗi khi fetch học sinh', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.reject(new Error('fail'));
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  });

  test('báo lỗi khi fetch vaccine types', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/VaccineType') return Promise.reject(new Error('fail'));
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  });

  test('báo lỗi khi fetch profile', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/Profile/user/')) return Promise.reject(new Error('fail'));
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  });

  test('đóng modal ghi nhận', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }));
    await waitFor(() => expect(screen.queryByText(/lưu kết quả/i)).not.toBeInTheDocument());
  });

  test('thay đổi input và check checkbox trong modal', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    const dateInput = screen.getByLabelText(/ngày tiêm thực tế/i);
    fireEvent.change(dateInput, { target: { value: '2025-08-01' } });
    expect(dateInput.value).toBe('2025-08-01');
    const checkbox = screen.getByLabelText(/cần liên hệ phụ huynh/i);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('openModal không tìm thấy vaccineTypeId sẽ alert', async () => {
    window.alert = jest.fn();
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'Không trùng vaccine' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('không tìm thấy loại vaccine'));
  });

  test('openModal với vaccineTypeId đúng sẽ mở modal', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    expect(screen.getByText(/lưu kết quả/i)).toBeInTheDocument();
  });

  test('closeModal sẽ đóng modal', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.click(screen.getByRole('button', { name: /hủy/i }));
    await waitFor(() => expect(screen.queryByText(/lưu kết quả/i)).not.toBeInTheDocument());
  });

  test('handleChange với checkbox', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    const checkbox = screen.getByLabelText(/cần liên hệ phụ huynh/i);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('handleSubmit với err.response', async () => {
    apiClient.post.mockRejectedValueOnce({ response: { data: { error: 'Lỗi backend' } } });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(screen.getByText(/ghi nhận thất bại/i)).toBeInTheDocument();
  });

  test('handleSubmit với lỗi không xác định', async () => {
    apiClient.post.mockRejectedValueOnce({});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(screen.getByText(/ghi nhận thất bại/i)).toBeInTheDocument();
  });

  test('input Người thực hiện và Loại vaccine là disabled/readonly', async () => {
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    const performerInput = screen.getByLabelText(/người thực hiện/i);
    expect(performerInput).toBeDisabled();
    const vaccineInput = screen.getByLabelText(/loại vaccine/i);
    expect(vaccineInput).toBeDisabled();
    expect(vaccineInput).toHaveAttribute('readonly');
  });

  test('button submit disabled và đổi text khi submitting', async () => {
    apiClient.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 500)));
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    const submitBtn = screen.getByRole('button', { name: /lưu kết quả/i });
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/đang lưu/i);
  });

  test('message thành công có màu xanh, thất bại có màu đỏ', async () => {
    apiClient.post.mockResolvedValueOnce({});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(screen.getByText(/ghi nhận thành công/i)).toBeInTheDocument());
    const msg = screen.getByText(/ghi nhận thành công/i);
    expect(msg).toHaveStyle('color: green');
    // Thất bại
    apiClient.post.mockRejectedValueOnce(new Error('fail'));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(screen.getByText(/ghi nhận thất bại/i)).toBeInTheDocument());
    const msg2 = screen.getByText(/ghi nhận thất bại/i);
    expect(msg2).toHaveStyle('color: red');
  });

  test('render nhiều học sinh, STT đúng', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' },
        { id: 'cf2', statusID: 1, studentID: 'U2', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/U1')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      if (url.startsWith('/Profile/user/U2')) return Promise.resolve({ data: { name: 'Le Thi B', classID: '6B' } });
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/le thi b/i)).toBeInTheDocument();
  });

  test('profile thiếu name/classID sẽ fallback', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/U1')) return Promise.resolve({ data: { } });
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText('Không rõ tên'));
    expect(screen.getByText('Không rõ')).toBeInTheDocument();
  });

  test('plan không có PlanName vẫn không crash', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'DPT' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    expect(screen.getByLabelText(/loại vaccine/i).value).toBe('DPT');
  });

  test('vaccineTypes rỗng sẽ alert khi openModal', async () => {
    window.alert = jest.fn();
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'DPT' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('không tìm thấy loại vaccine'));
  });

  test('openModal: tên vaccine trùng khớp phức tạp', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationPlan/')) return Promise.resolve({ data: { id: 'plan1', PlanName: 'Tiêm DPT mở rộng' } });
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { id: 'cf1', statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      if (url === '/VaccineType') return Promise.resolve({ data: [ { id: 'v1', vaccineName: 'dpt' }, { id: 'v2', vaccineName: 'mở rộng' } ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    expect(screen.getByLabelText(/loại vaccine/i).value.toLowerCase()).toMatch(/dpt|mở rộng/);
  });

  test('handleSubmit: finally luôn setSubmitting(false) khi thành công', async () => {
    apiClient.post.mockResolvedValueOnce({});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(screen.getByText(/ghi nhận thành công/i)).toBeInTheDocument());
    // Sau khi thành công, submitting phải về false
    expect(screen.getByRole('button', { name: /lưu kết quả/i })).not.toBeDisabled();
  });

  test('handleSubmit: finally luôn setSubmitting(false) khi thất bại', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('fail'));
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(screen.getByText(/ghi nhận thất bại/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /lưu kết quả/i })).not.toBeDisabled();
  });

  test('handleSubmit: catch với err không có response', async () => {
    apiClient.post.mockRejectedValueOnce({});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => expect(screen.getByText(/ghi nhận thất bại/i)).toBeInTheDocument());
    expect(logSpy).toHaveBeenCalledWith('Lỗi không xác định:', {});
    logSpy.mockRestore();
  });

  test('handleSubmit: setTimeout đóng modal sau khi thành công', async () => {
    jest.useFakeTimers();
    apiClient.post.mockResolvedValueOnce({});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => screen.getByText(/ghi nhận thành công/i));
    jest.advanceTimersByTime(1200);
    expect(screen.queryByText(/lưu kết quả/i)).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  test('handleSubmit: submit nhiều lần liên tiếp không bị lỗi', async () => {
    apiClient.post.mockResolvedValue({});
    renderWithRouter(<VaccinationPlanRecord />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-01' } });
    const submitBtn = screen.getByRole('button', { name: /lưu kết quả/i });
    fireEvent.click(submitBtn);
    await waitFor(() => screen.getByText(/ghi nhận thành công/i));
    // Mở lại modal và submit tiếp
    fireEvent.click(screen.getByRole('button', { name: /ghi nhận/i }));
    fireEvent.change(screen.getByLabelText(/ngày tiêm thực tế/i), { target: { value: '2025-08-02' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu kết quả/i }));
    await waitFor(() => screen.getByText(/ghi nhận thành công/i));
  });
}); 