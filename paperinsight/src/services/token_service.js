import axios from 'axios';

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};


export const getNewAccessToken = async (refreshToken, accessToken) => {

  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/refresh`, refreshToken, {
    headers: {
      'authorization': `Bearer ${accessToken}`
    }
  });
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken
  };
} 