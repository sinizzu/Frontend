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
        <Header />
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 5 }}>
            <Menu />
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 5 }}>
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
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          <Toolbar />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Routes>
              <Route path="/" element={<Home setSelectedPdf={setSelectedPdf} />} />
              <Route path="/search" element={<Search />} />
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
