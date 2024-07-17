import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, Box, Grid, List, ListItem, ListItemIcon } from '@mui/material';
import Menu from './components/menu';
import Login from './pages/login';
import Register from './pages/register';
import Search from './pages/search';
import Home from './pages/driver';
import PDFPreview from './pages/pdfpreview';
import Chatbot from './pages/chatbot';
import Keyword from './pages/keyword';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import Header from './components/header';

const drawerWidth = 80;
const appBarHeight = 64; // AppBar의 높이

const App = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [fileName, setFileName] = useState('');

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* 헤더 */}
        <Header fileName={fileName} />
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', marginTop: `${appBarHeight}px` }}>
          {/* Drawer == 옆 팝업 */}
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            {/* 메뉴 */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 5 }}>
              <Menu />
            </Box>
            {/* 하단 유저 아이콘 */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 5 }}>
              <List>
                <ListItem button component={Link} to="/login">
                  <ListItemIcon>
                    <AccountCircleIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                </ListItem>
              </List>
            </Box>
          </Drawer>
          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', display: 'flex', flexDirection: 'row', overflow: 'hidden', height: 'calc(100vh - 64px)' }} // AppBar의 높이를 고려하여 height 설정
          >
            <Routes>
              <Route path="/login" element={<Grid container spacing={2}><Grid item xs={12}><Login /></Grid></Grid>} />
              <Route path="/register" element={<Grid container spacing={2}><Grid item xs={12}><Register /></Grid></Grid>} />
              <Route path="*" element={
                <Grid container spacing={2} sx={{ flexGrow: 1, height: '100%' }}>
                  <Grid item xs={3} sx={{ overflowY: 'auto', height: '100%' }}>
                    <Routes>
                      <Route path="/" element={<Home setSelectedPdf={setSelectedPdf} />} />
                      <Route path="/chatbot" element={<Chatbot setSelectedPdf={setSelectedPdf} />} />
                      <Route path="/search" element={<Search setSelectedPdf={setSelectedPdf} />} />
                      <Route path="/paper" element={<div>Paper Page</div>} />
                      <Route path="/Keyword" element={<Keyword />} />
                    </Routes>
                  </Grid>
                  <Grid item xs={9} sx={{ overflowY: 'auto', height: '100%' }}>
                    <PDFPreview pdfUrl={selectedPdf} />
                  </Grid>
                </Grid>
              } />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
