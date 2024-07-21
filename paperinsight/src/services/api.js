import axios from 'axios';
import { getNewAccessToken } from './token_service';

const baseURL = process.env.REACT_APP_API_BASE_URL;
console.log('API instance baseURL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true
});


// 요청 인터셉터 추가
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 만약 액세스 토큰이 만료되었다면 갱신
    const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (decodedToken.exp < currentTime) {
      token = await getNewAccessToken();
      localStorage.setItem('accessToken', token);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const token = await getNewAccessToken();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
