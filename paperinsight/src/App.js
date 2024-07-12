import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, Box, Grid, List, ListItem, ListItemIcon } from '@mui/material';
import Menu from './components/menu';
import Search from './pages/search';
import Home from './pages/driver';
import PDFPreview from './pages/pdfpreview';
import Keyword from './pages/keyword';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import Header from './components/header';

const drawerWidth = 80;

const App = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);

  return (
    <Router>
      <Box sx={{ display: 'flex', overflow: 'hidden' }}>
        {/* 헤더 */}
        <Header />
        {/* Drawer == 옆 팝업 */}
        <Drawer
          variant="permanent"
          sx={{
            mt:5,
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {/* 메뉴 */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 5, mt: 5 }}>
            <Menu />
          </Box>
          {/* 하단 유저 아이콘 */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 5, overflow: 'hidden', mt: 5 }}>
            <List>
              <ListItem button component={Link} to="/">
                <ListItemIcon>
                  <AccountCircleIcon sx={{ fontSize: 40 }} />
                </ListItemIcon>
              </ListItem>
            </List>
          </Box>
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', pl: 3,pt:10, width: '100%' }}
        >
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Routes>
              <Route path="/" element={<Home setSelectedPdf={setSelectedPdf} />} />
              <Route path="/search" element={<Search setSelectedPdf={setSelectedPdf} />} />
              <Route path="/paper" element={<div>Paper Page</div>} />
              <Route path="/Keyword" element={<Keyword />} />
              </Routes>
            </Grid>
            <Grid item xs={6}>
              <PDFPreview pdfUrl={selectedPdf} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
