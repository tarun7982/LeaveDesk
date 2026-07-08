import axios from 'axios';

function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl) return rawUrl;

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return trimmedUrl;

  const withoutTrailingSlash = trimmedUrl.replace(/\/$/, '');

  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const fallbackApiUrl = (() => {
  const host = window.location.hostname;

  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  if (host.includes('github.io')) {
    return 'https://leavedesk-api.onrender.com/api';
  }

  return `http://${host}:5000/api`;
})();

const BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || fallbackApiUrl);

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && localStorage.getItem('refreshToken')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.hash = '#/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
