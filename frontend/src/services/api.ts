import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URLS.BACKEND_API,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_CONFIG.BASE_URLS.BACKEND_API}/api/auth/refresh`, { refreshToken });
          const { token, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const qrApi = {
  getQRCodeUrl: (shortCode: string, size = 300) => {
    return `${API_CONFIG.BASE_URLS.BACKEND_API}/api/qr/${shortCode}?size=${size}`;
  },

  getQRData: async (shortCode: string) => {
    const response = await api.get(`/api/qr/${shortCode}/data`);
    return response.data.data;
  },

  getQRSVGUrl: (shortCode: string) => {
    return `${API_CONFIG.BASE_URLS.BACKEND_API}/api/qr/${shortCode}?format=svg`;
  },

  downloadQR: async (shortCode: string, filename?: string) => {
    const response = await api.get(`/api/qr/${shortCode}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `nexusurl-${shortCode}.png`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  trackQRScan: async (shortCode: string) => {
    await api.post(`/api/qr/${shortCode}/track`);
  },

  bulkGenerateQR: async (shortCodes: string[]) => {
    const response = await api.post('/api/qr/bulk', { shortCodes });
    return response.data.data.qrCodes;
  },
};

export default api;
