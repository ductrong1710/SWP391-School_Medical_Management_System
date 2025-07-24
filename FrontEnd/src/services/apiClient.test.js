import apiClient from './apiClient';

describe('apiClient interceptor', () => {
  it('gắn token vào header nếu có localStorage', async () => {
    const token = 'test-token';
    window.localStorage.setItem('token', token);
    const config = { headers: {} };
    const newConfig = await apiClient.interceptors.request.handlers[0].fulfilled(config);
    expect(newConfig.headers['Authorization']).toBe(`Bearer ${token}`);
  });

  it('không gắn token nếu không có localStorage', async () => {
    window.localStorage.removeItem('token');
    const config = { headers: {} };
    const newConfig = await apiClient.interceptors.request.handlers[0].fulfilled(config);
    expect(newConfig.headers['Authorization']).toBeUndefined();
  });

  it('reject error interceptor', async () => {
    const error = new Error('fail');
    await expect(apiClient.interceptors.request.handlers[0].rejected(error)).rejects.toThrow('fail');
  });
}); 