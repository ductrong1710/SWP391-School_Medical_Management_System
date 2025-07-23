import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usernameInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authError } = useAuth();
  
  // Lấy trang redirect từ state hoặc mặc định là dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  console.log("Login - Redirect path:", from);
  
  // Handle back button click
  const handleBack = () => {
    navigate('/');
  };
  
  // Nếu đã đăng nhập, chuyển hướng đến trang đích
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Display auth errors from context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  // Force clear localStorage if the user is on login page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const forceLogin = urlParams.get('force');
    
    if (forceLogin === 'true') {
      localStorage.removeItem('user');
      console.log("Force login parameter detected - cleared localStorage");
      // Remove the query parameter to prevent endless loops
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log("Login form submitted - Calling API");
    
    const loginSuccess = await login(credentials.username, credentials.password);
    
    if (loginSuccess) {
      // Chuyển hướng sẽ được xử lý tự động
      console.log("Login API call successful");
    } else {
      // Lỗi đã được set trong AuthContext và sẽ hiển thị
      console.log("Login API call failed");
    }
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-container">
      <button onClick={handleBack} className="back-button">
        <i className="fas fa-arrow-left"></i> Quay lại
      </button>
      
      <div className="left-panel">
        <div className="logo" style={{ marginTop: '64px' }}>
          <img src="/assets/healthconnect-logo.svg" alt="Logo" style={{ height: '72px', marginBottom: '16px' }} />
        </div>
        <div className="welcome-title">Chào mừng</div>
        <div className="portal-desc">Đăng nhập vào Cổng thông tin Y tế học đường</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Tên đăng nhập</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              className="form-input" 
              placeholder="Nhập tên đăng nhập" 
              required 
              autoComplete="username"
              value={credentials.username ?? ""}
              onChange={handleChange}
              ref={usernameInputRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <div className="password-wrapper">
              <input 
                type={passwordVisible ? "text" : "password"} 
                id="password" 
                name="password" 
                className="form-input" 
                placeholder="Nhập mật khẩu" 
                required 
                autoComplete="current-password"
                value={credentials.password ?? ""}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="show-password" 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? "ẨN" : "HIỆN"}
              </button>
            </div>
          </div>
          {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}
          <Link to="/forgot-password" className="forgot-link">Quên tên đăng nhập hoặc mật khẩu?</Link>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{marginRight: '8px'}}></span> : null}
            Đăng nhập
          </button>
          <Link to="/register" className="create-link">Chưa có tài khoản? Tạo tài khoản ngay.</Link>
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#555' }}>
            Hỗ trợ trực tuyến có thể được tìm thấy trong <Link to="/help" className="support-link">Trợ giúp tài khoản</Link>.
          </div>
        </form>
      </div>
      <div className="right-panel">
        <div className="school-health-info" style={{ marginTop: '60px', color: '#fff' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '18px' }}>Y tế học đường</div>
          <ul style={{ fontSize: '1.08rem', lineHeight: '1.7', paddingLeft: '18px', marginBottom: '32px' }}>
            <li>Chăm sóc sức khỏe học sinh toàn diện tại trường.</li>
            <li>Quản lý tiêm chủng, khám sức khỏe định kỳ, hồ sơ sức khỏe điện tử.</li>
            <li>Hỗ trợ khai báo y tế, phòng chống dịch bệnh.</li>
            <li>Tư vấn sức khỏe, dinh dưỡng và tâm lý học đường.</li>
          </ul>
          <div style={{ fontSize: '1rem', opacity: '0.85' }}>Nền tảng hiện đại giúp kết nối giữa nhà trường, phụ huynh và cơ sở y tế.</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
