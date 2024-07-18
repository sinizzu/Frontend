import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Tabs, Tab, Typography, Drawer, Box, Grid, List, ListItem, ListItemIcon } from '@mui/material';
import Menu from './components/menu';
import Login from './pages/login';
import Register from './pages/register';
import Search from './pages/search';
import Home from './pages/driver';
import PDFPreview from './pages/pdfpreview';
import Chatbot from './pages/chatbot';
import Keyword from './pages/keyword';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Header from './components/header';

const drawerWidth = 80;
const appBarHeight = 64;

const App = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showMessage, setShowMessage] = useState(true);
  const [showFileMessage, setShowFileMessage] = useState(true);
  const [value, setValue] = useState(null);
  const [pdfState, setPdfState] = useState({ pdf_id: '', region: '' });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue !== null) {
      setShowMessage(false);
    }
    if (selectedPdf) {
      setShowFileMessage(false);
    }
  };

  const handleButtonClick = (pdfLink, pdf_id, region) => {
    setSelectedPdf(pdfLink);
    setPdfState({ pdf_id, region });
    setValue(2); // 키워드 탭(2번 탭)으로 변경
  };

  useEffect(() => {
    if (selectedPdf) {
      setShowMessage(true);
      setShowFileMessage(false);
    }
  }, [selectedPdf]);

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header fileName={fileName} />
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', marginTop: `${appBarHeight}px` }}>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 10 }}>
              <Menu />
            </Box>
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
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              height: 'calc(100vh - 64px)',
            }}
          >
            <Routes>
              <Route path="/login" element={<Grid container spacing={2} sx={{ height: '100%' }}><Grid item xs={12}><Login /></Grid></Grid>} />
              <Route path="/register" element={<Grid container spacing={2} sx={{ height: '100%' }}><Grid item xs={12}><Register /></Grid></Grid>} />
              <Route path="*" element={
                <Grid container sx={{ flexGrow: 1, height: 'calc(100vh - 64px)' }}>
                  <Grid data-label="l-container" item xs={2.5} padding={3}
                    sx={{ overflowY: 'auto', height: '100%', backgroundColor: '#F7F9FB', borderRight: '1px solid #ccc' }}>
                    <Routes>
                      <Route path="/" element={<Home setSelectedPdf={setSelectedPdf} setFileName={setFileName} handleButtonClick={handleButtonClick} />} />
                      <Route path="/chatbot" element={<Home setSelectedPdf={setSelectedPdf} setFileName={setFileName} />} />
                      <Route path="/search" element={<Search setSelectedPdf={setSelectedPdf} setFileName={setFileName} handleButtonClick={handleButtonClick} />} />
                      <Route path="/paper" element={<div>Paper Page</div>} />
                      <Route path="/keyword" element={<Keyword pdfState={pdfState} />} />
                    </Routes>
                  </Grid>

                  <Grid data-label="2-container" item xs={3.5} padding={3}
                    sx={{
                      overflowY: 'auto', height: '100%', borderRight: '1px solid #ccc',
                      display: 'flex', flexDirection: 'column'
                    }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"
                      sx={{ width: '100%' }}>
                      <Tab label="챗봇" sx={{ flexGrow: 1, textAlign: 'center' }} />
                      <Tab label="키워드" sx={{ flexGrow: 1, textAlign: 'center' }} />
                      <Tab label="요약" sx={{ flexGrow: 1, textAlign: 'center' }} />
                    </Tabs>
                    {value === 0 && selectedPdf && (
                      <Chatbot setSelectedPdf={setSelectedPdf} />
                    )}
                    {value === 1 && selectedPdf && (
                      <Keyword setSelectedPdf={setSelectedPdf} handleButtonClick={handleButtonClick} pdfState={pdfState} />
                    )}
                    {value === 2 && selectedPdf && (
                      <Keyword setSelectedPdf={setSelectedPdf} handleButtonClick={handleButtonClick} pdfState={pdfState}/>
                    )}
                    {showFileMessage && !selectedPdf && (
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="subtitle1">파일을 업로드 해주세요📁</Typography>
                      </Box>
                    )}
                    {showMessage && selectedPdf && (
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <Typography variant="subtitle1">원하는 학습을 진행해보세요!✏️</Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid data-label="3-container" item xs={6} padding={3} sx={{ overflowY: 'auto', height: '100%' }}>
                    {showFileMessage && !selectedPdf && (
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="subtitle1">pdf 뷰어</Typography>
                      </Box>
                    )}
                    {selectedPdf && (
                      <PDFPreview pdfUrl={selectedPdf} />
                    )}
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
