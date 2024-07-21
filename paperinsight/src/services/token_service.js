import axios from 'axios';

export const getNewAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await axios.post('/api/auth/refresh-token', { refreshToken });
  const { accessToken } = response.data.data;
  localStorage.setItem('accessToken', accessToken);
  return accessToken;
};

export const scheduleTokenRefresh = (interval = 15 * 60 * 1000) => { // 15분마다 갱신
  setInterval(async () => {
    try {
      await getNewAccessToken();
    } catch (error) {
      console.error('Failed to refresh access token', error);
    }
  }, interval);
};
