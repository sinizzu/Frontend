import React, { useState } from 'react';
import { Box, Drawer, IconButton, Divider, Toolbar } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Menu from '../components/menu';
import PdfPreview from './pdfpreview';

const drawerWidth = 240;

function Chatbot() {
  const [open, setOpen] = useState(true);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuClick = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <Menu onClick={handleMenuClick} />
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, marginLeft: open ? drawerWidth : 0, transition: 'margin 0.3s' }}
      >
        <h1>Chatbot Page</h1>
        <PdfPreview />
      </Box>
    </Box>
  );
}

export default Chatbot;
