import apiClient from './apiClient';

const healthCheckService = {
    // Lấy tất cả health checks
    getAllHealthChecks: async () => {
        try {
            const response = await apiClient.get('/HealthCheck');
            console.log('GET /HealthCheck response:', response); // Thêm dòng này
            // Đảm bảo dữ liệu trả về là một mảng
            const records = Array.isArray(response.data) ? response.data : [response.data];
            // Chuyển đổi dữ liệu để phù hợp với frontend
            const formattedRecords = records.map(record => ({
                healthRecordID: record.healthRecordID,
                studentID: record.studentID,
                parentID: record.parentID,
                allergies: record.allergies,
                chronicDiseases: record.chronicDiseases,
                treatmentHistory: record.treatmentHistory,
                eyesight: record.eyesight,
                hearing: record.hearing,
                vaccinationHistory: record.vaccinationHistory,
                note: record.note,
                parentContact: record.parentContact
            }));
            return formattedRecords;
        } catch (error) {
            console.error('Error fetching health checks:', error);
            // Trả về mảng rỗng trong trường hợp lỗi
            return [];
        }
    },
    // Lấy health check bằng ID
    getHealthCheckById: async (id) => {
        try {
            const response = await apiClient.get(`/HealthCheck/${id}`);
            const record = response.data;
            return {
                healthRecordID: record.healthRecordID,
                studentID: record.studentID,
                parentID: record.parentID,
                allergies: record.allergies,
                chronicDiseases: record.chronicDiseases,
                treatmentHistory: record.treatmentHistory,
                eyesight: record.eyesight,
                hearing: record.hearing,
                vaccinationHistory: record.vaccinationHistory,
                note: record.note,
                parentContact: record.parentContact
            };
        } catch (error) {
            console.error(`Error fetching health check with ID ${id}:`, error);
            throw error;
        }
    },
    // Lấy health checks theo student ID
    getHealthChecksByStudentId: async (studentId) => {
        try {
            const response = await apiClient.get(`/HealthCheck/student/${studentId}`);
            let records = [];
            if (response.data) {
                records = Array.isArray(response.data) ? response.data : [response.data];
            }
            const formattedRecords = records.map(record => ({
                healthRecordID: record.healthRecordID,
                studentID: record.studentID,
                parentID: record.parentID,
                allergies: record.allergies,
                chronicDiseases: record.chronicDiseases,
                treatmentHistory: record.treatmentHistory,
                eyesight: record.eyesight,
                hearing: record.hearing,
                vaccinationHistory: record.vaccinationHistory,
                note: record.note,
                parentContact: record.parentContact
            }));
            console.log('Formatted health checks:', formattedRecords);
            return formattedRecords;
        } catch (error) {
            console.error(`Error fetching health checks for student ${studentId}:`, error);
            return [];
        }
    },
    // Tạo health check mới
    createHealthCheck: async (healthCheckData) => {
        try {
            const formattedData = {
                healthRecordID: healthCheckData.healthRecordID,
                studentID: healthCheckData.studentID,
                parentID: healthCheckData.parentID,
                allergies: healthCheckData.allergies,
                chronicDiseases: healthCheckData.chronicDiseases,
                treatmentHistory: healthCheckData.treatmentHistory,
                eyesight: healthCheckData.eyesight,
                hearing: healthCheckData.hearing,
                vaccinationHistory: healthCheckData.vaccinationHistory,
                note: healthCheckData.note,
                parentContact: healthCheckData.parentContact
            };
            console.log('Sending health check data to API:', formattedData);
            const response = await apiClient.post('/HealthCheck', formattedData);
            return response.data;
        } catch (error) {
            console.error('Error creating health check:', error);
            throw error;
        }
    },
    // Cập nhật health check
    updateHealthCheck: async (id, healthCheckData) => {
        try {
            const formattedData = {
                healthRecordID: id,
                studentID: healthCheckData.studentID,
                parentID: healthCheckData.parentID,
                allergies: healthCheckData.allergies,
                chronicDiseases: healthCheckData.chronicDiseases,
                treatmentHistory: healthCheckData.treatmentHistory,
                eyesight: healthCheckData.eyesight,
                hearing: healthCheckData.hearing,
                vaccinationHistory: healthCheckData.vaccinationHistory,
                note: healthCheckData.note,
                parentContact: healthCheckData.parentContact
            };
            console.log('Updating health check data:', formattedData);
            const response = await apiClient.put(`/HealthCheck/${id}`, formattedData);
            return response.data;
        } catch (error) {
            console.error(`Error updating health check with ID ${id}:`, error);
            throw error;
        }
    },
    // Xóa health check
    deleteHealthCheck: async (id) => {
        try {
            const response = await apiClient.delete(`/HealthCheck/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting health check with ID ${id}:`, error);
            throw error;
        }
    },
    // Kiểm tra kết nối với backend
    checkBackendConnection: async () => {
        try {
            // Gọi đúng endpoint REST
            const response = await apiClient.get('/HealthCheck');
            if (response && (Array.isArray(response.data) || typeof response.data === 'object')) {
                return { connected: true, message: 'Kết nối thành công với backend' };
            }
            return { connected: false, message: 'API trả về dữ liệu không hợp lệ.' };
        } catch (error) {
            console.error('Backend connection error:', error);
            if (error.code === 'ERR_NETWORK') {
                return { connected: false, message: 'Không thể kết nối với backend. Hãy đảm bảo rằng backend đang chạy và cổng 5284 đang được mở.' };
            }
            if (error.response) {
                if (error.response.status === 401) {
                    return { connected: false, message: 'Không có quyền truy cập API. Vui lòng đăng nhập lại.' };
                }
                if (error.response.status === 404) {
                    return { connected: false, message: 'Không tìm thấy API endpoint. Vui lòng kiểm tra lại đường dẫn.' };
                }
                return { connected: false, message: `Lỗi từ server: ${error.response.status} - ${error.response.statusText}` };
            }
            return { connected: false, message: 'Không thể kết nối với backend. Vui lòng kiểm tra lại cấu hình hoặc liên hệ quản trị viên.' };
        }
    },
    // Tìm profile theo họ tên và lớp
    findProfileByNameAndClass: async (name, className) => {
        try {
            const response = await apiClient.get(`/Profile/search`, { params: { name, class: className } });
            return response.data;
        } catch (error) {
            console.error('Không tìm thấy profile:', error);
            return null;
        }
    },
};

export default healthCheckService;
