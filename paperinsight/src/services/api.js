import axios from 'axios';
import { decodeToken, getNewAccessToken } from './token_service'; // 위에서 작성한 디코드 함수


const createApi = (accessToken, refreshToken, setAccessToken, setRefreshToken) => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',

  });

  console.log(`API instance created : ${api}`);

  // 요청 인터셉터 추가
  api.interceptors.request.use(
    async (config) => {
      let token = accessToken;

      if (token) {
        const decodedToken = decodeToken(token);
        const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)

        // 토큰이 만료된 경우 갱신
        if (decodedToken && decodedToken.exp < currentTime - 300) {
          const newTokens = await getNewAccessToken(refreshToken, accessToken);
          setAccessToken(newTokens.accessToken);
          setRefreshToken(newTokens.refreshToken);
        }

        config.headers.authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 추가
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newTokens = await getNewAccessToken(refreshToken, accessToken);
          setAccessToken(newTokens.accessToken);
          setRefreshToken(newTokens.refreshToken);
          originalRequest.headers.authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
};

export default createApi;
