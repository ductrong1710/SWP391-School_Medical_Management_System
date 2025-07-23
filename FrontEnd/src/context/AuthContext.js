import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Lấy lại user và token từ localStorage khi khởi tạo
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Khi app khởi động, nếu có token thì set lại header cho apiClient
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    setLoading(true);
    try {
      const response = await apiClient.post('/Auth/login', { username, password });
      const userData = response.data;
      // Trong thực tế, backend nên trả về token. Ở đây ta dùng tạm dummy token.
      const token = "dummy-jwt-token";
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Login API call failed:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.title || error.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setAuthError(errorMessage);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    console.log("User logged out");
  };

  // Helper function to get user role
  const getUserRole = () => {
    // Ưu tiên lấy roleType (chữ thường), fallback sang RoleType nếu cần
    return user?.roleType || user?.RoleType || 'Unknown';
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    return getUserRole() === role;
  };

  // For debugging purposes
  console.log("AuthContext current state - isAuthenticated:", isAuthenticated, "user:", user);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      authError,
      login, 
      logout,
      getUserRole,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
