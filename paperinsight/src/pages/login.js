// src/pages/login.js
import React, { useState} from 'react';
import { Box, Button, TextField, Typography, Divider, Link as MuiLink  } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import kakaoIcon from '../assets/kakao.png'; // Kakao 아이콘을 이미지 파일로 임포트
import Logo from '../assets/logo.png';
import { Link as RouterLink, useNavigate  } from 'react-router-dom';
import axios from 'axios';

const YJ_IP = process.env.REACT_APP_YJ_IP
const Login = () => {
 
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${YJ_IP}:8000/api/auth/login`, { 
        userId: id,
        passWord: password 
      });
      console.log('Login successful:', response.data);
      // handle successful login
      navigate('/home');
    
    } catch (error) {
      console.error('Login failed:', error);
      console.log('Environment variable REACT_APP_YJ_IP:', process.env.REACT_APP_YJ_IP);
    }
  }
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
        <img src={Logo} alt="Logo" style={{ width: '40px',height: '40px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '24px' }} gutterBottom>
          Log In
        </Typography>
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
          sx = {{fontWeight: 'bold'}}
          onClick={handleLogin}>Log in</Button>
        <Divider style={{ width: '100%', margin: '24px 0' }}>OR</Divider>
        <Button 
          variant="contained" 
          startIcon={<GoogleIcon />} 
          style={{ backgroundColor: '#4285F4', color: 'white', marginBottom: '8px' }} 
          fullWidth
          sx = {{fontWeight: 'bold'}}
        >
          Continue with Google
        </Button>
        <Button 
          variant="contained"
          style={{ backgroundColor: '#FEE500', color: 'black', display: 'flex', alignItems: 'center' }} 
          fullWidth
          sx = {{fontWeight: 'bold'}}
        >
          <img src={kakaoIcon} alt="Kakao" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
          Continue with Kakao
        </Button>
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
