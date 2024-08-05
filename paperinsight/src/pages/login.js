// src/pages/login.js
import React, { useState, useContext } from 'react';
import { Box, Button, TextField, Typography, Divider, Link as MuiLink } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import kakaoIcon from '../assets/kakao.png'; // Kakao 아이콘을 이미지 파일로 임포트
import Logo from '../assets/logo.png';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/authcontext';
import createApi from '../services/api';



const Login = () => {
  const { accessToken, refreshToken, setAccessToken, setRefreshToken, setEmail, setLogoutStatus } = useContext(AuthContext);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        email: id,
        password: password
      });
      console.log('Login successful:', response.data);
      setLogoutStatus(null);

      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }

      setEmail(id);
      // 로컬 스토리지에 저장
      localStorage.setItem('email', id);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // API 인스턴스 생성
      createApi(response.data.accessToken, setAccessToken);
      
      // 새로운 API 인스턴스 생성
      // initializeApi(response.data.accessToken, response.data.refreshToken); // api 초기화 기다리기
      console.log(`authcontext api : ${accessToken}`);
      console.log(`authcontext refreshToken : ${refreshToken}`);


      // handle successful login
      navigate('/drive');

    } catch (error) {
      console.error('Login failed:', error);
      console.log('Full API URL:', `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`);

      if (error.response) {

        switch (error.response.status) {
          case 401:
            alert('해당 정보로 로그인할 수 없습니다.');
            break;
          case 400:
            alert('유효하지 않은 ID 및 PW 형태입니다.');
          default:
            alert('Login failed');
        }
      } else if (error.request) {
        // 요청이 이루어졌으나 응답을 받지 못한 경우
        console.error('No response received:', error.request);
        alert('서버로부터 응답을 받지 못했습니다.');
      } else {
        // 요청을 설정하는 중에 문제가 발생한 경우
        console.error('Error setting up request:', error.message);
        alert('요청 설정 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="87vh"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width={500}
        p={4}
        border="1px solid #ccc"
        borderRadius={8}
        boxShadow={1}
      >
        <img src={Logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '24px' }} gutterBottom>
          Log In
        </Typography>
        <TextField
          label="email"
          variant="outlined"
          fullWidth
          margin="normal"
          size="small"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '16px' }}
          sx={{ fontWeight: 'bold' }}
          onClick={handleLogin}>
          Log in</Button>
        <Divider style={{ width: '100%', margin: '24px 0' }}></Divider>
        {/* <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          style={{ backgroundColor: '#4285F4', color: 'white', marginBottom: '8px' }}
          fullWidth
          sx={{ fontWeight: 'bold' }}
        >
          Continue with Google
        </Button>
        <Button
          variant="contained"
          style={{ backgroundColor: '#FEE500', color: 'black', display: 'flex', alignItems: 'center' }}
          fullWidth
          sx={{ fontWeight: 'bold' }}
        >
          <img src={kakaoIcon} alt="Kakao" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
          Continue with Kakao
        </Button> */}
        <Typography variant="body2" sx={{ marginTop: '16px' }}>
          Don't have an account?{' '}
          <MuiLink component={RouterLink} to="/register" underline="hover">
            Sign Up
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
