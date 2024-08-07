import React from 'react';
import { Box, AppBar, Toolbar, CssBaseline, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Header({ fileName }) {

  const location = useLocation();
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        boxShadow: 'none', 
        backgroundColor: 'white', 
        borderBottom: '1px solid #E0E0E0' 
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
          <img src="/header.png" alt="Header Logo" style={{ height: '40px' }} /></Link>
          <Typography variant="h6" mx={2} noWrap sx={{ color: 'black', fontWeight: 'bold' }}>PDFast</Typography>
          </Box>
          {fileName && location.pathname !== '/search' && (
            <Typography variant="subtitle1" noWrap sx={{ color: 'black' }}>
              {fileName}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;