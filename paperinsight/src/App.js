import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Tabs, Tab, Typography, Drawer, Box, Grid, List, ListItem, ListItemIcon, CircularProgress, IconButton } from '@mui/material';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
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
import { useLocation } from 'react-router-dom';

const drawerWidth = 80;
const appBarHeight = 64;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;


const AppContent = () => {

  // 업로드용 상태 
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState('');
  
  // 드라이브용 상태
  const [driveSelectedPdf, setDriveSelectedPdf] = useState(null);
  const [driveFileName, setDriveFileName] = useState('');
  const [drivePdfState, setDrivePdfState] = useState({ pdf_id: '', region: '' });
  const location = useLocation();

  // 검색용 상태
  const [searchSelectedPdf, setSearchSelectedPdf] = useState(null);
  const [searchFileName, setSearchFileName] = useState('');
  const [searchPdfState, setSearchPdfState] = useState({ pdf_id: '', region: '' });

  // 공통 상태
  const [showMessage, setShowMessage] = useState(true);
  const [showFileMessage, setShowFileMessage] = useState(true);
  const [fullText, setFullText] = useState('');
  const [pdfId, setPdfId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [value, setValue] = useState(null);
  const [ocrCompleted, setOcrCompleted] = useState(false);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [isDriveVisible, setIsDriveVisible] = useState(true);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [language, setLanguage] = useState('');
  
  const handleChange = async (event, newValue) => {
    setValue(newValue);
    if (newValue !== null) {
      setShowMessage(false);
    }
    if (driveSelectedPdf || searchSelectedPdf) {
      setShowFileMessage(false);
    }
    if (newValue === 0 && (driveSelectedPdf || searchSelectedPdf) && !ocrCompleted) {
      setOcrInProgress(true);
      try {
        // 이미 OCR이 완료되었다면 다시 수행하지 않음
        if (!ocrCompleted) {
          await performOCR(driveSelectedPdf || searchSelectedPdf, drivePdfState.pdf_id || searchPdfState.pdf_id);
        }
      } catch (error) {
        console.error('OCR 처리 중 오류 발생:', error);
      } finally {
        setOcrInProgress(false);
      }
    }
  };
  const handleFileUploadComplete = async (fileUrl, uuid) => {
    console.log('File upload completed:', fileUrl, uuid); // 로그 추가
    setUploadedFileUrl(fileUrl);
    setUploadedFileId(uuid);
    setOcrCompleted(false);
    setOcrInProgress(true);
    setValue(0);
  
    try {
      const result = await performOCR(fileUrl, uuid);
      console.log('OCR result:', result);
      setFullText(result.full_text);
      setPdfId(result.pdf_id);
      setLanguage(result.language);
      
      // OCR 완료 후 handleChange 함수 실행
      await handleChange(null, 0);
    } catch (error) {
      console.error('OCR 처리 중 오류 발생:', error);
    } finally {
      setOcrInProgress(false);
    }
  };

  const handleDrivePdfSelection = async (pdfUrl, pdfId, region) => {
    setDriveSelectedPdf(pdfUrl);
    setDriveFileName(pdfId);
    setOcrCompleted(false);
    setOcrInProgress(true);
    setDrivePdfState({ pdf_id: pdfId, region });
    setValue(0); // 챗봇 탭을 자동으로 선택
  
    try {
      const result = await performOCR(pdfUrl, pdfId);
      console.log(pdfUrl, pdfId, result);
      setFullText(result.full_text);
      setPdfId(result.pdf_id);
      setLanguage(result.language);
      
      // OCR 완료 후 handleChange 함수 호출
      await handleChange(null, 0);
    } catch (error) {
      console.error('OCR 처리 중 오류 발생:', error);
    } finally {
      setOcrInProgress(false);
    }
  };

  const handleSearchPdfSelection = async (pdfUrl, pdfId, region) => {
    setSearchSelectedPdf(pdfUrl);
    setSearchFileName(pdfId);
    setOcrCompleted(false);
    setOcrInProgress(true);
    setSearchPdfState({ pdf_id: pdfId, region });
    setValue(0); // 챗봇 탭을 자동으로 선택
  
    try {
      await performOCR(pdfUrl, pdfId);
    } catch (error) {
      console.error('OCR 처리 중 오류 발생:', error);
    } finally {
      setOcrInProgress(false);
    }
  };
  
  const performOCR = async (pdfUrl, pdfId) => {
    try {

      console.log("Performing OCR with:", { pdfUrl, pdfId });
      if (!pdfUrl || !pdfId) {
        throw new Error('pdfUrl 또는 pdfId가 누락되었습니다.');
      }
      
      console.log("Performing OCR on PDF URL:", pdfUrl);
      console.log("PDF ID during OCR:", pdfId);
      const formData = new FormData();
      formData.append('pdfUrl', pdfUrl);
      formData.append('pdfId', pdfId);
      const response = await axios.post(`${MAIN_FASTAPI}/api/ocr/ocrTest`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        const { pdf_id, full_text, language } = response.data.data;
        setOcrCompleted(true);
  
        console.log("OCR 결과:", { pdf_id, full_text, language });  // 로그 추가
  
        await divideChunk(pdf_id, full_text, language);
  
        return { pdf_id, full_text, language };  // OCR 결과 반환
      } else {
        throw new Error('OCR 요청 실패');
      }
    } catch (error) {
      console.error('OCR 요청 에러:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;  // 에러를 다시 던져서 상위에서 처리할 수 있게 함
    }
  };
  
  const divideChunk = async (pdfId, fullText, language) => {
    try {
      console.log("Divide Chunk 요청 데이터:", { pdfId, fullText, language });  // 로그 추가
  
      const response = await axios.post(
        `${MAIN_FASTAPI}/api/chatbot/divideChunk`,
        { pdfId, fullText, language },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.data.resultCode === 201) {
        console.log('divideChunk 요청 성공:', response.data);
      } else {
        console.error('divideChunk 요청 실패:', response.statusText);
      }
    } catch (error) {
      console.error('divideChunk 요청 에러:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    }
  };

  useEffect(() => {
    if (driveSelectedPdf || searchSelectedPdf) {
      setShowMessage(true);
      setShowFileMessage(false);
    }
  }, [driveSelectedPdf, searchSelectedPdf]);

  return (
 
      
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header fileName={driveFileName || searchFileName} />
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
                  <Grid className='drive-container' data-label="1-container" item xs={isDriveVisible ? 2.5 : 0.5} padding={isDriveVisible ? 3 : 0}
                    sx={{ 
                      height: '100%', backgroundColor: '#F7F9FB', 
                      borderRight: '1px solid #ccc', position: 'relative',
                      transition: '0.5s ease' }}>
                    {isDriveVisible ? (
                    <Routes>
                      <Route path="/" element={<Home 
                          setSelectedPdf={setDriveSelectedPdf}
                          setFileName={setDriveFileName}
                          setIsDriveVisible={setIsDriveVisible}
                          handleButtonClick={handleDrivePdfSelection} 
                          handlePdfSelection={handleDrivePdfSelection}
                          onFileUpload={handleFileUploadComplete}
                        />} />
                      <Route path="/chatbot" element={<Home setSelectedPdf={setDriveSelectedPdf} setFileName={setDriveFileName} />} />
                      <Route path="/search" element={<Search 
                        setSelectedPdf={setSearchSelectedPdf}
                        setFileName={setSearchFileName}
                        handleButtonClick={handleSearchPdfSelection}
                        handlePdfSelection={handleSearchPdfSelection}
                      />} />
                      <Route path="/paper" element={<div>Paper Page</div>} />
                      <Route path="/keyword" element={<Keyword pdfState={drivePdfState} />} />
                      <Route path="/summary" element={<Summary pdfState={drivePdfState} />} />
                    </Routes>
                    ) : (
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '33px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        <IconButton onClick={() => setIsDriveVisible(true)}>
                          <ArrowForwardIosOutlinedIcon/>
                        </IconButton>
                      </Box>
                    )}
                  </Grid>
                  <Grid data-label="2-container" item xs={isDriveVisible ? 4 : 4.5} padding={isDriveVisible ? 3 : 1}
                    sx={{ height: '100%', borderRight: '1px solid #ccc',
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
                          <Typography variant="body1" sx={{ ml: 2 }}>분석중...</Typography>
                        </Box>
                      ) : ocrCompleted ? (
                        <Chatbot 
                          pdfId={pdfId}
                          pdfUrl={pdfUrl}
                          fullText={fullText}
                          ocrCompleted={ocrCompleted}
                          pdfState={location.pathname === "/" ? drivePdfState : searchPdfState}
                          language={language} 
                        />
                      ) : driveSelectedPdf || searchSelectedPdf ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Typography variant="body1">OCR 처리를 시작하려면 챗봇 탭을 다시 클릭하세요.</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Typography variant="body1">PDF를 선택하고 챗봇 탭을 클릭하여 OCR 처리를 시작하세요.</Typography>
                        </Box>
                      )}
                    </>
                  )}
                  {value === 1 && (driveSelectedPdf || searchSelectedPdf) && (
                    keywordLoading || wikiLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>{keywordLoading ? '키워드 추출 중...' : '위키 데이터 로딩 중...'}</Typography>
                      </Box>
                    ) : (
                      <Keyword 
                        setSelectedPdf={location.pathname === "/" ? setDriveSelectedPdf : setSearchSelectedPdf} 
                        handleButtonClick={location.pathname === "/" ? handleDrivePdfSelection : handleSearchPdfSelection} 
                        pdfState={location.pathname === "/" ? drivePdfState : searchPdfState} 
                        setKeywordLoading={setKeywordLoading}
                        setWikiLoading={setWikiLoading}
                      />
                    )
                  )}
                  {value === 2 && (driveSelectedPdf || searchSelectedPdf) && (
                    <Summary 
                      setSelectedPdf={location.pathname === "/" ? setDriveSelectedPdf : setSearchSelectedPdf} 
                      handleButtonClick={location.pathname === "/" ? handleDrivePdfSelection : handleSearchPdfSelection} 
                      pdfState={location.pathname === "/" ? drivePdfState : searchPdfState}
                    />
                  )}
                    {!(driveSelectedPdf || searchSelectedPdf) && (
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="subtitle1">파일을 업로드 해주세요📁</Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid 
                    data-label="3-container" 
                    item 
                    xs={isDriveVisible ? 5.5 : 7.5} 
                    padding={3} 
                    sx={{ height: '100%' }}
                  >
                    <Routes>
                      <Route path="/" element={
                        driveSelectedPdf ? (
                          <PDFPreview pdfUrl={driveSelectedPdf} />
                        ) : (
                          <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="subtitle1">드라이브 pdf 뷰어</Typography>
                          </Box>
                        )
                      } />
                      <Route path="/search" element={
                        searchSelectedPdf ? (
                          <PDFPreview pdfUrl={searchSelectedPdf} />
                        ) : (
                          <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="subtitle1">검색 pdf 뷰어</Typography>
                          </Box>
                        )
                      } />
                    </Routes>
                  </Grid>
                </Grid>
              } />
            </Routes>
          </Box>
        </Box>
      </Box>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<AppContent />} />
      </Routes>
    </Router>
  );
};

export default App;
