import axios from 'axios';
import {decodeToken, getNewAccessToken } from './token_service'; // 위에서 작성한 디코드 함수


const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',

});

// 요청 인터셉터 추가
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('accessToken');

    if (token) {
      const decodedToken = decodeToken(token);
      const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)

      // 토큰이 만료된 경우 갱신
      if (decodedToken && decodedToken.exp < currentTime-60) {
        token = await getNewAccessToken();
        localStorage.setItem('accessToken', token.accessToken);
        localStorage.setItem('refreshToken', token.refreshToken);
      }

      config.headers.authorization = `Bearer ${token}`;
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
      localStorage.setItem('accessToken', token.accessToken); // 새 토큰 저장
      localStorage.setItem('refreshToken', token.refreshToken);
      originalRequest.headers.authorization = `Bearer ${token}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
