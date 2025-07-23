const axios = require('axios');

// Cấu hình axios instance với base URL của backend API
const apiClient = axios.create({
  baseURL: 'http://localhost:5284/api', // Đảm bảo đúng host và port backend ASP.NET Core
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 
});

// Thêm interceptor để gắn token vào header của mỗi request
apiClient.interceptors.request.use(
  config => {
    // Kiểm tra localStorage tồn tại (tránh lỗi khi test)
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
