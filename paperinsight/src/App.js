import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Tabs, Tab, Typography, Drawer, Box, Grid, List, ListItem, ListItemIcon, CircularProgress } from '@mui/material';
import Menu from './components/menu';
import Login from './pages/login';
import Register from './pages/register';
import Search from './pages/search';
import Home from './pages/driver';
import PDFPreview from './pages/pdfpreview';
import Chatbot from './pages/chatbot';
import Keyword from './pages/keyword';
import Summary from './pages/summary';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Header from './components/header';


import axios from 'axios';

const drawerWidth = 80;
const appBarHeight = 64;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

const App = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showMessage, setShowMessage] = useState(true);
  const [showFileMessage, setShowFileMessage] = useState(true);
  const [fullText, setFullText] = useState('');
  const [pdfId, setPdfId] = useState('');
  const [value, setValue] = useState(null); // 기본값을 0으로 설정하여 첫 번째 탭이 선택되도록 설정
  const [pdfState, setPdfState] = useState({ pdf_id: '', region: '' });
  const [ocrCompleted, setOcrCompleted] = useState(false);
  const [ocrInProgress, setOcrInProgress] = useState(false);


  const handleChange = async (event, newValue) => {
    setValue(newValue);
    if (newValue !== null) {
      setShowMessage(false);
    }
    if (selectedPdf) {
      setShowFileMessage(false);
    }
    if (newValue === 0 && selectedPdf && !ocrCompleted) {
      setOcrInProgress(true);
      try {
        console.log("Selected PDF URL in handleChange:", selectedPdf);
        console.log("Selected Thumbnail Name in handleChange:", fileName);
        await performOCR();
      } catch (error) {
        console.error('OCR 처리 중 오류 발생:', error);
      } finally {
        setOcrInProgress(false);
      }
    }
  };
  const performOCR = async () => {
    if (!selectedPdf) {
      console.error('선택된 PDF URL이 없습니다.');
      return;
    }
  
    try {
      console.log("Performing OCR on PDF URL:", selectedPdf);
      console.log("Thumbnail Name during OCR:", fileName);
      const formData = new URLSearchParams();
      formData.append('pdfUrl', selectedPdf);
      formData.append('pdfId', fileName);
      const response = await axios.post(`${MAIN_FASTAPI}/api/ocr/ocrTest`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      if (response.status === 200) {
        const { pdf_id, full_text } = response.data.data;
        setOcrCompleted(true);
        setFullText(full_text);
        setPdfId(pdf_id);

        // OCR이 완료되면 divideChunk 함수 호출
        await divideChunk(pdf_id, full_text);
      } else {
        throw new Error('OCR 요청 실패');
      }
    } catch (error) {
      console.error('OCR 요청 에러:', error);
    }
  };

  const divideChunk = async (pdfId, fullText) => {
    try {
      const response = await axios.post(
        `${MAIN_FASTAPI}/api/chatbot/divideChunk`, // 엔드포인트 URL 확인
        { pdfId: pdfId, fullText: fullText }, // fullText와 pdfId를 payload로 전송
        { headers: { 'Content-Type': 'application/json' } } // JSON 형식으로 전송
      );

      if (response.status === 200) {
        console.log('divideChunk 요청 성공:', response.data);
        // divideChunk 결과를 상태로 설정하거나 다른 처리를 할 수 있습니다.
        // 예: setChunkedData(response.data);
      } else {
        console.error('divideChunk 요청 실패:', response.statusText);
      }
    } catch (error) {
      console.error('divideChunk 요청 에러:', error);
    }
  };

  const handleButtonClick = (pdfLink, pdf_id, region) => {
    setSelectedPdf(pdfLink);
    setPdfState({ pdf_id, region });
    setValue(2); // 요약 탭(2번 탭)으로 변경
  };

  useEffect(() => {
    if (selectedPdf) {
      setShowMessage(true);
      setShowFileMessage(false);
      console.log("Selected PDF URL in useEffect:", selectedPdf);
      console.log("Selected Thumbnail Name in useEffect:", fileName);
    }
  }, [selectedPdf, fileName]);

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
                      <Route path="/" element={<Home 
                          setSelectedPdf={setSelectedPdf}
                          setFileName={setFileName}
                        />} />
                      <Route path="/chatbot" element={<Home setSelectedPdf={setSelectedPdf} setFileName={setFileName} />} />
                      <Route path="/search" element={<Search setSelectedPdf={setSelectedPdf} setFileName={setFileName} handleButtonClick={handleButtonClick} />} />
                      <Route path="/paper" element={<div>Paper Page</div>} />
                      <Route path="/keyword" element={<Keyword pdfState={pdfState} />} />
                      <Route path="/summary" element={<Summary pdfState={pdfState} />} />
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
                    {value === 0 && (
                      <>
                        {ocrInProgress ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                            <Typography variant="body1" sx={{ ml: 2 }}>OCR 처리 중...</Typography>
                          </Box>
                        ) : ocrCompleted ? (
                          <Chatbot 
                            pdfId={pdfId}
                            fullText={fullText}
                            ocrCompleted={ocrCompleted}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography variant="body1">PDF를 선택하고 챗봇 탭을 클릭하여 OCR 처리를 시작하세요.</Typography>
                          </Box>
                        )}
                      </>
                    )}
                    {value === 1 && selectedPdf && (
                     <Keyword setSelectedPdf={setSelectedPdf} handleButtonClick={handleButtonClick} pdfState={pdfState} />
                    )}
                    {value === 2 && selectedPdf && (
                      <Keyword setSelectedPdf={setSelectedPdf} handleButtonClick={handleButtonClick} pdfState={pdfState}/>
                    )}
                    {!selectedPdf && (
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="subtitle1">파일을 업로드 해주세요📁</Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid data-label="3-container" item xs={6} padding={3} sx={{ overflowY: 'auto', height: '100%' }}>
                    {!selectedPdf && (
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
