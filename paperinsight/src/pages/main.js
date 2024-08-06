import React, { useState, useRef, useMemo, useCallback, useEffect, useContext } from 'react';
import { Typography, Button, Card, Box, CardMedia, Container, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/system';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Logout from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/authcontext';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import '../styles/main.css';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'white',
  fontFamily: 'inherit',
  color: 'black',
  boxShadow: 'none',  // 그림자 제거
});

const StyledButton = styled(Button)({
  fontFamily: 'inherit',
  margin: '0 5px',
});

const FeatureCard = styled(Card)(({ theme, active }) => ({
  height: active === 'true' ? '1000px' : '100px', // isActive 상태에 따라 높이 변경
  width: active === 'true' ? '1000px' : '400px', // isActive 상태에 따라 너비 변경
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: active === 'true' ? 'transparent' : 'rgba(0, 0, 0, 0.7)', // active 상태에 따라 오버레이 추가
    transition: 'background-color 0.3s ease',
  },
}));


const CardOverlay = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)', 
  padding: '30px',
  color: 'white',
});

const FeatureSwiper = ({ handleFeatureChange, features, onUserInteraction, featureRefs, handleDetailView }) => {
  console.log('handleFeatureChange type:', typeof handleFeatureChange);

  const totalSlides = features.length;
  const initialSlideIndex = Math.floor(totalSlides / 2);

  return (
    <Box sx={{ marginTop: '30px' }}>
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow]}
        spaceBetween={30}
        slidesPerView={'auto'}
        initialSlide={initialSlideIndex}
        centeredSlides={true}
        loop={true}
        effect={'slide'}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        navigation
        style={{ background: 'transparent' }}
      >
        {features.map((feature, index) => (
          <SwiperSlide key={index} style={{ width: 'auto' }}>
            {({ isActive }) => (
              <FeatureCard active={isActive.toString()} style={{ height: isActive ? '500px' : '400px' }}>
                <CardMedia
                  component="img"
                  height="100%"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardOverlay>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontFamily: 'inherit', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontFamily: 'inherit' }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: '30px',
                      right: '30px',
                      border: '1px solid white',
                      backgroundColor: 'transparent',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                      },
                      fontFamily: 'inherit'
                    }}
                    onClick={() => {
                      if (typeof handleFeatureChange === 'function') {
                        handleFeatureChange(feature);
                      }
                      if (typeof handleDetailView === 'function') {
                        handleDetailView(feature);
                      }
                    }}
                  >
                    상세보기
                  </Button>
                </CardOverlay>
              </FeatureCard>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};


const FeatureDetail = ({ feature, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!feature) {
    return null; // 또는 로딩 표시기를 렌더링할 수 있습니다.
  }

  return (
    <Box sx={{ padding: '20px' }}>
      <Button onClick={onBack}>돌아가기</Button>
      <Typography variant="h4" sx={{ mt: 2 }}>{feature.title}</Typography>
      <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>{feature.detail}</Typography>
    </Box>
  );
};
function Main() {

  const navigate = useNavigate();
  // const { setAccessToken, setRefreshToken, setEmail } = useContext(AuthContext);
  const featureRefs = useRef([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const { accessToken, logoutStatus, setLogoutStatus } = useContext(AuthContext);

  const [viewMode, setViewMode] = useState('main'); // 'main' 또는 'detail'
  const [activeFeature, setActiveFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const handleDetailView = (feature) => {
    setSelectedFeature(feature);
    setTimeout(() => setViewMode('detail'), 0);
  };
  const handleBackToMain = () => {
    setViewMode('main');
    setSelectedFeature(null);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };
  useEffect(() => {
    console.log("토큰", accessToken);
  }, [accessToken]);

  
  const features = useMemo(() => [
    {
      title: '드라이브',
      image: '/drive.jpeg',
      techimg: ['/s3.png', '/weaviate.png'],  // 배열로 변경
      description: '학습자료를 업로드하여 스터디 할 수 있어요.',
      detail: '원하는 자료를 업로드 할 수 있습니다. 자료들을 기반으로 챗봇, 키워드, 요약 기능을 활용해보세요. \nPDF뷰어를 지원하여 직접 자료를 분석해볼 수 있습니다.'
    },
    {
      title: '챗봇',
      image: '/chat.jpeg',
      techimg : [''],
      description: '챗봇과 대화할 수 있습니다.',
      detail: '챗봇과 대화하며 학습 내용을 복습하고 새로운 인사이트를 얻어보세요.'
    },
    {
      title: '벡터 검색',
      image: '/search.jpeg',
      description: '원하는 키워드를 검색해보세요.',
      detail: '벡터 검색을 통해서 검색한 쿼리에 대해 유사도가 가장 높은 논문들을 받아보세요.'

    },
    {
      title: '키워드 추출',
      image: '/keyword.jpeg',
      description: '문서에서 중요 키워드를 추출해보세요.',
      detail: '문서에서 중요한 키워드를 자동으로 추출하여 핵심 내용을 빠르게 파악할 수 있습니다. \n 전체 텍스트에서 TextRazor를 통해 중요한 키워드를 추출하여 핵심 파악을 돕습니다.'
    },
    {
      title: '요약 기능',
      image: '/summary.jpeg',
      description: '긴 문서를 요약해보세요.',
      detail: '긴 문서를 간결하게 요약하여 핵심 내용을 쉽게 파악할 수 있습니다. \nHuggingFace와 의미론적 추출을 결합하여 정확하고 간결한 요약을 생성합니다. \n이 기술은 자연어 처리 모델을 활용하여 문서의 주요 개념과 핵심 문장을 식별하고, 의미론적 분석을 통해 문맥을 파악합니다. \n결과적으로 원문의 핵심 메시지를 유지하면서도 불필요한 세부사항을 제거한 간결한 요약을 제공합니다. \n이를 통해 사용자는 긴 문서의 내용을 빠르게 이해하고, 효율적으로 정보를 처리할 수 있습니다.'
    }
  ], [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    featureRefs.current = featureRefs.current.slice(0, features.length);
    const timer = setTimeout(() => setInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, [features]);

  const handleFeatureChange = useCallback((feature) => {
    setActiveFeature(feature);
    if (!initialLoad && userInteracted) {
      const index = features.findIndex(f => f.title === feature.title);
      if (index !== -1 && featureRefs.current[index]) {
        featureRefs.current[index].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, [features, initialLoad, userInteracted]);

  const handleUserInteraction = useCallback(() => {
    setInitialLoad(false);
    setUserInteracted(true);
  }, []);

  // console.log(`api: ${api}`);
  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDriveClick = () => {
    navigate('/drive');
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'black' }}>
      <StyledAppBar position="static" sx={{ background: 'linear-gradient(to bottom, #032859, black)', height: '100px', paddingTop: '15px' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }} >
            <RouterLink to="/">
              <img src="/logo_white.png" alt="Header Logo" style={{ height: '40px' }} />
            </RouterLink>
            <Typography variant="h6" mx={2} noWrap sx={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>PDFast</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center'}} />
          <Box >
          <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF' }}}
          onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange('드라이브'); }
          if (typeof handleDetailView === 'function') { handleDetailView('드라이브'); }}}>Drive</StyledButton>
          <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF' }}} 
          onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange('챗봇'); }
          if (typeof handleDetailView === 'function') { handleDetailView('챗봇'); }}}>Chatbot</StyledButton>          
          <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF' }}} 
          onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange('벡터 검색'); }
          if (typeof handleDetailView === 'function') { handleDetailView('벡터 검색'); }}}>Vector Search</StyledButton>
          <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF' } }} 
          onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange('키워드 추출'); }
          if (typeof handleDetailView === 'function') { handleDetailView('키워드 추출'); }}}>Keyword Extraction</StyledButton>
          <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF' } }} 
          onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange('요약 기능'); }
          if (typeof handleDetailView === 'function') { handleDetailView('요약 기능'); }}}>Summary</StyledButton>
          </Box>        
          <Box sx={{ mx: 2, }} /> {/* 여백 추가 */}
          <Box>
          {accessToken && logoutStatus !== 204 ? (
            <StyledButton color="inherit" component={Link} to="/logout" sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#03318C' } }}>Logout</StyledButton>
          ) : (
            <StyledButton color="inherit" onClick={handleLoginClick} sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#03318C' } }}>Login</StyledButton>
          )}
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '5px 20px', '&:hover': { backgroundColor: '#03318C' } }} onClick={() => navigate('/register')}>Signup</StyledButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Container maxWidth="100%" style={{ flex: 1, overflow: 'hidden', position: 'relative', maxHeight: '100vh' }}>
          <Box
            sx={{
              height: '100%',
              transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
              transform: viewMode === 'main' ? 'translateY(0)' : 'translateY(-100%)',
              opacity: viewMode === 'main' ? 1 : 0,
              position: 'absolute',
              width: '100%',
            }}
          >
            <FeatureSwiper
              handleFeatureChange={handleFeatureChange}
              features={features}
              onUserInteraction={handleUserInteraction}
              featureRefs={featureRefs}
              handleDetailView={handleDetailView}
            />
          </Box>
          <Box
            sx={{
              height: '100%',
              transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
              transform: viewMode === 'detail' ? 'translateY(0)' : 'translateY(100%)',
              opacity: viewMode === 'detail' ? 1 : 0,
              position: 'absolute',
              width: '100%',
              overflow: 'auto',
            }}
          >
            {selectedFeature && <FeatureDetail feature={selectedFeature} onBack={handleBackToMain} />}
          </Box>
          
        </Container>
        <Typography style={{ textAlign: 'left',  color: '#fff', fontSize: '40px', marginLeft: '50px' }}>PDF Learning Solution: Sinizzu</Typography>
      <Box sx={{ marginLeft: '50px',  padding: '15px 0px' }}>
        <Box component="hr" sx={{ border: '1px solid #737373', width: '30%', float: 'left' }} />
      </Box>
      <Typography style={{ textAlign: 'left',  color: '#737373', fontSize: '18px', marginLeft: '50px', marginBottom: '80px', }}>사전학습 기능으로 사용자에게 최상의 서비스를 제공해드립니다.</Typography>
    </div>
  );
}


export default Main;
