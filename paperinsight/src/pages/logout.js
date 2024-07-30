// src/pages/logout.js

import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authcontext';

const Logout = () => {
  const { accessToken, refreshToken, setAccessToken, setRefreshToken, setEmail } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/auth/logout`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (response.status === 204) {
          alert('로그아웃 되었습니다.');
          navigate('/login');
        }
      } catch (error) {
        console.error('로그아웃 요청 에러:', error);
        alert('로그아웃에 실패했습니다.');
      }
    };

    logout();
  }, [accessToken, refreshToken, setAccessToken, setRefreshToken, setEmail, navigate]);

  return null;
};

export default Logout;
