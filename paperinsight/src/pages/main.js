import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Typography, Button, Card, Box, CardMedia, Container, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/system';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthProvider } from '../contexts/authcontext';


// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import '../styles/main.css';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'white',
  color: 'black',
  boxShadow: 'none',  // 그림자 제거
});

const StyledButton = styled(Button)({
  margin: '0 5px',
});

const FeatureCard = styled(Card)(({ theme, active }) => ({
  height: active === 'true' ? '300px' : '250px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
}));

const CardOverlay = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '20px',
  color: 'white',
});

const FeatureSwiper = ({ setActiveFeature, features, onUserInteraction }) => {
  const [swiper, setSwiper] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  const handleSlideChange = useCallback((swiper) => {
    if (userInteracted) {
      onUserInteraction();
      if (swiper && typeof swiper.realIndex === 'number' && features[swiper.realIndex]) {
        setActiveFeature(features[swiper.realIndex]);
      }
    }
  }, [features, setActiveFeature, onUserInteraction, userInteracted]);

  const handleSwiper = (swiper) => {
    setSwiper(swiper);
  };

  const handleSlideChangeTransitionStart = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      onUserInteraction();
    }
  };

  const totalSlides = features.length; // features 배열의 길이
  const initialSlideIndex = Math.floor(totalSlides / 2);

  return (

    <Swiper
      modules={[Navigation, Pagination, EffectCoverflow]}
      spaceBetween={300} // 슬라이드 간 간격을 50px로 조정
      slidesPerView={3} // 'auto'로 설정하여 각 슬라이드의 너비에 따라 표시
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
      onSwiper={handleSwiper}
      onSlideChange={handleSlideChange}
      onSlideChangeTransitionStart={handleSlideChangeTransitionStart}
    >
      {features.map((feature, index) => (
        <SwiperSlide key={index}>
          {({ isActive }) => (
            <FeatureCard active={isActive.toString()} style={{ width: '420px', height: '230px' }}>
              <CardMedia
                component="img"
                height="100%"
                image={feature.image}
                alt={feature.title}
              />
              <CardOverlay>
                <Typography gutterBottom variant="h6" component="div">
                  {feature.title}
                </Typography>
                <Typography variant="body2">
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ marginTop: '10px' }}
                  onClick={() => feature.onClick && feature.onClick()}>
                  기능 시작하기
                </Button>
              </CardOverlay>
            </FeatureCard>
          )}
        </SwiperSlide>
      ))}
    </Swiper>

  );
};

function Main() {
  const navigate = useNavigate();
  // const { setAccessToken, setRefreshToken, setEmail } = useContext(AuthContext);
  const featureRefs = useRef([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  const features = useMemo(() => [
    {
      title: '드라이브',
      image: '/drive.jpeg',
      description: '학습자료를 업로드하여 스터디 할 수 있어요.',
      detail: '원하는 자료를 업로드 할 수 있습니다. 자료들을 기반으로 챗봇, 키워드, 요약 기능을 활용해보세요. PDF뷰어를 지원하여 직접 자료를 분석해볼 수 있습니다.',
      onClick: () => navigate('/drive')
    },
    {
      title: '챗봇',
      image: '/chat.jpeg',
      description: '챗봇과 대화할 수 있습니다.',
      detail: '챗봇과 대화하며 학습 내용을 복습하고 새로운 인사이트를 얻어보세요.',
      onClick: () => navigate('/chatbot')
    },
    {
      title: '벡터 검색',
      image: '/search.jpeg',
      description: '원하는 키워드를 검색해보세요.',
      detail: '벡터 검색을 통해서 검색한 쿼리에 대해 유사도가 가장 높은 논문들을 받아보세요.',
      onClick: () => navigate('/search')
    },
    {
      title: '키워드 추출',
      image: '/keyword.jpeg',
      description: '문서에서 중요 키워드를 추출해보세요.',
      detail: '문서에서 중요한 키워드를 자동으로 추출하여 핵심 내용을 빠르게 파악할 수 있습니다.',
      onClick: () => navigate('/keyword')
    },
    {
      title: '요약 기능',
      image: '/summary.jpeg',
      description: '긴 문서를 요약해보세요.',
      detail: '긴 문서를 간결하게 요약하여 핵심 내용을 쉽게 파악할 수 있습니다.',
      onClick: () => navigate('/summary')
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

  return (
    <div>
      <StyledAppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }} >
            <RouterLink to="/">
              <img src="/header.png" alt="Header Logo" style={{ height: '40px' }} />
            </RouterLink>
            <Typography variant="h6" mx={2} noWrap sx={{ color: 'black', fontWeight: 'bold' }}>PaperInsight</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <StyledButton color="inherit" onClick={() => navigate('/search')} sx={{ fontWeight: 'bold' }}>벡터 검색</StyledButton>
            <StyledButton color="inherit" onClick={handleDriveClick} sx={{ fontWeight: 'bold' }}>학습하기</StyledButton>
            <StyledButton variant="outlined" color="inherit" onClick={handleLoginClick}>Login</StyledButton>
            <StyledButton variant="contained" sx={{ backgroundColor: 'black', color: 'white' }} onClick={() => navigate('/signup')}>Signup</StyledButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth="lg" style={{ marginTop: '40px' }}>
        <Box sx={{
          height: '400px',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '300px',  // 스와이퍼의 높이를 지정합니다. 필요에 따라 조절하세요.
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FeatureSwiper
              setActiveFeature={handleFeatureChange}
              features={features}
              onUserInteraction={handleUserInteraction}
            />
          </div>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
          {features.map((feature, index) => (
            <Box
              key={index}
              ref={el => featureRefs.current[index] = el}
              sx={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                p: 2,
                mb: 2,
                cursor: 'pointer',
                backgroundColor: activeFeature?.title === feature.title ? '#f0f0f0' : 'transparent',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
              onClick={() => {
                handleUserInteraction();
                handleFeatureChange(feature);
              }}
            >
              <Typography variant="h6">{feature.title}</Typography>
              <Typography variant="body2">{feature.description}</Typography>
              {activeFeature?.title === feature.title && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">{feature.detail}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </div>
  );
}

export default Main;
