import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigat, Link } from 'react-router-dom';
import { Tabs, Tab, Typography, Drawer, Box, Grid, CircularProgress, IconButton } from '@mui/material';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import SideMenu from './components/menu';
import Main from './pages/main';
import Login from './pages/login';
import Register from './pages/register';
import Search from './pages/search';
import Drive from './pages/drive';
import PDFPreview from './pages/pdfpreview';
import Chatbot from './pages/chatbot';
import Keyword from './pages/keyword';
import Summary from './pages/summary';
import Header from './components/header';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/authcontext';
import AccountMenu from './components/AccountMenu'; // import AccountMenu
import Logout from './pages/logout';
import createApi from './services/api';

const drawerWidth = 80;
const appBarHeight = 64;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

const AppContent = () => {

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
  const [thumbnailFileName, setThumbnailFileName] = useState('');
  const { accessToken, setAccessToken, setEmail } = useContext(AuthContext);


  const handleChange = async (event, newValue) => {
    setValue(newValue);
    if (newValue !== null) {
        setShowMessage(false);
    }
    if (driveSelectedPdf || searchSelectedPdf) {
        setShowFileMessage(false);
    }
    if (newValue === 0 && (driveSelectedPdf || searchSelectedPdf) && !ocrCompleted && !ocrInProgress) {
        setOcrInProgress(true);
        try {
            await performOCR(driveSelectedPdf || searchSelectedPdf ,drivePdfState.pdf_id || searchPdfState.pdf_id);
            setOcrCompleted(true);
        } catch (error) {
            console.error('OCR 처리 중 오류 발생:', error);
        } finally {
            setOcrInProgress(false);
        }
    }
};

const handleFileUploadComplete = async (fileUrl, uuid, region) => {
  console.log('File upload completed:', fileUrl, uuid);
  
  // 유효성 검사 추가
  if (!fileUrl || !uuid) {
      console.error('Invalid fileUrl or uuid:', fileUrl, uuid);
      return;
  }

  setOcrCompleted(false);
  setOcrInProgress(true);
  setValue(0);

  try {
      console.log('pdf_id:', uuid, 'region:', region, 'file_url:', fileUrl);
      const result = await performOCR(fileUrl, uuid);
      console.log('OCR result:', result);
      if (result && result.pdf_id) {
          console.log('pdf id', result.pdf_id);
          setFullText(result.full_text);
          setPdfId(result.pdf_id);
          setLanguage(result.language);
          setDriveFileName(result.pdf_id);
          setDriveSelectedPdf(fileUrl);
          setDrivePdfState({ pdf_id: result.pdf_id, region });
          setOcrCompleted(true);
          
      } else {
          console.error('Invalid OCR result:', result);
      }
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
      console.error('handleDrivePdfSelection 수행')
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
      const result = await performOCR(pdfUrl, pdfId);
      console.log(pdfUrl, pdfId, result);
      setFullText(result.full_text);
      setPdfId(result.pdf_id);
      setLanguage(result.language);
    } catch (error) {
      console.error('OCR 처리 중 오류 발생:', error);
    } finally {
      setOcrInProgress(false);
    }
  };

  const performOCR = async (pdfUrl, pdfId) => {
    try {
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

  useEffect(() => {
    const email = localStorage.getItem('email');
    const refreshToken = localStorage.getItem('refreshToken');

    if (email && refreshToken) {
        const refreshLogin = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/refresh`, 
                  { refreshToken, },
                  { headers: { 'Content-Type': 'application/json' } });

                setAccessToken(response.data.accessToken);
                setEmail(email);

                // API 인스턴스 생성
                createApi(response.data.accessToken, setAccessToken);
            } catch (error) {
                console.error('Failed to refresh token:', error);
                // 로그인이 실패하면 로컬 스토리지에서 정보 삭제
                // localStorage.removeItem('email');
                // localStorage.removeItem('refreshToken');
            }
        };

        refreshLogin();
    }
}, [setAccessToken, setEmail]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header fileName={thumbnailFileName}/>
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
            <SideMenu />
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 5 }}>
            <AccountMenu accessToken={accessToken} />
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
            <Route path="/logout" element={<Grid container spacing={2} sx={{ height: '100%' }}><Grid item xs={12}><Logout /></Grid></Grid>} />
            <Route path="*" element={
              <Grid container sx={{ flexGrow: 1, height: 'calc(100vh - 64px)' }}>
                <Grid className='drive-container' data-label="1-container" item xs={isDriveVisible ? 2.5 : 0.5} padding={isDriveVisible ? 3 : 0}
                  sx={{
                    height: '100%', backgroundColor: '#f9fafb',
                    borderRight: '1px solid #ccc', position: 'relative',
                    transition: '0.5s ease'
                  }}>
                  {isDriveVisible ? (
                    <Routes>
                      <Route path="/drive" element={
                        <Drive
                        setSelectedPdf={setDriveSelectedPdf} // pdfurl을 drive에서 받아옴 
                        setFileName={setDriveFileName}
                        setIsDriveVisible={setIsDriveVisible}
                        handleButtonClick={handleDrivePdfSelection}
                        handlePdfSelection={handleDrivePdfSelection}
                        onFileUpload={handleFileUploadComplete}
                        setThumbnailFileName={setThumbnailFileName} 
                      />} />
                      <Route path="/search" element={
                        <Search
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
                        <ArrowForwardIosOutlinedIcon />
                      </IconButton>
                    </Box>
                  )}
                </Grid>
                <Grid data-label="2-container" item xs={isDriveVisible ? 4 : 4.5} padding={isDriveVisible ? 3 : 1}
                  sx={{
                    height: '100%', borderRight: '1px solid #ccc',
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
                          fullText={fullText}
                          ocrCompleted={ocrCompleted}
                          uploadedFileUrl={pdfUrl}
                          pdfState={location.pathname === "/drive" ? drivePdfState : searchPdfState}
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
                    (() => {
                      console.log('Current uploadFileState:',driveSelectedPdf);

                      return keywordLoading || wikiLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <CircularProgress />
                          <Typography variant="body1" sx={{ ml: 2 }}>{keywordLoading ? '키워드 추출 중...' : '위키 데이터 로딩 중...'}</Typography>
                        </Box>
                      ) : (
                        <Keyword
                          setSelectedPdf={location.pathname === "/drive" ? setDriveSelectedPdf : setSearchSelectedPdf}
                          handleButtonClick={location.pathname === "/drive" ? handleDrivePdfSelection || handleFileUploadComplete : handleSearchPdfSelection}
                          pdfState={location.pathname === "/drive" ? drivePdfState: searchPdfState}
                          setKeywordLoading={setKeywordLoading}
                          setWikiLoading={setWikiLoading}
                        />
                      );
                    })()
                  )}
                  {value === 2 && (driveSelectedPdf || searchSelectedPdf) && (

                    <Summary
                      setSelectedPdf={location.pathname === "/drive" ? setDriveSelectedPdf : setSearchSelectedPdf}
                      handleButtonClick={location.pathname === "/drive" ? handleDrivePdfSelection || handleFileUploadComplete : handleSearchPdfSelection}
                      pdfState={location.pathname === "/drive" ? drivePdfState: searchPdfState}
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
                    <Route path="/drive" element={
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;