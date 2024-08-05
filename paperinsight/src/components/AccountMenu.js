// src/components/AccountMenu.js

import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, IconButton, Menu, MenuItem, Avatar, Tooltip, ListItemIcon } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import Logout from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/authcontext';

const AccountMenu = () => {

  const { accessToken, logoutStatus, setLogoutStatus } = useContext(AuthContext);
  const [stateLogin, setStateLogin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    console.log('토큰', accessToken);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (logoutStatus === 204) {
      console.log('로그아웃 성공');
      setLogoutStatus(204); // 상태 리셋
    } else if (logoutStatus === 'error') {
      console.log('로그아웃 실패');
      // 로그아웃 실패 시 필요한 작업 수행
      setLogoutStatus(null); // 상태 리셋
    }
  }, [logoutStatus, setLogoutStatus]);

  return (
    <List>
      {accessToken && logoutStatus !== 204 ? (
      <ListItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Tooltip title="로그인 중" placement="top">
          <IconButton
            onClick={handleClick}
            sx={{ margin: 0, fontSize: 40 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 48, height: 48 }} src="/login.png" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: -1,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(60%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <MenuItem button component={Link} to="/logout" onClick={handleClose}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </ListItem> 
      ): (
      <ListItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
        <Tooltip title="사용자 정보 없음" placement="top">
          <IconButton
            onClick={handleClick}
            sx={{ margin: 0, fontSize: 40 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 45, height: 45 }} src="/logout.png" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: -1,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: 0,
                left: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(60%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <MenuItem button component={Link} to="/register" onClick={handleClose}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            Add account
          </MenuItem>
          <MenuItem button component={Link} to="/login" onClick={handleClose}>
            <ListItemIcon>
              <LoginIcon fontSize="small" />
            </ListItemIcon>
            Login
          </MenuItem>
        </Menu>
      </ListItem>
      )}
    </List>
  );
};

export default AccountMenu;
