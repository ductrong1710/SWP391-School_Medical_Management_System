import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HealthCheckManagement.css';
import apiClient from '../services/apiClient';
import { getApprovedStudents, getResultByConsent } from '../services/healthCheckService';
import HealthCheckResultForm from '../components/HealthCheckResultForm';
import ErrorDialog from '../components/ErrorDialog';

const HealthCheckManagement = () => {
  const { isAuthenticated, loading: authLoading, user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHealthCheck, setSelectedHealthCheck] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingHealthCheckId, setEditingHealthCheckId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    checkupDate: new Date().toISOString().split('T')[0],
    checkupType: '',
    doctorName: '',
    healthFacility: 'Phòng Y tế Trường',
    notes: '',
    status: 'Đã lên lịch',
    NeedToContactParent: false,
    followUpDate: '',
    creatorID: ''
  });
  
  // Thêm state cho các bộ lọc
  const [filters, setFilters] = useState({
    scheduleDate: '',
    creatorId: '',
    className: ''
  });
    // State cho danh sách lớp đã chọn để đặt lịch hàng loạt
  const defaultBatchFormData = {
    PlanName: '', // Tên kế hoạch
    ClassID: '', // Mã lớp
    CheckupDate: new Date().toISOString().split('T')[0], // Ngày khám
    CheckupContent: 'Khám sức khỏe định kỳ', // Nội dung khám mặc định
    Status: 'Đã lên lịch', // Trạng thái
    Notes: '' // Ghi chú
  };
  const [batchFormData, setBatchFormData] = useState(defaultBatchFormData);
  
  // Thêm state cho học sinh trong lớp (sử dụng cho đặt lịch hàng loạt)
  const [classStudents, setClassStudents] = useState([]);
  
  // State để theo dõi các học sinh được chọn trong lịch hàng loạt
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Thêm state cho planId thực tế
  const [planId, setPlanId] = useState('');
  
  // Thêm state cho danh sách lớp có thể chọn
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableCreators, setAvailableCreators] = useState([]);
  
  // Thêm state cho danh sách consent form của kế hoạch đang xem
  const [consentForms, setConsentForms] = useState([]);
  const [showReason, setShowReason] = useState({}); // {studentId: true/false}
  const [studentNames, setStudentNames] = useState({});
  
  // 1. Thêm biến kiểm tra trạng thái
  const statusOptions = [
    'Đã lên lịch',
    'Đang thực hiện',
    'Đã hoàn thành',
    'Bị hủy',
    'Dời lịch'
  ];
  const isEdit = !!editingHealthCheckId;
  const isStatusLocked = ['Đang thực hiện', 'Đã hoàn thành', 'Dời lịch', 'Bị hủy'].includes(formData.status);
  const isDateLocked = ['Đang thực hiện', 'Đã hoàn thành', 'Bị hủy'].includes(formData.status);
  const isReschedule = formData.status === 'Dời lịch';
  
  // State lưu kết quả khám theo consentID
  const [healthCheckResults, setHealthCheckResults] = useState({});
  // State cho modal nhập kết quả
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultForm, setResultForm] = useState({
    consentId: '',
    Height: '',
    Weight: '',
    BloodPressure: '',
    HeartRate: '',
    Eyesight: '',
    Hearing: '',
    OralHealth: '',
    Spine: '',
    Conclusion: '',
    CheckUpDate: new Date().toISOString().split('T')[0],
    Checker: currentUser?.username || '',
    NeedToContactParent: false,
    FollowUpDate: '',
    Status: 'Hoàn thành',
    HealthFacility: 'Phòng Y tế Trường',
    CheckupType: ''
  });
  
  // State cho modal danh sách học sinh full màn hình
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  
  // State cho modal chi tiết lý do hoặc kết quả khám
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalContent, setDetailModalContent] = useState(null);
  
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState('error');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  
  useEffect(() => {
    // Kiểm tra xác thực
    if (!authLoading && !isAuthenticated) {
      console.log("HealthCheckManagement: Not authenticated, redirecting to login");
      navigate('/login', { 
        state: { 
          from: { pathname: '/health-check-management' },
          manualLogin: true 
        } 
      });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  useEffect(() => {
    apiClient.get('/SchoolClass')
      .then(res => {
        const classes = res.data.map(cls => ({
          ClassID: cls.ClassID || cls.classID || cls.id,
          ClassName: cls.ClassName || cls.className || cls.name
        }));
        console.log('Danh sách lớp chuẩn hóa:', classes);
        setAvailableClasses(classes);
      })
      .catch(() => setAvailableClasses([]));
  }, []);

  useEffect(() => {
    apiClient.get('/User').then(res => setAvailableCreators(res.data)).catch(() => setAvailableCreators([]));
  }, []);

  const handleViewDetails = async (healthCheck) => {
    setSelectedHealthCheck(healthCheck);
    try {
      const res = await apiClient.get(`/HealthCheckConsentForm/plan/${healthCheck.id}`);
      setConsentForms(res.data || []);
    } catch {
      setConsentForms([]);
    }
  };

  const handleCloseDetails = () => {
    setSelectedHealthCheck(null);
  };
  
  const handleNewHealthCheck = () => {
    setEditingHealthCheckId(null);
    setFormData({
      studentId: '',
      checkupDate: new Date().toISOString().split('T')[0],
      checkupType: '',
      doctorName: '',
      healthFacility: 'Phòng Y tế Trường',
      notes: '',
      status: 'Đã lên lịch',
      NeedToContactParent: false,
      followUpDate: '',
      creatorID: currentUser?.userID || currentUser?.UserID || ""
    });
    setShowForm(true);
  };

  const handleEditHealthCheck = (healthCheck) => {
    setEditingHealthCheckId(healthCheck.id);
    setFormData({
      studentId: healthCheck.studentId,
      checkupDate: healthCheck.scheduleDate ? healthCheck.scheduleDate.split('T')[0] : '',
      checkupType: healthCheck.checkupType,
      doctorName: healthCheck.doctorName,
      healthFacility: healthCheck.healthFacility,
      notes: healthCheck.results,
      status: healthCheck.status,
      NeedToContactParent: healthCheck.NeedToContactParent || false,
      followUpDate: healthCheck.followUpDate || '',
      creatorID: currentUser?.userID || currentUser?.UserID || ""
    });
    setShowForm(true);
  };

  const handleUpdateResult = (healthCheck) => {
    handleCloseDetails();
    handleEditHealthCheck(healthCheck);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingHealthCheckId(null);
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [id]: type === 'checkbox' ? checked : value };
      
      if (id === 'status') {
        if (value === 'Đã hủy') {
          newState.checkupDate = '';
        }
        if (value !== 'Đang theo dõi') {
          newState.followUpDate = '';
        }
      }
      
      return newState;
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    // Kiểm tra các trường bắt buộc
    if (!formData.studentId || !formData.checkupType || !formData.creatorID) {
      setError('Vui lòng điền đầy đủ thông tin: Mã học sinh, Loại khám, và Người tạo!');
      setShowError(true);
      return;
    }
    // 1. Lấy ClassID từ Profile (chuẩn hóa giống tạo lịch theo lớp)
    let classId = '';
    let studentProfile = null;
    try {
      const profileRes = await apiClient.get(`/Profile/user/${formData.studentId}`);
      studentProfile = profileRes.data;
      // Ưu tiên lấy đúng trường ClassID, không lấy tên lớp
      classId = studentProfile?.ClassID || studentProfile?.classID || '';
    } catch (err) {
      console.warn('Không lấy được ClassID từ Profile:', err);
      // Nếu không lấy được profile, báo lỗi và return
      setError('Mã học sinh không tồn tại trong hệ thống!');
      setErrorType('error');
      setShowError(true);
      return;
    }
    
    // 2. Tạo dữ liệu cho kế hoạch khám sức khỏe định kỳ
    let checkupDateToUse = formData.checkupDate;
    if (formData.status === 'Dời lịch' && formData.newCheckupDate) {
      checkupDateToUse = formData.newCheckupDate;
    }
    const planData = {
      planName: `Khám ${formData.checkupType} - ${formData.studentId}`,
      scheduleDate: checkupDateToUse ? new Date(checkupDateToUse).toISOString() : null,
      checkupContent: 'Khám sức khỏe định kỳ',
      status: "Đã lên lịch",
      classID: classId,
      createdDate: new Date().toISOString(),
      creatorID: formData.creatorID,
      notes: formData.notes || ''
    };
    
    try {
      // Tạo kế hoạch khám sức khỏe định kỳ
      const planResponse = await apiClient.post('/PeriodicHealthCheckPlan', planData);
      console.log('Plan created:', planResponse.data);
      // Hiển thị thông báo thành công
      setError('Tạo lịch khám sức khỏe thất bại!');
      setErrorType('success');
      setShowError(true);
      // Reset form và đóng modal
      setShowForm(false);
      setEditingHealthCheckId(null);
      // Refresh danh sách kế hoạch
      const plansRes = await apiClient.get('/PeriodicHealthCheckPlan');
      setPlans(plansRes.data);
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      setErrorType('error');
      setShowError(true);
    }
  };
  
  // Hàm xử lý lọc
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleApplyFilters = () => {
    // useEffect sẽ tự động cập nhật dựa trên state filters,
    // nhưng ta có thể gọi fetchData() ở đây nếu muốn có nút "Lọc" rõ ràng
    // Tuy nhiên, với cấu trúc hiện tại, việc thay đổi filter đã tự động fetch lại
    console.log("Applied filters:", filters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      scheduleDate: '',
      creatorId: '',
      className: ''
    });
    setBatchFormData({
      ...defaultBatchFormData,
      CheckupDate: new Date().toISOString().split('T')[0], // Luôn lấy ngày hiện tại
    });
    
    setSelectedStudents([]);
    setClassStudents([]); // Reset danh sách học sinh
    
    // Delay một chút để đảm bảo modal được hiển thị sau khi state được cập nhật
    setTimeout(() => {
      setShowBatchForm(true);
      console.log("Batch form should be visible now");
      
      // Focus vào dropdown lớp học khi form được hiển thị
      setTimeout(() => {
        const classNameSelect = document.getElementById('ClassID');
        if (classNameSelect) {
          classNameSelect.focus();
        }
      }, 100);
    }, 0);
  };
  
  // Xử lý tạo lịch khám hàng loạt
  const handleBatchSchedule = () => {
    console.log("Opening batch schedule form");
    
    // Đảm bảo reset form với giá trị mặc định
    setBatchFormData({
      ...defaultBatchFormData,
      CheckupDate: new Date().toISOString().split('T')[0], // Luôn lấy ngày hiện tại
    });
    
    setSelectedStudents([]);
    setClassStudents([]); // Reset danh sách học sinh
    
    // Delay một chút để đảm bảo modal được hiển thị sau khi state được cập nhật
    setTimeout(() => {
      setShowBatchForm(true);
      console.log("Batch form should be visible now");
      
      // Focus vào dropdown lớp học khi form được hiển thị
      setTimeout(() => {
        const classNameSelect = document.getElementById('ClassID');
        if (classNameSelect) {
          classNameSelect.focus();
        }
      }, 100);
    }, 0);
  };
  
  const handleCancelBatchForm = () => {
    setShowBatchForm(false);
  };
    const handleBatchInputChange = async (e) => {
    const { id, value } = e.target;
    console.log(`Batch input changed: ${id} = ${value}`);
    
    setBatchFormData(prev => {
      const newData = {
        ...prev,
        [id]: value
      };
      console.log("Updated batch form data:", newData);
      return newData;
    });
    
    if (id === 'ClassID' && value) {
      try {
        console.log(`Loading students for class ${value}`);
        const response = await apiClient.get(`/SchoolClass/${value}/students`);
        let students = response.data;
        // Đảm bảo mỗi học sinh đều có trường UserID đúng (UserID là trường backend trả về)
        students = students.map(s => ({
          ...s,
          UserID: s.UserID || s.userID || s.id || s.userid || ''
        }));
        // Nếu có học sinh nào không có UserID, log cảnh báo
        const missingId = students.filter(s => !s.UserID);
        if (missingId.length > 0) {
          console.warn('Một số học sinh không có UserID:', missingId);
        }
        console.log(`Found ${students.length} students for class ${value}:`, students);
        setClassStudents(students);
        setSelectedStudents([]);
      } catch (error) {
        console.error(`Lỗi khi tải danh sách học sinh cho lớp ${value}:`, error);
        setClassStudents([]);
        setSelectedStudents([]);
      }
    }
  };
  
  const handleStudentSelection = (studentId) => {
    if (!studentId) return; // Bỏ qua nếu ID không hợp lệ
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  const handleSelectAllStudents = () => {
    // Chỉ chọn các UserID hợp lệ, không rỗng
    const validIds = classStudents.map(student => student.UserID).filter(id => !!id);
    if (selectedStudents.length === validIds.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(validIds);
    }
  };
  
  const handleSubmitBatchForm = async (e) => {
    e.preventDefault();
    // Lọc bỏ các studentId bị undefined/null/rỗng
    const validStudentIds = selectedStudents.filter(id => !!id);
    console.log("Batch form submitted with data:", batchFormData, "Selected students:", validStudentIds);
    if (validStudentIds.length === 0) {
      alert('Vui lòng chọn ít nhất một học sinh!');
      return;
    }
    
    // Kiểm tra các trường bắt buộc
    if (!batchFormData.PlanName || !batchFormData.ClassID) {
      alert('Vui lòng điền đầy đủ thông tin: Tên kế hoạch, Lớp!');
      return;
    }
    
    // Kiểm tra xem có User đang đăng nhập không
    if (!currentUser || !currentUser.userID) {
      alert('Không tìm thấy thông tin người dùng đang đăng nhập!');
      return;
    }
    
    console.log('Current user:', currentUser); // Thêm log để debug
    console.log('Current user ID:', currentUser.userID); // Thêm log để debug
    
    const studentsWithParent = await Promise.all(validStudentIds.map(async (studentId) => {
      try {
        const res = await apiClient.get(`/HealthRecord/student/${studentId}`);
        if (res.data && res.data.parentID) {
          return { studentId, parentId: res.data.parentID };
        }
      } catch (err) {
        console.warn(`Không tìm thấy ParentID cho học sinh ${studentId}`);
      }
      return null;
    }));
    // Lọc ra các học sinh có ParentID hợp lệ
    const validStudents = studentsWithParent.filter(s => s && s.parentId);
    if (validStudents.length === 0) {
      alert('Không tìm thấy ParentID hợp lệ cho bất kỳ học sinh nào!');
      return;
    }
    // Gửi batch với danh sách học sinh và ParentID hợp lệ
    const batchData = {
      PlanName: batchFormData.PlanName,
      ClassID: batchFormData.ClassID,
      CheckupDate: batchFormData.CheckupDate,
      CheckupContent: 'Khám sức khỏe định kỳ',
      Status: batchFormData.Status,
      CreatorID: currentUser.userID, // Thêm lại CreatorID từ User đang đăng nhập
      Notes: batchFormData.Notes,
      StudentIds: validStudents.map(s => s.studentId)
    };
    
    console.log('=== BATCH DATA DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Current user ID:', currentUser.userID);
    console.log('Batch form data:', batchFormData);
    console.log('Valid students:', validStudents);
    console.log('Sending batch data:', batchData);
    console.log('CreatorID being sent:', currentUser.userID);
    console.log('StudentIds being sent:', batchData.StudentIds);
    console.log('=== END BATCH DATA DEBUG ===');
    
    // Test endpoint first - use existing endpoint
    try {
      console.log('Testing with existing endpoint...');
      const testResponse = await apiClient.get('/HealthCheckResult');
      console.log('Test endpoint response:', testResponse.data);
    } catch (testError) {
      console.error('Test endpoint failed:', testError.response?.data);
    }
    
    // Test simple endpoint
    try {
      console.log('Testing simple endpoint...');
      const simpleResponse = await apiClient.post('/HealthCheckResult/batch-simple', batchData);
      console.log('Simple endpoint response:', simpleResponse.data);
    } catch (simpleError) {
      console.error('Simple endpoint failed:', simpleError.response?.data);
    }
    
    try {
      const response = await apiClient.post('/HealthCheckResult/batch', batchData);
      console.log('Batch response:', response.data);
      
      // Refresh danh sách kế hoạch
      const plansRes = await apiClient.get('/PeriodicHealthCheckPlan');
      setPlans(plansRes.data);
      
      setShowBatchForm(false);
      alert(`Đã tạo kế hoạch khám sức khỏe cho ${validStudents.length} học sinh!`);
    } catch (error) {
      console.error("=== BATCH ERROR DEBUG ===");
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error message:", error.message);
      console.error("=== END BATCH ERROR DEBUG ===");
      
      // Hiển thị thông báo lỗi cụ thể từ backend
      let errorMessage = 'Đã xảy ra lỗi khi tạo lịch khám hàng loạt. Vui lòng thử lại.';
      
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      
      alert(errorMessage);
    }
  };
    // Hàm xử lý xuất file Excel
  const handleExportToExcel = () => {
    // Trong thực tế, bạn sẽ sử dụng thư viện như XLSX hoặc ExcelJS để xuất Excel
    console.log("Exporting health checks to Excel...");
    
    // Giả lập xuất Excel
    const today = new Date().toLocaleDateString('vi-VN');
    alert(`Đã xuất danh sách khám sức khỏe ${plans.length} học sinh thành công! (demo_export_${today}.xlsx)`);
  };
  
  // Hàm xử lý nhập danh sách từ file Excel
  const handleImportFromExcel = () => {
    // Trong thực tế, bạn sẽ mở file picker và xử lý file Excel
    console.log("Importing student list from Excel...");
    
    // Giả lập nhập Excel
    alert('Tính năng nhập danh sách từ Excel đang được phát triển!');
  };
  
  // Sử dụng useEffect để fix dropdown bằng Javascript trực tiếp khi modal hiển thị
  useEffect(() => {
    if (showBatchForm) {
      console.log('Attempting to fix form elements');
      // Sử dụng setTimeout để đảm bảo DOM đã được render
      setTimeout(() => {
        // Fix các dropdown
        const selects = document.querySelectorAll('.modal .form-select');
        selects.forEach(select => {
          select.style.backgroundColor = 'white';
          select.style.color = '#212529';
          select.style.cursor = 'pointer';
          select.style.pointerEvents = 'auto';
          select.style.opacity = '1';
          
          // Tạo event click trực tiếp
          select.onclick = function(e) {
            console.log('Select clicked:', e.target.id);
          }
        });
        
        // Fix các input
        const inputs = document.querySelectorAll('.modal input');
        inputs.forEach(input => {
          input.style.backgroundColor = 'white';
          input.style.color = '#212529';
          input.style.pointerEvents = 'auto';
          input.style.opacity = '1';
        });
        
        console.log('Form elements should be fixed now');
      }, 300);
    }
  }, [showBatchForm]);
  
  // Đảm bảo load danh sách lớp khi mở modal xem chi tiết
  useEffect(() => {
    if (selectedHealthCheck && availableClasses.length === 0) {
      apiClient.get('/SchoolClass')
        .then(res => {
          const classes = res.data.map(cls => ({
            ClassID: cls.ClassID || cls.classID || cls.id,
            ClassName: cls.ClassName || cls.className || cls.name
          }));
          console.log('Danh sách lớp chuẩn hóa:', classes);
          setAvailableClasses(classes);
        })
        .catch(() => setAvailableClasses([]));
    }
  }, [selectedHealthCheck, availableClasses.length]);
  
  console.log('classStudents:', classStudents);
  
  // Lọc danh sách kế hoạch theo filters
  const filteredPlans = plans.filter(plan => {
    const matchDate = !filters.scheduleDate || (plan.scheduleDate && plan.scheduleDate.startsWith(filters.scheduleDate));
    const matchCreator = !filters.creatorId || (plan.creatorID && plan.creatorID.toLowerCase().includes(filters.creatorId.toLowerCase()));
    const matchClass = !filters.className || (plan.classID && plan.classID.toLowerCase().includes(filters.className.toLowerCase()));
    return matchDate && matchCreator && matchClass;
  });
  
  // Thêm log trước khi render danh sách kế hoạch
  console.log('filteredPlans:', filteredPlans);
  filteredPlans.forEach((plan, idx) => {
    console.log(`Plan[${idx}]:`, plan);
  });
  
  // Lọc chỉ lấy user có RoleType là MedicalStaff hoặc Admin cho dropdown người tạo
  const filteredCreators = availableCreators.filter(user => {
    const role = user.RoleType || user.roleType || user.Role?.RoleType || user.role?.roleType;
    return role === 'MedicalStaff' || role === 'Admin';
  });
  
  // Thêm hàm này vào đầu component HealthCheckManagement
  const getClassName = (plan) => {
    if (plan.className) return plan.className;
    if (plan.ClassName) return plan.ClassName;
    const cls = availableClasses.find(c => String(c.ClassID) === String(plan.classID || plan.ClassID));
    return cls ? cls.ClassName : '---';
  };
  
  // Thêm hàm này vào đầu component HealthCheckManagement
  const getCreatorName = (creatorId) => {
    const user = availableCreators.find(u => u.userID === creatorId);
    return user ? user.username : creatorId;
  };
  
  // Thêm hàm gửi thông báo cho toàn bộ phụ huynh của kế hoạch
  const handleSendNotificationsForPlan = async (plan) => {
    setConfirmMessage('Bạn có chắc chắn muốn gửi thông báo xác nhận đến tất cả phụ huynh của kế hoạch này?');
    setShowConfirm(true);
    setOnConfirm(() => async () => {
      setShowConfirm(false);
      try {
        await apiClient.post(`/PeriodicHealthCheckPlan/${plan.id}/send-notifications`);
        setError('Đã gửi thông báo đến tất cả phụ huynh của lớp!');
        setErrorType('success');
        setShowError(true);
      } catch (error) {
        setError('Có lỗi khi gửi thông báo!');
        setErrorType('error');
        setShowError(true);
        console.error('Lỗi gửi thông báo:', error);
      }
    });
  };
  
  useEffect(() => {
    if (consentForms.length > 0) {
      const missingIds = consentForms
        .map(f => f.studentID)
        .filter(id => id && !studentNames[id]);
      if (missingIds.length > 0) {
        Promise.all(missingIds.map(id =>
          apiClient.get(`/Profile/user/${id}`).then(res => ({ id, name: res.data?.name || id })).catch(() => ({ id, name: id }))
        )).then(results => {
          const nameMap = {};
          results.forEach(({ id, name }) => { nameMap[id] = name; });
          setStudentNames(prev => ({ ...prev, ...nameMap }));
        });
      }
    }
  }, [consentForms]);
  
  // Fetch danh sách kế hoạch khám sức khỏe khi vào trang
  useEffect(() => {
    setLoading(true);
    apiClient.get('/PeriodicHealthCheckPlan')
      .then(res => {
        setPlans(res.data);
        setLoading(false);
      })
      .catch(err => {
        setPlans([]);
        setLoading(false);
        console.error('Lỗi khi tải danh sách kế hoạch:', err);
      });
  }, []);
  
  // Hàm mở modal nhập kết quả
  const handleOpenResultModal = async (form) => {
    let result = healthCheckResults[form.id] || healthCheckResults[form.consentId];
    if (typeof result === 'undefined') {
      await fetchResultForConsent(form.id || form.consentId);
      result = healthCheckResults[form.id || form.consentId];
    }
    const consentId = form.id || form.consentId;
    setResultForm({
      consentId: consentId,
      Height: '',
      Weight: '',
      BloodPressure: '',
      HeartRate: '',
      Eyesight: '',
      Hearing: '',
      OralHealth: '',
      Spine: '',
      Conclusion: '',
      CheckUpDate: new Date().toISOString().split('T')[0],
      Checker: currentUser?.username || '',
      NeedToContactParent: false,
      FollowUpDate: '',
      Status: 'Hoàn thành',
      HealthFacility: 'Phòng Y tế Trường',
      CheckupType: form.checkupType || form.CheckupType || ''
    });
    setShowResultModal(true);       // Mở modal nhập kết quả
    console.log('DEBUG resultForm:', {
      consentId: consentId,
      CheckupType: form.checkupType || form.CheckupType || '',
      form
    });
  };
  const handleCloseResultModal = () => setShowResultModal(false);
  const handleResultInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setResultForm(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };
  // Gửi kết quả khám
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    const data = {
      HealthCheckConsentID: resultForm.consentId,
      Height: resultForm.Height,
      Weight: resultForm.Weight,
      BloodPressure: resultForm.BloodPressure,
      HeartRate: resultForm.HeartRate,
      Eyesight: resultForm.Eyesight,
      Hearing: resultForm.Hearing,
      OralHealth: resultForm.OralHealth,
      Spine: resultForm.Spine,
      Conclusion: resultForm.Conclusion,
      CheckUpDate: resultForm.CheckUpDate,
      Checker: resultForm.Checker,
      NeedToContactParent: resultForm.NeedToContactParent,
      FollowUpDate: resultForm.FollowUpDate,
      Status: resultForm.Status,
      HealthFacility: resultForm.HealthFacility,
      CheckupType: resultForm.CheckupType
    };
    try {
      await apiClient.post('/HealthCheckResult', data);
      if (resultForm.Status === 'Cần theo dõi' && resultForm.NeedToContactParent) {
        // Gửi thông báo cho phụ huynh
        const consent = consentForms.find(f => f.id === resultForm.consentId);
        if (consent && consent.parentID) {
          await apiClient.post('/Notification', {
            userId: consent.parentID,
            title: 'Thông báo theo dõi sức khỏe học sinh',
            message: `Học sinh có mã ${consent.studentID} cần phụ huynh đến trường để trao đổi về kết quả khám sức khỏe.`
          });
        }
      }
      alert('Đã lưu kết quả khám!');
      setShowResultModal(false);
      fetchResultForConsent(resultForm.consentId);
    } catch (err) {
      alert('Lỗi khi lưu kết quả khám!');
    }
  };
  // Hàm fetch kết quả khám cho 1 consentID
  const fetchResultForConsent = async (consentId) => {
    try {
      const res = await apiClient.get(`/HealthCheckResult/consent/${consentId}`);
      setHealthCheckResults(prev => ({ ...prev, [consentId]: res.data }));
    } catch {
      setHealthCheckResults(prev => ({ ...prev, [consentId]: null }));
    }
  };
  // Khi mở chi tiết kế hoạch, fetch kết quả khám cho các consent đã đồng ý
  useEffect(() => {
    if (selectedHealthCheck && consentForms.length > 0) {
      const approved = consentForms.filter(f => f.consentStatus === 'Đồng ý');
      approved.forEach(f => fetchResultForConsent(f.id));
    }
    // eslint-disable-next-line
  }, [selectedHealthCheck, consentForms]);
  
  useEffect(() => {
    if (showStudentListModal && consentForms.length > 0) {
      const approved = consentForms.filter(f => f.consentStatus === 'Đồng ý');
      approved.forEach(f => {
        if (!healthCheckResults[f.id]) {
          fetchResultForConsent(f.id);
        }
      });
    }
    // eslint-disable-next-line
  }, [showStudentListModal, consentForms]);
  
  // Thêm log khi render danh sách kế hoạch
  console.log('DEBUG plans:', plans);
  console.log('DEBUG availableClasses:', availableClasses);
  console.log('DEBUG availableCreators:', availableCreators);

  // Thêm hàm mapping trạng thái đồng ý
  function getConsentStatusText(status, statusId) {
    if (statusId) {
      switch (statusId) {
        case 1:
          return 'Đồng ý';
        case 2:
          return 'Từ chối';
        case 3:
          return 'Chờ phản hồi';
        default:
          return 'Chưa phản hồi';
      }
    }
    
    if (!status) return 'Chờ phản hồi';
    if (status === 'Approved' || status === 'Đồng ý') return 'Đồng ý';
    if (status === 'Denied' || status === 'Từ chối') return 'Từ chối';
    if (status === 'Đang chờ ý kiến' || status === 'Pending') return 'Đang chờ ý kiến';
    return status;
  }

  return (
    <div className="health-check-management-container">
      <div className="container py-4">        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Khám sức khỏe định kỳ</h1>
          <div>
            <button className="btn btn-success me-2" onClick={handleBatchSchedule}>
              <i className="fas fa-users me-2"></i>Tạo lịch theo lớp
            </button>
            <button className="btn btn-primary" onClick={handleNewHealthCheck}>
              <i className="fas fa-plus-circle me-2"></i>Tạo lịch cá nhân
            </button>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Tổng số học sinh</h5>
                <p className="card-number">{plans.length}</p>
                <p className="card-text">Đã đăng ký khám</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đã khám</h5>
                <p className="card-number">{plans.filter(check => check.status === 'Hoàn thành').length}</p>
                <p className="card-text">Học sinh</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Chờ khám</h5>
                <p className="card-number">{plans.filter(check => check.status === 'Đã lên lịch').length}</p>
                <p className="card-text">Học sinh</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card health-stat-card">
              <div className="card-body">
                <h5 className="card-title">Đợt khám</h5>
                <p className="card-number">{plans.length.toString().padStart(2, '0')}</p>
                <p className="card-text">Học kỳ 2, 2024-2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Lọc danh sách kế hoạch</h5>
            <div className="row">
              <div className="col-md-4 mb-2">
                <input
                  type="date"
                  id="scheduleDate"
                  className="form-control"
                  value={filters.scheduleDate}
                  onChange={e => setFilters(prev => ({ ...prev, scheduleDate: e.target.value }))}
                  placeholder="Chọn ngày khám"
                />
              </div>
              <div className="col-md-4 mb-2">
                <select
                  id="creatorId"
                  className="form-select"
                  value={filters.creatorId}
                  onChange={e => setFilters(prev => ({ ...prev, creatorId: e.target.value }))}
                >
                  <option value="">Chọn người tạo</option>
                  {filteredCreators.map(user => (
                    <option key={user.UserID || user.userID} value={user.UserID || user.userID}>
                      {user.FullName || user.fullName || user.Username || user.username || user.UserID || user.userID}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 mb-2">
                <select
                  id="className"
                  className="form-select"
                  value={filters.className}
                  onChange={e => setFilters(prev => ({ ...prev, className: e.target.value }))}
                >
                  <option value="">Chọn lớp</option>
                  {availableClasses.map(cls => (
                    <option key={cls.ClassID || cls.classID} value={cls.ClassName || cls.className}>
                      {cls.ClassName || cls.className}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 mb-2 d-flex align-items-end">
                <button className="btn btn-primary me-2" onClick={handleApplyFilters}>Lọc</button>
                <button className="btn btn-secondary" onClick={handleResetFilters}>Đặt lại</button>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mb-3 btn-export-import">
          <button className="btn btn-outline-success me-2" onClick={handleExportToExcel}>
            <i className="fas fa-file-excel me-2"></i>Xuất Excel
          </button>
          <button className="btn btn-outline-primary" onClick={handleImportFromExcel}>
            <i className="fas fa-file-import me-2"></i>Nhập danh sách
          </button>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu khám sức khỏe...</p>
          </div>
        ) : (          <div className="plans-list">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => {
                const className = getClassName(plan);
                const creatorName = getCreatorName(plan.creatorID);
                console.log('DEBUG plan:', plan, 'className:', className, 'creatorName:', creatorName);
                return (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-header">
                      <div className="plan-title">
                        <h3>{plan.planName}</h3>
                        <span className="plan-date">
                          <i className="fas fa-calendar"></i>
                          {plan.scheduleDate ? new Date(plan.scheduleDate).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <div className="plan-meta">
                        <span className="plan-class"><b>Lớp:</b> {className}</span>
                        <span className="plan-creator"><b>Người tạo:</b> {creatorName}</span>
                      </div>
                    </div>
                    <div className="plan-content">
                      <div className="plan-description">
                        <b>Nội dung:</b> {'Khám sức khỏe định kỳ'}
                      </div>
                      <div className="plan-actions mt-2">
                        <button className="btn btn-info btn-sm me-2" onClick={() => handleViewDetails(plan)}>
                          <i className="fas fa-eye"></i> Xem
                        </button>
                        <button className="btn btn-secondary btn-sm me-2" onClick={() => handleEditHealthCheck(plan)}>
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        {plan.status === 'Đã lên lịch' && (
                          <button className="btn btn-warning btn-sm" onClick={() => handleSendNotificationsForPlan(plan)}>
                            <i className="fas fa-bell"></i> Gửi thông báo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results text-center my-5">
                <i className="fas fa-notes-medical fa-3x mb-3" style={{color:'#bdbdbd'}}></i>
                <p>Không tìm thấy kế hoạch khám sức khỏe nào</p>
              </div>
            )}
          </div>
        )}        {/* Chi tiết lịch khám sức khỏe */}
        {selectedHealthCheck && (
          <div className="modal show d-block" tabIndex="-1" onClick={handleCloseDetails}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h3>
                    <i className="fas fa-notes-medical"></i> Chi tiết kế hoạch khám sức khỏe
                  </h3>
                  <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
                </div>
                <div className="modal-body">
                  <div className="status-badge mb-2" style={{fontWeight:'bold'}}>
                    {selectedHealthCheck.status}
                  </div>
                  <div className="mb-3">
                    <h2>{selectedHealthCheck.planName}</h2>
                    <p className="scheduled-date">
                      <i className="far fa-calendar-alt"></i>
                      {selectedHealthCheck.scheduleDate ? new Date(selectedHealthCheck.scheduleDate).toLocaleDateString('vi-VN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      }) : ''}
                    </p>
                  </div>
                  <div className="detail-section mb-3">
                    <h4><i className="fas fa-info-circle"></i> Thông tin cơ bản</h4>
                    <div className="detail-grid">
                      <div className="detail-item"><label>Tên kế hoạch:</label> <span className="highlight-value">{selectedHealthCheck.planName}</span></div>
                      <div className="detail-item"><label>Người tạo:</label> <span>{getCreatorName(selectedHealthCheck.creatorID)}</span></div>
                      <div className="detail-item"><label>Ngày tạo:</label> <span>{selectedHealthCheck.createdDate ? new Date(selectedHealthCheck.createdDate).toLocaleDateString('vi-VN') : ''}</span></div>
                    </div>
                  </div>
                  <div className="detail-section mb-3">
                    <h4><i className="fas fa-align-left"></i> Nội dung</h4>
                    <div className="description-box">
                      <p>Khám sức khỏe định kỳ</p>
                    </div>
                  </div>
                  <div className="detail-section mb-3">
                    <h4><i className="fas fa-users"></i> Lớp</h4>
                    <div className="detail-grid">
                      <div className="detail-item"><span className="highlight-value">{getClassName(selectedHealthCheck)}</span></div>
                    </div>
                  </div>
                  <div className="detail-section mb-3">
                    <h4><i className="fas fa-chart-pie"></i> Thống kê đăng ký</h4>
                    <div className="stats-grid">
                      {/* Thống kê số học sinh đã đồng ý, chờ phản hồi, tổng số học sinh nếu có */}
                      {/* Có thể fetch thêm nếu cần */}
                      <div className="stat-item">
                        <span className="stat-label">Tổng số học sinh:</span>
                        <span className="stat-value">-</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Đã đồng ý:</span>
                        <span className="stat-value">-</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Chờ phản hồi:</span>
                        <span className="stat-value">-</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-section mb-3">
                    <h4><i className="fas fa-list"></i> Danh sách học sinh</h4>
                    <div className="mb-3 d-flex justify-content-end">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setShowStudentListModal(true)}>
                        <i className="fas fa-list"></i> Xem danh sách học sinh
                      </button>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Form tạo lịch khám sức khỏe mới */}        {showForm && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingHealthCheckId ? 'Cập nhật thông tin khám sức khỏe' : 'Tạo lịch khám sức khỏe học đường mới'}</h5>
                  <button type="button" className="btn-close" onClick={handleCancelForm}></button>
                </div>
                <div className="modal-body">
                  {/* Hiển thị thông tin người tạo */}
                  <div className="alert alert-info mb-3">
                    <i className="fas fa-user me-2"></i>
                    <strong>Người tạo:</strong> {currentUser?.fullName || currentUser?.FullName || currentUser?.username || currentUser?.Username || 'Không xác định'}
                  </div>
                  
                  <form onSubmit={handleSubmitForm} className="individual-form">
                    <div className="row">
                      {!isEdit && (
                        <div className="col-md-6 mb-3">
                          <label htmlFor="studentId" className="form-label">Mã học sinh</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="studentId" 
                            value={formData.studentId ?? ""}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      )}
                      <div className={isEdit ? "col-md-12 mb-3" : "col-md-6 mb-3"}>
                        <label htmlFor="checkupDate" className="form-label">
                          {isReschedule ? 'Ngày dự khám mới' : (['Đang thực hiện', 'Đã hoàn thành'].includes(formData.status) ? 'Ngày khám' : 'Ngày dự khám')}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="checkupDate"
                          value={formData.checkupDate ?? ""}
                          onChange={handleInputChange}
                          required
                          disabled={['Đang thực hiện', 'Đã hoàn thành', 'Bị hủy'].includes(formData.status)}
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      {!isEdit && (
                        <div className="col-md-6 mb-3">
                          <label htmlFor="checkupType" className="form-label">Loại khám</label>
                          <select 
                            className="form-select" 
                            id="checkupType" 
                            value={formData.checkupType ?? ""}
                            onChange={handleInputChange}
                            required
                          >
                            <option key="empty" value="">Chọn loại khám</option>
                            <option key="Khám sức khỏe định kỳ" value="Khám sức khỏe định kỳ">Khám sức khỏe định kỳ</option>
                            <option key="Khám mắt" value="Khám mắt">Khám mắt</option>
                            <option key="Khám răng" value="Khám răng">Khám răng</option>
                            <option key="Khám tai mũi họng" value="Khám tai mũi họng">Khám tai mũi họng</option>
                            <option key="Sàng lọc cong vẹo cột sống" value="Sàng lọc cong vẹo cột sống">Sàng lọc cong vẹo cột sống</option>
                            <option key="Đo chiều cao cân nặng" value="Đo chiều cao cân nặng">Đo chiều cao cân nặng</option>
                            <option key="Xét nghiệm máu" value="Xét nghiệm máu">Xét nghiệm máu</option>
                          </select>
                        </div>
                      )}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="notes" className="form-label">Ghi chú (không bắt buộc)</label>
                        <textarea 
                          className="form-control" 
                          id="notes" 
                          rows="2"
                          value={formData.notes ?? ""}
                          onChange={handleInputChange}
                          placeholder="Nhập ghi chú nếu cần"
                        ></textarea>
                      </div>
                    </div>
                    
                    {/* Dropdown trạng thái chỉ cho phép sửa khi edit */}
                    {isEdit && (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="status" className="form-label">Trạng thái</label>
                          <select
                            className="form-select"
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    {isReschedule && (
                      <div className="alert alert-warning mt-2">Bạn đang dời lịch, vui lòng chọn ngày khám mới.</div>
                    )}
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Vui lòng kiểm tra thông tin trước khi xác nhận lịch khám sức khỏe. Học sinh cần được thông báo về lịch khám trước ít nhất 3 ngày.
                    </div>
                    
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>Hủy bỏ</button>
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-calendar-check me-2"></i>{editingHealthCheckId ? 'Cập nhật' : 'Xác nhận lịch khám'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Form tạo lịch khám sức khỏe hàng loạt */}
        {showBatchForm && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo lịch khám sức khỏe theo lớp</h5>
                  <button type="button" className="btn-close" onClick={handleCancelBatchForm}></button>
                </div>
                <div className="modal-body">
                  {/* Hiển thị thông báo lỗi nếu không có học sinh */}
                  {classStudents.length === 0 && batchFormData.ClassID && (
                    <div className="alert alert-danger">
                      Không thể tải danh sách học sinh hoặc không có học sinh trong lớp này.
                    </div>
                  )}
                  
                  {/* Hiển thị thông tin người tạo */}
                  <div className="alert alert-info mb-3">
                    <i className="fas fa-user me-2"></i>
                    <strong>Người tạo:</strong> {currentUser?.fullName || currentUser?.FullName || currentUser?.username || currentUser?.Username || 'Không xác định'}
                  </div>
                  
                  <form onSubmit={handleSubmitBatchForm} className="batch-form">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="PlanName" className="form-label">Tên kế hoạch *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="PlanName" 
                          value={batchFormData.PlanName}
                          onChange={handleBatchInputChange}
                          placeholder="Nhập tên kế hoạch khám sức khỏe"
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="ClassID" className="form-label">Chọn lớp *</label>
                        <div className="custom-select-wrapper">
                          <select
                            className="form-select"
                            id="ClassID"
                            value={batchFormData.ClassID}
                            onChange={handleBatchInputChange}
                            required
                          >
                            <option key="empty" value="">Chọn lớp</option>
                            {availableClasses.map((cls, idx) => (
                              <option key={cls.ClassID || cls.classID || `class-option-${idx}`} value={cls.ClassID || cls.classID}>
                                {cls.ClassName || cls.className || `Lớp ${idx+1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="CheckupDate" className="form-label">Ngày khám</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="CheckupDate" 
                          value={batchFormData.CheckupDate}
                          onChange={handleBatchInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="CheckupContent" className="form-label">Nội dung khám</label>
                        <div className="custom-select-wrapper">
                          <select 
                            className="form-select" 
                            id="CheckupContent" 
                            value={batchFormData.CheckupContent}
                            onChange={handleBatchInputChange}
                            required
                          >
                            <option key="empty" value="">Chọn nội dung khám</option>
                            <option key="Khám sức khỏe định kỳ" value="Khám sức khỏe định kỳ">Khám sức khỏe định kỳ</option>
                            <option key="Khám mắt" value="Khám mắt">Khám mắt</option>
                            <option key="Khám răng" value="Khám răng">Khám răng</option>
                            <option key="Khám tai mũi họng" value="Khám tai mũi họng">Khám tai mũi họng</option>
                            <option key="Sàng lọc cong vẹo cột sống" value="Sàng lọc cong vẹo cột sống">Sàng lọc cong vẹo cột sống</option>
                            <option key="Đo chiều cao cân nặng" value="Đo chiều cao cân nặng">Đo chiều cao cân nặng</option>
                            <option key="Xét nghiệm máu" value="Xét nghiệm máu">Xét nghiệm máu</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="Notes" className="form-label">Ghi chú (không bắt buộc)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="Notes" 
                          value={batchFormData.Notes}
                          onChange={handleBatchInputChange}
                          placeholder="Nhập ghi chú nếu cần"
                        />
                      </div>
                    </div>
                      <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Danh sách học sinh</h5>
                        {classStudents.length > 0 && (
                          <button 
                            type="button" 
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleSelectAllStudents}
                          >
                            {selectedStudents.length === classStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                          </button>
                        )}
                      </div>
                      
                      {batchFormData.ClassID ? (
                        <div id="studentListContainer" className="student-list-container">
                          {classStudents.length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-sm table-hover">
                                <thead>
                                  <tr>
                                    <th style={{width: '50px'}}></th>
                                    <th>Mã học sinh</th>
                                    <th>Họ tên</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {classStudents.map((student, idx) => (
                                    <tr key={student.UserID || `student-row-${idx}`}>
                                      <td>
                                        <div className="form-check">
                                          <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id={`student-${student.UserID || idx}`}
                                            checked={!!student.UserID && selectedStudents.includes(student.UserID)}
                                            onChange={() => student.UserID && handleStudentSelection(student.UserID)}
                                            style={{cursor: student.UserID ? 'pointer' : 'not-allowed'}}
                                            disabled={!student.UserID}
                                          />
                                          <label 
                                            htmlFor={`student-${student.UserID || idx}`} 
                                            style={{display: 'none'}}
                                          ></label>
                                        </div>
                                      </td>
                                      <td>{student.UserID || <span style={{color: 'red'}}>Không có mã</span>}</td>
                                      <td>{student.Name || student.name}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="alert alert-info">
                              Không có học sinh nào trong lớp này.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-warning">
                          Vui lòng chọn lớp để xem danh sách học sinh.
                        </div>
                      )}
                    </div>
                    
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Đã chọn {selectedStudents.length} học sinh để đặt lịch khám. Vui lòng kiểm tra thông tin trước khi xác nhận.
                    </div><div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleCancelBatchForm} 
                      >
                        Hủy bỏ
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={selectedStudents.length === 0}
                      >
                        <i className="fas fa-calendar-check me-2"></i>Xác nhận lịch khám cho {selectedStudents.length} học sinh
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {plans.length === 0 && !loading && (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Không tìm thấy kết quả nào phù hợp với điều kiện lọc. Vui lòng thử lại với điều kiện khác hoặc 
            <button 
              className="btn btn-link p-0 mx-1 align-baseline" 
              style={{fontSize: 'inherit', verticalAlign: 'baseline'}}
              onClick={handleResetFilters}
            >
              xóa bộ lọc
            </button>.
          </div>
        )}
        {showStudentListModal && (
          <div className="modal show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.7)'}}>
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content">
                <div className="modal-header" style={{justifyContent: 'center'}}>
                  <h3 className="w-100 text-center"><i className="fas fa-users"></i> Danh sách học sinh</h3>
                  <button type="button" className="btn-close position-absolute end-0 me-3" onClick={() => setShowStudentListModal(false)}></button>
                </div>
                <div className="modal-body" style={{padding: '2rem'}}>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle" style={{minWidth: 700}}>
                      <thead className="table-light">
                        <tr>
                          <th style={{width: 60, textAlign: 'center'}}>STT</th>
                          <th style={{minWidth: 120}}>Mã học sinh</th>
                          <th style={{minWidth: 180}}>Tên học sinh</th>
                          <th style={{minWidth: 140}}>Trạng thái đồng ý</th>
                          <th style={{minWidth: 220}}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consentForms.length === 0 && (
                          <tr><td colSpan="5" className="text-center">Không có học sinh nào.</td></tr>
                        )}
                        {consentForms.map((form, idx) => {
                          // Sửa lại điều kiện isApproved để nhận giá trị từ StatusID hoặc các key khác
                          const isApproved = form.statusID === 1 || form.consentStatus === 'Đồng ý' || form.status === 'Đồng ý' || form.consent_status === 'Đồng ý';
                          const isDenied = form.statusID === 2 || form.consentStatus === 'Từ chối' || form.status === 'Từ chối' || form.consent_status === 'Từ chối';
                          const result = healthCheckResults[form.id];
                          const isWaiting = isApproved && !result;
                          const canEditResult = (currentUser?.roleType === 'MedicalStaff' || currentUser?.roleType === 'Admin');
                          console.log('form:', form, 'isApproved:', isApproved, 'result:', result, 'isWaiting:', isWaiting, 'canEditResult:', canEditResult);
                          return (
                            <tr key={form.studentID}>
                              <td style={{textAlign: 'center'}}>{idx + 1}</td>
                              <td>{form.studentID}</td>
                              <td>{studentNames[form.studentID] || form.studentID}</td>
                              <td>{getConsentStatusText(form.consentStatus || form.status || form.consent_status, form.statusID)}</td>
                              <td>
                                {isApproved && result && (
                                  <button className="btn btn-link btn-sm p-0" onClick={() => { setDetailModalContent({ type: 'result', data: result, student: studentNames[form.studentID] || form.studentID }); setShowDetailModal(true); }}>
                                    {result.Conclusion || 'Đã nhập'}
                                  </button>
                                )}
                                {isWaiting && (
                                  <button
                                    className="btn btn-link btn-sm text-warning p-0"
                                    style={{zIndex: 9999, pointerEvents: 'auto'}}
                                    onClick={() => handleOpenResultModal(form)}
                                  >
                                    Đang đợi kết quả (Nhập kết quả)
                                  </button>
                                )}
                                {isWaiting && !canEditResult && (
                                  <span className="text-warning">Đang đợi kết quả</span>
                                )}
                                {isDenied && (
                                  <>
                                    <button className="btn btn-link btn-sm p-0" onClick={() => { setDetailModalContent({ type: 'reason', data: form.reasonForDenial || 'Không có lý do', student: studentNames[form.studentID] || form.studentID }); setShowDetailModal(true); }}>
                                      Xem lý do
                                    </button>
                                  </>
                                )}
                                {!isApproved && !isDenied && (
                                  <span className="text-secondary">Chờ phản hồi</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStudentListModal(false)}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal/card nhỏ hiển thị lý do hoặc kết quả khám */}
        {showDetailModal && (
          <div className="modal show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {detailModalContent?.type === 'reason' ? 'Lý do từ chối' : 'Chi tiết kết quả khám'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                </div>
                <div className="modal-body">
                  {detailModalContent?.type === 'reason' && (
                    <>
                      <div><b>Học sinh:</b> {detailModalContent.student}</div>
                      <div className="mt-2"><b>Lý do:</b> {detailModalContent.data}</div>
                    </>
                  )}
                  {detailModalContent?.type === 'result' && (
                    <>
                      <div><b>Học sinh:</b> {detailModalContent.student}</div>
                      <div className="mt-2"><b>Kết luận:</b> {detailModalContent.data.conclusion}</div>
                      <div><b>Chiều cao:</b> {detailModalContent.data.height}</div>
                      <div><b>Cân nặng:</b> {detailModalContent.data.weight}</div>
                      <div><b>Huyết áp:</b> {detailModalContent.data.bloodPressure}</div>
                      <div><b>Nhịp tim:</b> {detailModalContent.data.heartRate}</div>
                      <div><b>Thị lực:</b> {detailModalContent.data.eyesight}</div>
                      <div><b>Thính lực:</b> {detailModalContent.data.hearing}</div>
                      <div><b>Răng miệng:</b> {detailModalContent.data.oralHealth}</div>
                      <div><b>Cột sống:</b> {detailModalContent.data.spine}</div>
                      <div><b>Ngày khám:</b> {detailModalContent.data.checkUpDate}</div>
                      <div><b>Người khám:</b> {detailModalContent.data.checker}</div>
                      <div><b>Trạng thái:</b> {detailModalContent.data.status}</div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showResultModal && (
          <HealthCheckResultForm
            consentFormId={resultForm.consentId}
            checkUpType={resultForm.CheckupType}
            checker={currentUser?.username || ''}
            existingResult={healthCheckResults[resultForm.consentId] || null}
            onSuccess={() => {
              setShowResultModal(false);
              fetchResultForConsent(resultForm.consentId);
            }}
            onCancel={() => setShowResultModal(false)}
          />
        )}
        <ErrorDialog open={showError} message={error} onClose={() => setShowError(false)} type={errorType} />
        {/* Dialog xác nhận gửi thông báo */}
        <ErrorDialog open={showConfirm} message={confirmMessage} onClose={() => setShowConfirm(false)} type="info"
          // Nút xác nhận
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
};

function ApprovedStudentsList({ planId }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getApprovedStudents(planId);
      const data = await Promise.all(res.data.map(async (consent) => {
        const resultRes = await getResultByConsent(consent.id);
        return {
          ...consent,
          resultStatus: resultRes.data?.resultStatus || 'Đang chờ kết quả'
        };
      }));
      setStudents(data);
    };
    if (planId) fetchData();
  }, [planId]);

  return (
    <table>
      <thead>
        <tr>
          <th>Học sinh</th>
          <th>Trạng thái kết quả</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s, idx) => (
          <tr key={s.id || `approved-student-row-${idx}`}>
            <td>{s.student?.name}</td>
            <td>
              {s.resultStatus === 'Completed' && <span style={{color: 'green'}}>Hoàn thành</span>}
              {s.resultStatus === 'FollowUp' && <span style={{color: 'orange'}}>Theo dõi sau khi khám</span>}
              {s.resultStatus === 'Đang chờ kết quả' && <span style={{color: 'gray'}}>Đang chờ kết quả</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default HealthCheckManagement;
