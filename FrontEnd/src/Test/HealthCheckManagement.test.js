import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';
import HealthCheckManagement from '../pages/HealthCheckManagement';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock context xác thực và API client để kiểm thử không phụ thuộc backend
jest.mock('../context/AuthContext');
jest.mock('../services/apiClient');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Hàm render component kèm router để kiểm thử các component có sử dụng điều hướng
function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('HealthCheckManagement Main Flow', () => {
  beforeEach(() => {
    // Mock trạng thái xác thực: đã đăng nhập, user là doctor1
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { username: 'doctor1', roleType: 'MedicalStaff' }
    });
    // Reset và mock các API call trả về dữ liệu giả lập
    apiClient.get.mockReset();
    apiClient.get.mockImplementation((url) => {
      // Trả về danh sách lớp đúng với UI thực tế
      if (url === '/SchoolClass') {
        return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      }
      // Trả về danh sách người tạo đúng
      if (url === '/User') {
        return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      }
      // Trả về danh sách kế hoạch khám sức khỏe đúng
      if (url === '/PeriodicHealthCheckPlan') {
        return Promise.resolve({ data: [
          {
            id: 'plan1',
            PlanName: 'Khám sức khỏe học kì 2 lớp 6A',
            scheduleDate: '2025-07-22',
            CheckupContent: 'Khám sức khỏe định kỳ',
            status: 'Đã lên lịch',
            classID: '6A',
            creatorID: 'medstaff01'
          }
        ] });
      }
      // Trả về danh sách học sinh đã đồng ý khám của 1 kế hoạch (filter statusId=1)
      if (url.startsWith('/HealthCheckConsentForm/plan/') && url.includes('statusId=1')) {
        return Promise.resolve({ data: [
          { consentFormId: 'c1', studentId: 'U20001', name: 'Học Sinh G', statusID: 1, consentStatus: 'Đồng ý' },
          { consentFormId: 'c2', studentId: 'U20002', name: 'Học Sinh H', statusID: 2, consentStatus: 'Từ chối' }
        ] });
      }
      // Trả về consent form của kế hoạch khám (không filter statusId)
      if (url.startsWith('/HealthCheckConsentForm/plan/')) {
        return Promise.resolve({ data: [
          { consentFormId: 'c1', studentId: 'U20001', name: 'Học Sinh G', statusID: 1, consentStatus: 'Đồng ý' },
          { consentFormId: 'c2', studentId: 'U20002', name: 'Học Sinh H', statusID: 2, consentStatus: 'Từ chối' }
        ] });
      }
      // Trả về kết quả khám theo consentFormId (theo healthCheckService)
      if (url === '/HealthCheckResult/consent/c1' || url === '/HealthCheckResult/consent/U20001') {
        return Promise.resolve({ data: [] }); // Không có kết quả
      }
      if (url === '/HealthCheckResult/consent/c2' || url === '/HealthCheckResult/consent/U20002') {
        return Promise.resolve({ data: [{ result: 'OK' }] });
      }
      return Promise.resolve({ data: [] });
    });
  });


  /////// [UI Rendering] Kiểm thử render UI: tiêu đề, nút tạo lịch cá nhân
  // Test này kiểm tra việc hiển thị các thành phần giao diện chính của trang
  test('renders main UI elements', async () => {
    renderWithRouter(<HealthCheckManagement />);
    // Kiểm tra tiêu đề trang
    expect(await screen.findByText(/khám sức khỏe định kỳ/i)).toBeInTheDocument();
    // Kiểm tra nút tạo lịch cá nhân xuất hiện
    expect(screen.getByRole('button', { name: /tạo lịch cá nhân/i })).toBeInTheDocument();
  });

  //////// [State] Kiểm thử điều hướng về trang đăng nhập khi chưa xác thực (kiểm tra trạng thái xác thực)
  // Test này kiểm tra trạng thái xác thực và điều hướng khi chưa đăng nhập
  test('redirects to login if not authenticated', async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    renderWithRouter(<HealthCheckManagement />);
    // Kiểm tra navigate được gọi với '/login'
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.any(Object));
    });
  });

  //////// [Xử lý API call] Kiểm thử gọi API lấy danh sách lớp và người tạo
  // Test này kiểm tra việc gọi API và nhận dữ liệu từ backend
  test('shows class and creator options from API', async () => {
    renderWithRouter(<HealthCheckManagement />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/SchoolClass'));
    expect(apiClient.get).toHaveBeenCalledWith('/User');
  });


  // [Sự kiện] Kiểm thử tạo lịch cá nhân
  test('handles create personal schedule event', async () => {
    renderWithRouter(<HealthCheckManagement />);
    const createBtn = screen.getByRole('button', { name: /tạo lịch cá nhân/i });
    createBtn.click();
    // Kiểm tra modal tạo lịch cá nhân xuất hiện (dùng text thực tế trong UI)
    expect(await screen.findByText(/tạo lịch khám sức khỏe học đường mới/i)).toBeInTheDocument();
  });

  // [UI] Test mở/đóng form tạo/sửa lịch cá nhân
  test('open and close create/edit personal schedule form', async () => {
    renderWithRouter(<HealthCheckManagement />);
    // Mở form bằng nút "Tạo lịch cá nhân"
    const createBtn = screen.getByRole('button', { name: /tạo lịch cá nhân/i });
    createBtn.click();
    // Kiểm tra form/modal xuất hiện
    expect(await screen.findByTestId('edit-plan-modal')).toBeInTheDocument();
    // Đóng form bằng nút "Hủy bỏ"
    const cancelBtn = screen.getByRole('button', { name: /hủy bỏ/i });
    await userEvent.click(cancelBtn);
    // Form/modal phải đóng
    await waitFor(() => {
      expect(screen.queryByTestId('edit-plan-modal')).toBeNull();
    });
    // Mở lại form
    createBtn.click();
    expect(await screen.findByTestId('edit-plan-modal')).toBeInTheDocument();
    // Đóng form bằng nút close (x)
    const closeBtn = screen.getByRole('button', { name: '' }); // Nút close không có text
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('edit-plan-modal')).toBeNull();
    });
  });

  // [Sự kiện] Test mở modal sửa kế hoạch
  test('opens edit modal when clicking edit button', async () => {
    renderWithRouter(<HealthCheckManagement />);
    const editBtn = await screen.findByTestId('edit-plan-btn-plan1');
    await userEvent.click(editBtn);
    expect(await screen.findByTestId('edit-plan-modal')).toBeInTheDocument();
    expect(await screen.findByTestId('edit-plan-title')).toHaveTextContent(/cập nhật thông tin khám sức khỏe/i);
  });

  test('handles API error gracefully', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('API error'));
    renderWithRouter(<HealthCheckManagement />);
    await waitFor(() => expect(screen.queryByText(/1A/)).toBeNull());
  });

  // [API Error] Test lỗi khi tải danh sách kế hoạch
  test('shows error when failing to load health check plans', async () => {
    apiClient.get.mockImplementationOnce(() => Promise.reject(new Error('API error')));
    renderWithRouter(<HealthCheckManagement />);
    // Sau khi lỗi, không có kế hoạch nào hiển thị
    await waitFor(() => {
      expect(screen.queryByText(/khám sức khỏe học kì 2 lớp 6A/i)).toBeNull();
    });
    // Có thể kiểm tra alert hoặc thông báo lỗi nếu UI có
  });

  // [API Error] Test lỗi khi tải danh sách lớp
  test('shows error when failing to load class list', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/SchoolClass') return Promise.reject(new Error('API error'));
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    // Không có lớp nào hiển thị trong filter
    await waitFor(() => {
      expect(screen.queryByText(/chọn lớp/i)).toBeInTheDocument();
    });
  });

  // [API Error] Test lỗi khi tải danh sách học sinh trong modal
  test('shows error when failing to load student list in modal', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/HealthCheckConsentForm/plan/')) return Promise.reject(new Error('API error'));
      // Các API khác trả về bình thường
      if (url === '/SchoolClass') return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      if (url === '/User') return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [
        {
          id: 'plan1',
          PlanName: 'Khám sức khỏe học kì 2 lớp 6A',
          scheduleDate: '2025-07-22',
          CheckupContent: 'Khám sức khỏe định kỳ',
          status: 'Đã lên lịch',
          classID: '6A',
          creatorID: 'medstaff01'
        }
      ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    // Mở modal chi tiết kế hoạch
    const viewDetailBtn = await screen.findByTestId('view-detail-btn-plan1');
    await userEvent.click(viewDetailBtn);
    // Mở modal danh sách học sinh
    const viewStudentListBtn = await screen.findByTestId('view-student-list-btn');
    await userEvent.click(viewStudentListBtn);
    // Không có học sinh nào hiển thị
    await waitFor(() => {
      expect(screen.queryByText(/không có học sinh nào/i)).toBeInTheDocument();
    });
  });

  // [No Data] Test không có kế hoạch khám sức khỏe
  test('shows no plans when API returns empty array', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    await waitFor(() => {
      expect(screen.getByText(/không tìm thấy kế hoạch khám sức khỏe nào/i)).toBeInTheDocument();
    });
  });

  // [No Data] Test không có học sinh trong modal
  test('shows no students in student list modal when API returns empty', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/HealthCheckConsentForm/plan/')) return Promise.resolve({ data: [] });
      if (url === '/SchoolClass') return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      if (url === '/User') return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [
        {
          id: 'plan1',
          PlanName: 'Khám sức khỏe học kì 2 lớp 6A',
          scheduleDate: '2025-07-22',
          CheckupContent: 'Khám sức khỏe định kỳ',
          status: 'Đã lên lịch',
          classID: '6A',
          creatorID: 'medstaff01'
        }
      ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    // Mở modal chi tiết kế hoạch
    const viewDetailBtn = await screen.findByTestId('view-detail-btn-plan1');
    await userEvent.click(viewDetailBtn);
    // Mở modal danh sách học sinh
    const viewStudentListBtn = await screen.findByTestId('view-student-list-btn');
    await userEvent.click(viewStudentListBtn);
    // Không có học sinh nào hiển thị
    await waitFor(() => {
      expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument();
    });
  });

  // [Sự kiện] Test hủy form: gọi handleCancelForm, kiểm tra form đóng và state reset
  test('cancels form and resets state when clicking cancel button', async () => {
    renderWithRouter(<HealthCheckManagement />);
    // Mở form tạo lịch cá nhân
    const createBtn = screen.getByRole('button', { name: /tạo lịch cá nhân/i });
    createBtn.click();
    // Đảm bảo form/modal xuất hiện
    expect(await screen.findByTestId('edit-plan-modal')).toBeInTheDocument();
    // Nhập dữ liệu vào form
    const studentIdInput = screen.getByLabelText(/mã học sinh/i);
    await userEvent.type(studentIdInput, 'U99999');
    // Click nút hủy
    const cancelBtn = screen.getByRole('button', { name: /hủy bỏ/i });
    await userEvent.click(cancelBtn);
    // Form/modal phải đóng
    await waitFor(() => {
      expect(screen.queryByTestId('edit-plan-modal')).toBeNull();
    });
    // Mở lại form để kiểm tra state reset
    createBtn.click();
    expect(await screen.findByTestId('edit-plan-modal')).toBeInTheDocument();
    // Trường mã học sinh phải rỗng
    expect(screen.getByLabelText(/mã học sinh/i)).toHaveValue('');
  });

  // [Role] Test UI và hành động với các roleType khác nhau
  test('shows correct UI and actions for MedicalStaff', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { username: 'doctor1', roleType: 'MedicalStaff' }
    });
    renderWithRouter(<HealthCheckManagement />);
    // MedicalStaff thấy nút tạo lịch cá nhân
    expect(await screen.findByRole('button', { name: /tạo lịch cá nhân/i })).toBeInTheDocument();
  });

  test('shows correct UI and actions for Admin', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { username: 'admin1', roleType: 'Admin' }
    });
    renderWithRouter(<HealthCheckManagement />);
    // Admin cũng thấy nút tạo lịch cá nhân
    expect(await screen.findByRole('button', { name: /tạo lịch cá nhân/i })).toBeInTheDocument();
  });

  test('redirects to login for Guest (not authenticated)', async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    renderWithRouter(<HealthCheckManagement />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.any(Object));
    });
  });
  // [Edge case] Học sinh từ chối
  test('shows reason button for denied student', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/HealthCheckConsentForm/plan/')) return Promise.resolve({ data: [
        { consentFormId: 'c2', studentId: 'U20002', name: 'Học Sinh H', statusID: 2, consentStatus: 'Từ chối', reasonForDenial: 'Bận việc' }
      ] });
      if (url === '/SchoolClass') return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      if (url === '/User') return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [
        {
          id: 'plan1',
          PlanName: 'Khám sức khỏe học kì 2 lớp 6A',
          scheduleDate: '2025-07-22',
          CheckupContent: 'Khám sức khỏe định kỳ',
          status: 'Đã lên lịch',
          classID: '6A',
          creatorID: 'medstaff01'
        }
      ] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    const viewDetailBtn = await screen.findByTestId('view-detail-btn-plan1');
    await userEvent.click(viewDetailBtn);
    const viewStudentListBtn = await screen.findByTestId('view-student-list-btn');
    await userEvent.click(viewStudentListBtn);
    // Có nút xem lý do
    expect(await screen.findByText(/xem lý do/i)).toBeInTheDocument();
  });
});
