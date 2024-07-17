import React from 'react';
import { Box, AppBar, Toolbar, CssBaseline, Typography } from '@mui/material';

function Header({ fileName }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, 
        boxShadow: 'none', backgroundColor: 'white', borderBottom: '1px solid #E0E0E0' }}>
        <Toolbar>
          <img src="/header.png" alt="Header Logo" style={{ height: '40px', marginRight: '16px' }} />
          {fileName && (
            <Typography variant="subtitle1" noWrap sx={{ marginLeft: '16px' }}>
              {fileName}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;
