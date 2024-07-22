// src/pages/register.js
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Divider, Link as MuiLink, Alert } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import kakaoIcon from '../assets/kakao.png'; // Kakao 아이콘을 이미지 파일로 임포트
import Logo from '../assets/logo.png';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api.js';



const Register = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await api.post(`/api/auth/signup`, {
        email: id,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Registration successful:', response.data);
  
      alert('회원가입이 완료되었습니다.'); 
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
  
      if (error.response) {
        // 서버가 2xx 범위를 벗어나는 상태 코드로 응답한 경우
        switch(error.response.status) {
          case 409:
            alert('중복된 email 입니다.');
            break;
          case 400:
            alert('사용할 수 없는 ID 혹은 PW 입력하세요.');
            break;
          default:
            if (error.response.data && error.response.data.data && error.response.data.data.message) {
              if (error.response.data.data.message.includes('Duplicate entry')) {
                setError('사용할 수 없는 ID 혹은 email 입니다.');
                alert('사용할 수 없는 아이디 혹은 이메일입니다.');
              } else {
                setError(error.response.data.data.message);
                alert(error.response.data.data.message);
              }
            } else {
              setError('Registration failed');
              alert('회원가입에 실패했습니다.');
            }
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
      height="100vh"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width={500}
        p={4}
        border="1px solid #ccc"
        borderRadius={8}
        boxShadow={3}
      >
        <img src={Logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '24px' }} gutterBottom>
          Sign Up
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="ID"
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
          onClick={handleRegister}
        >
          Register
        </Button>
        <Divider style={{ width: '100%', margin: '24px 0' }}>OR</Divider>
        <Button
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
        </Button>
        <Typography variant="body2" sx={{ marginTop: '16px' }}>
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" underline="hover">
            Sign In
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
