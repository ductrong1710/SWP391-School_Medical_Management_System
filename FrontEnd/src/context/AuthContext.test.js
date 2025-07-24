import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import apiClient from '../services/apiClient';

jest.mock('../services/apiClient');

const TestComponent = () => {
  const { user, isAuthenticated, loading, authError, login, logout, getUserRole, hasRole } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.username : ''}</div>
      <div data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="loading">{loading ? 'yes' : 'no'}</div>
      <div data-testid="error">{authError || ''}</div>
      <button onClick={() => login('test', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
      <div data-testid="role">{getUserRole()}</div>
      <div data-testid="hasRole">{hasRole('Admin') ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    apiClient.post.mockReset();
  });

  it('set header Authorization nếu có token khi mount', () => {
    window.localStorage.setItem('token', 'abc');
    render(<AuthProvider><TestComponent /></AuthProvider>);
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer abc');
  });

  it('login thành công', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { username: 'test', roleType: 'Admin' } });
    let utils;
    await act(async () => {
      utils = render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    await act(async () => {
      utils.getByText('Login').click();
    });
    await waitFor(() => expect(utils.getByTestId('user').textContent).toBe('test'));
    expect(utils.getByTestId('auth').textContent).toBe('yes');
    expect(window.localStorage.getItem('user')).toContain('test');
    expect(window.localStorage.getItem('token')).toBe('dummy-jwt-token');
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer dummy-jwt-token');
  });

  it('login thất bại', async () => {
    apiClient.post.mockRejectedValueOnce({ response: { data: { title: 'Sai tài khoản' } } });
    let utils;
    await act(async () => {
      utils = render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    await act(async () => {
      utils.getByText('Login').click();
    });
    await waitFor(() => expect(utils.getByTestId('error').textContent).toBe('Sai tài khoản'));
    expect(utils.getByTestId('auth').textContent).toBe('no');
  });

  it('logout xóa user, token và header', async () => {
    window.localStorage.setItem('user', JSON.stringify({ username: 'test' }));
    window.localStorage.setItem('token', 'abc');
    apiClient.defaults.headers.common['Authorization'] = 'Bearer abc';
    let utils;
    await act(async () => {
      utils = render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    await act(async () => {
      utils.getByText('Logout').click();
    });
    expect(window.localStorage.getItem('user')).toBeNull();
    expect(window.localStorage.getItem('token')).toBeNull();
    expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
    expect(utils.getByTestId('auth').textContent).toBe('no');
  });

  it('getUserRole và hasRole hoạt động đúng', async () => {
    window.localStorage.setItem('user', JSON.stringify({ username: 'test', roleType: 'Admin' }));
    let utils;
    await act(async () => {
      utils = render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    expect(utils.getByTestId('role').textContent).toBe('Admin');
    expect(utils.getByTestId('hasRole').textContent).toBe('yes');
  });
}); 