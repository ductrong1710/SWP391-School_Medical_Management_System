import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VaccinationPlanStudents from '../pages/VaccinationPlanStudents';
import apiClient from '../services/apiClient';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../services/apiClient');

function renderWithRouter(ui) {
  return render(<MemoryRouter initialEntries={["/vaccination-plan/plan1/students"]}>{ui}</MemoryRouter>);
}

describe('VaccinationPlanStudents', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [
        { statusID: 1, studentID: 'U1', consentStatus: 'Approved' }
      ] });
      if (url.startsWith('/Profile/user/')) return Promise.resolve({ data: { name: 'Nguyen Van A', classID: '6A' } });
      return Promise.resolve({ data: [] });
    });
  });

  test('hiển thị loading', async () => {
    renderWithRouter(<VaccinationPlanStudents />);
    expect(screen.getByText(/đang tải dữ liệu/i)).toBeInTheDocument();
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  });

  test('hiển thị empty state khi không có học sinh', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.startsWith('/VaccinationConsentForm/plan/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderWithRouter(<VaccinationPlanStudents />);
    await waitFor(() => expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument());
  });

  test('hiển thị danh sách học sinh', async () => {
    renderWithRouter(<VaccinationPlanStudents />);
    await waitFor(() => screen.getByText(/nguyen van a/i));
    expect(screen.getByText(/nguyen van a/i)).toBeInTheDocument();
    expect(screen.getByText(/6a/i)).toBeInTheDocument();
  });

  test('xử lý lỗi API khi fetchStudents (catch)', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('API error'));
    renderWithRouter(<VaccinationPlanStudents />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument();
  });

  test('profile từng học sinh trả về lỗi (catch trong map)', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: [{ studentId: '1' }] })
      .mockRejectedValueOnce(new Error('Profile error'));
    renderWithRouter(<VaccinationPlanStudents />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument();
  });

  test('profile thiếu name/classID (fallback)', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: [{ studentId: '1' }] })
      .mockResolvedValueOnce({ data: { /* thiếu name, classID */ } });
    renderWithRouter(<VaccinationPlanStudents />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/không rõ/i)).toBeInTheDocument();
  });

  test('empty state khi students.length === 0', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<VaccinationPlanStudents />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    expect(screen.getByText(/không có học sinh nào/i)).toBeInTheDocument();
  });

  test('loading state', async () => {
    let resolve;
    apiClient.get.mockReturnValue(new Promise(r => { resolve = r; }));
    renderWithRouter(<VaccinationPlanStudents />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
    resolve({ data: [] });
  });
}); 