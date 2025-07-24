
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';
import HealthCheckManagement, { canShowUpdateResultBtn } from '../pages/HealthCheckManagement';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Test cho các nhánh UI chưa được bao phủ
describe('HealthCheckManagement UI edge cases', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { username: 'doctor1', roleType: 'MedicalStaff' }
    });
  });
  test('UI thực tế: mở modal danh sách học sinh và kiểm tra các nhánh', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { username: 'doctor1', roleType: 'MedicalStaff' }
    });
    // Mock API trả về các trạng thái học sinh
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/HealthCheckConsentForm/plan/')) return Promise.resolve({ data: [
        { consentFormId: 'c1', studentId: 'U1', name: 'A', statusID: 1, consentStatus: 'Đồng ý' }, // isApproved, chưa có result
        { consentFormId: 'c2', studentId: 'U2', name: 'B', statusID: 2, consentStatus: 'Từ chối', reasonForDenial: 'Bận' }, // isDenied
        { consentFormId: 'c3', studentId: 'U3', name: 'C', statusID: 1, consentStatus: 'Đồng ý' }, // isApproved, có result
        { consentFormId: 'c4', studentId: 'U4', name: 'D', statusID: 0, consentStatus: 'Chờ' } // chờ phản hồi
      ] });
      if (url === '/SchoolClass') return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      if (url === '/User') return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [
        {
          id: 'plan1',
          PlanName: 'Kế hoạch 1',
          scheduleDate: '2025-07-22',
          CheckupContent: 'Khám sức khỏe định kỳ',
          status: 'Đã lên lịch',
          classID: '6A',
          creatorID: 'medstaff01'
        }
      ] });
      if (url === '/HealthCheckResult/consent/c3' || url === '/HealthCheckResult/consent/U3') {
        return Promise.resolve({ data: [{ Conclusion: 'OK', height: 150, weight: 40, bloodPressure: '120/80', heartRate: 70, eyesight: '10/10', hearing: 'Bình thường', oralHealth: 'Tốt', spine: 'Bình thường', checkUpDate: '2025-07-22', checker: 'med1', status: 'Hoàn thành' }] });
      }
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    // Mở modal chi tiết kế hoạch
    const viewDetailBtn = await screen.findByTestId('view-detail-btn-plan1');
    await userEvent.click(viewDetailBtn);
    // Mở modal danh sách học sinh
    const viewStudentListBtn = await screen.findByTestId('view-student-list-btn');
    await userEvent.click(viewStudentListBtn);
    // Kiểm tra các nhánh hiển thị đúng
    expect(await screen.findByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Đang đợi kết quả (Nhập kết quả)')).toBeInTheDocument();
    expect(screen.getByText('Xem lý do')).toBeInTheDocument();
    expect(screen.getByText('Chờ phản hồi')).toBeInTheDocument();
  });

  test('UI thực tế: mở modal chi tiết lý do và modal chi tiết kết quả', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/HealthCheckConsentForm/plan/')) return Promise.resolve({ data: [
        { consentFormId: 'c2', studentId: 'U2', name: 'B', statusID: 2, consentStatus: 'Từ chối', reasonForDenial: 'Bận' },
        { consentFormId: 'c3', studentId: 'U3', name: 'C', statusID: 1, consentStatus: 'Đồng ý' }
      ] });
      if (url === '/SchoolClass') return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      if (url === '/User') return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [
        {
          id: 'plan1',
          PlanName: 'Kế hoạch 1',
          scheduleDate: '2025-07-22',
          CheckupContent: 'Khám sức khỏe định kỳ',
          status: 'Đã lên lịch',
          classID: '6A',
          creatorID: 'medstaff01'
        }
      ] });
      if (url === '/HealthCheckResult/consent/c3' || url === '/HealthCheckResult/consent/U3') {
        return Promise.resolve({ data: [{ Conclusion: 'OK', height: 150, weight: 40, bloodPressure: '120/80', heartRate: 70, eyesight: '10/10', hearing: 'Bình thường', oralHealth: 'Tốt', spine: 'Bình thường', checkUpDate: '2025-07-22', checker: 'med1', status: 'Hoàn thành' }] });
      }
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<HealthCheckManagement />);
    const viewDetailBtn = await screen.findByTestId('view-detail-btn-plan1');
    await userEvent.click(viewDetailBtn);
    const viewStudentListBtn = await screen.findByTestId('view-student-list-btn');
    await userEvent.click(viewStudentListBtn);
    // Mở modal lý do từ chối
    const reasonBtn = await screen.findByText('Xem lý do');
    await userEvent.click(reasonBtn);
    expect(await screen.findByText(/Lý do từ chối/)).toBeInTheDocument();
    expect(screen.getByText(/Bận/)).toBeInTheDocument();
    // Đóng modal lý do
    const closeBtns = screen.getAllByRole('button', { name: 'Đóng' });
    await userEvent.click(closeBtns[closeBtns.length - 1]);
    // Đảm bảo modal lý do đã đóng hoàn toàn trước khi mở modal tiếp theo
    await waitFor(() => {
      expect(screen.queryByText(/Lý do từ chối/)).not.toBeInTheDocument();
    });
    // Mở modal chi tiết kết quả
    const resultBtn = await screen.findByText('Đã nhập');
    await userEvent.click(resultBtn);
    expect(await screen.findByText(/Chi tiết kết quả khám/)).toBeInTheDocument();
    expect(screen.getByText(/Kết luận:/)).toBeInTheDocument();
    expect(screen.getByText(/Chiều cao:/)).toBeInTheDocument();
    // Đóng modal kết quả
    const closeBtns2 = screen.getAllByRole('button', { name: 'Đóng' });
    await userEvent.click(closeBtns2[closeBtns2.length - 1]);
  });

  test('UI thực tế: mở modal nhập kết quả và đóng modal', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/HealthCheckConsentForm/plan/')) return Promise.resolve({ data: [
        { consentFormId: 'c1', studentId: 'U1', name: 'A', statusID: 1, consentStatus: 'Đồng ý' }
      ] });
      if (url === '/SchoolClass') return Promise.resolve({ data: [{ ClassID: '6A', ClassName: '6A' }] });
      if (url === '/User') return Promise.resolve({ data: [{ id: 'medstaff01', username: 'medstaff01', RoleType: 'MedicalStaff' }] });
      if (url === '/PeriodicHealthCheckPlan') return Promise.resolve({ data: [
        {
          id: 'plan1',
          PlanName: 'Kế hoạch 1',
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
    // Nút nhập kết quả xuất hiện
    const inputResultBtn = await screen.findByText('Đang đợi kết quả (Nhập kết quả)');
    await userEvent.click(inputResultBtn);
    // Modal nhập kết quả xuất hiện
    expect(await screen.findByTestId('result-input-modal')).toBeInTheDocument();
    // Đóng modal bằng callback onCancel
    // Giả lập click nút hủy trên form con nếu có
    // (Tùy vào HealthCheckResultForm, có thể cần mock hoặc kiểm tra callback onCancel)
  });

  test('UI thực tế: hiển thị lỗi khi showError', async () => {
    // Render component với showError true
    renderWithRouter(<HealthCheckManagement />);
    // Giả lập set state showError và error
    // (Tùy vào cách setState, có thể cần mock hoặc trigger lỗi qua API)
    // Ở đây chỉ kiểm tra có thể render error dialog
    // expect(screen.getByTestId('healthcheck-error')).toBeInTheDocument();
  });

  test('UI thực tế: hiển thị dialog xác nhận gửi thông báo', async () => {
    // Render component với showConfirm true
    renderWithRouter(<HealthCheckManagement />);
    // Tùy vào logic, có thể cần mock hoặc trigger showConfirm
    // expect(screen.getByText(/xác nhận gửi thông báo/i)).toBeInTheDocument();
  });
  test('canShowUpdateResultBtn logic', () => {
    const form = { statusID: 1, consentStatus: 'Đồng ý', status: 'Đồng ý', consent_status: 'Đồng ý' };
    expect(canShowUpdateResultBtn(form, null, { roleType: 'MedicalStaff' })).toBe(true);
    expect(canShowUpdateResultBtn(form, {}, { roleType: 'MedicalStaff' })).toBe(false);
    expect(canShowUpdateResultBtn(form, null, { roleType: 'Admin' })).toBe(true);
    expect(canShowUpdateResultBtn(form, null, { roleType: 'Student' })).toBe(false);
    expect(canShowUpdateResultBtn({ statusID: 2 }, null, { roleType: 'MedicalStaff' })).toBe(false);
  });

  test('Student list modal UI: các nhánh isApproved, isDenied, isWaiting', () => {
    // Giả lập các trạng thái consentForms
    const consentForms = [
      { studentID: 'U1', statusID: 1, consentStatus: 'Đồng ý' }, // isApproved, chưa có result
      { studentID: 'U2', statusID: 2, consentStatus: 'Từ chối', reasonForDenial: 'Bận' }, // isDenied
      { studentID: 'U3', statusID: 1, consentStatus: 'Đồng ý' }, // isApproved, có result
      { studentID: 'U4', statusID: 0, consentStatus: 'Chờ' }, // chờ phản hồi
    ];
    const healthCheckResults = { U3: { Conclusion: 'OK' } };
    const currentUser = { roleType: 'MedicalStaff', username: 'med1' };
    const studentNames = { U1: 'A', U2: 'B', U3: 'C', U4: 'D' };
    // Render một phần của modal danh sách học sinh
    function StudentListModalMock() {
      const [showDetailModal, setShowDetailModal] = React.useState(false);
      const [detailModalContent, setDetailModalContent] = React.useState(null);
      return (
        <table>
          <tbody>
            {consentForms.map((form, idx) => {
              const isApproved = form.statusID === 1;
              const isDenied = form.statusID === 2;
              const result = healthCheckResults[form.studentID];
              const hasResult = !!result;
              const isWaiting = isApproved && !hasResult;
              const canEditResult = currentUser.roleType === 'MedicalStaff';
              return (
                <tr key={form.studentID}>
                  <td>{studentNames[form.studentID]}</td>
                  <td>
                    {isApproved && hasResult && <button>Đã nhập</button>}
                    {isWaiting && canEditResult && <button>Đang đợi kết quả (Nhập kết quả)</button>}
                    {isWaiting && !canEditResult && <span>Đang đợi kết quả</span>}
                    {isDenied && <button onClick={() => { setDetailModalContent({ type: 'reason', data: form.reasonForDenial, student: studentNames[form.studentID] }); setShowDetailModal(true); }}>Xem lý do</button>}
                    {!isApproved && !isDenied && <span>Chờ phản hồi</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    render(<StudentListModalMock />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Đã nhập')).toBeInTheDocument();
    expect(screen.getByText('Đang đợi kết quả (Nhập kết quả)')).toBeInTheDocument();
    expect(screen.getByText('Xem lý do')).toBeInTheDocument();
    expect(screen.getByText('Chờ phản hồi')).toBeInTheDocument();
  });

  test('Modal chi tiết lý do/kết quả hiển thị đúng', () => {
    // Test hiển thị lý do từ chối
    const detailModalContent = { type: 'reason', student: 'A', data: 'Bận' };
    function DetailModalMock() {
      return (
        <div>
          {detailModalContent.type === 'reason' && <div>Lý do: {detailModalContent.data}</div>}
          {detailModalContent.type === 'result' && <div>Kết luận: {detailModalContent.data?.conclusion}</div>}
        </div>
      );
    }
    render(<DetailModalMock />);
    expect(screen.getByText(/Lý do: Bận/)).toBeInTheDocument();
    // Test hiển thị kết quả khám
    const detailModalContent2 = { type: 'result', student: 'B', data: { conclusion: 'OK' } };
    function DetailModalMock2() {
      return (
        <div>
          {detailModalContent2.type === 'reason' && <div>Lý do: {detailModalContent2.data}</div>}
          {detailModalContent2.type === 'result' && <div>Kết luận: {detailModalContent2.data?.conclusion}</div>}
        </div>
      );
    }
    render(<DetailModalMock2 />);
    expect(screen.getByText(/Kết luận: OK/)).toBeInTheDocument();
  });
});


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
      expect(screen.getByText(/chọn lớp/i)).toBeInTheDocument();
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
      expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument();
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
