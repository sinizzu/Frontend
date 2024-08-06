import React, { useState, useRef, useMemo, useCallback, useEffect, useContext } from 'react';
import { Typography, Button, Card, Box, CardMedia, Container, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/system';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/authcontext';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import '../styles/main.css';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'white',
  fontFamily: 'inherit',
  color: 'black',
  boxShadow: 'none',
});

const StyledButton = styled(Button)({
  fontFamily: 'inherit',
  margin: '0 5px',
});

const FeatureCard = styled(Card)(({ theme, active }) => ({
  height: active === 'true' ? '40vh' : 'auto',
  width: active === 'true' ? '50vw' : '35vw',
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
    backgroundColor: active === 'true' ? 'transparent' : 'rgba(0, 0, 0, 0.7)',
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

  const totalSlides = features.length;
  const initialSlideIndex = Math.floor(totalSlides / 2);

  return (
    <Box sx={{ marginTop: '30px' }}>
      <Swiper
        modules={[Pagination, EffectCoverflow]}
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
        navigation={false}
      >
        {features.map((feature, index) => (
          <SwiperSlide key={index} style={{ width: 'auto',}}>
            {({ isActive }) => (
              <FeatureCard active={isActive.toString()} style={{ height: isActive ? '50vh' : '40vh', }}>
                <CardMedia
                  component="img"
                  height="100%"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardOverlay>
                  <Typography component="div" sx={{ fontSize: isActive ? '3rem': '1.5rem', fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ fontSize: isActive ? '1.5rem': '1rem' }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      width: isActive ? '9vw' : '5vw',
                      position: 'absolute',
                      bottom: '30px',
                      right: '40px',
                      border: '1px solid white',
                      backgroundColor: 'transparent',
                      color: 'white',
                      fontSize: isActive ? '1.5rem' : '1.2rem',
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
                    More
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
    return null;
  }

  return (
    <Box sx={{ padding: '1.5vw 5vw' }}>
      <Button onClick={onBack} sx={{ fontSize: '25px', fontWeight: 'bold', color: '#4677F0' }}>{'< Back'}</Button>
      <Box sx={{display: 'flex', justifyContent: 'space-between', m: '0 5%', gap: '3%'}}> 
      <Box sx={{ flex: 1, marginTop: '5%' }}>
      <Typography variant="h3" sx={{ color: '#4677F0', fontWeight: 'bold' }} mb={1}>{feature.title}</Typography>
      <Box component="hr" sx={{ border: '2px solid #4677F0', width: '5%', float: 'left' }} />
      <Typography sx={{ mt: 5, color: '#000', fontSize: '22px',  whiteSpace: 'pre-line'}}>{feature.detail}</Typography>
      </Box>
      <video
      autoPlay
      loop
      muted
      style={{ flex: 1,width: '50%', height: 'auto', pointerEvents: 'none', borderRadius: '30px', boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.3)'
        , marginTop: '6%', marginRight: '2%'
       }}
      >
      <source src={feature.video} type="video/mp4" />
      </video>
      </Box>
    </Box>
  );
};

function Main() {
  const navigate = useNavigate();
  const featureRefs = useRef([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const { accessToken, logoutStatus, setLogoutStatus } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('main');
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
  }, [accessToken]);

  const features = useMemo(() => [
    {
      title: 'Drive',
      image: '/drive.jpg',
      video: 'video/drive.mp4',
      techimg: ['/s3.png', '/weaviate.png'],
      description: '학습자료를 업로드하여 스터디 할 수 있어요.',
      detail: '여러분이 원하는 자료를 업로드할 수 있습니다. \n \
      자료들을 바탕으로 챗봇, 키워드, 요약 기능을 활용해보세요. \n \
      PDF 뷰어를 지원하여 직접 자료를 분석할 수 있습니다. \n \
      업로드된 자료를 통해 인사이트를 도출하고, \n \
      필요한 정보를 쉽게 추출할 수 있습니다. \n \
      여러분의 작업을 도와줄 다양한 도구를 제공하며, \n \
      데이터의 효율적인 관리와 분석을 돕습니다. \n \
      다양한 기능을 사용해 더욱 깊이 있는 자료 분석을 경험해보세요.'
    },
    {
      title: 'ChatBot',
      image: '/chat.jpg',
      video: 'video/drive.mp4',
      techimg: [''],
      description: '챗봇과 대화할 수 있습니다.',
      detail: '사용자가 선택한 PDF 파일을 업로드하면,\n \
      OCR 처리를 통해 텍스트를 추출하여 데이터베이스에 저장합니다. \n \
      챗봇은 RAG 방법론을 사용해 \n \
      사용자가 제공한 질문과 관련된 내용을 데이터베이스에서 찾아, \n \
      이를 사전학습된 언어모델(GPT-3 Turbo)과 결합하여 답변을 제공합니다. \n \
      이를 통해 더욱 정확하고 유용한 정보를 제공받을 수 있습니다.'
    },
    {
      title: 'Vector Search',
      image: '/search.jpg',
      video: 'video/drive.mp4',
      description: '원하는 키워드를 검색해보세요.',
      detail: '사용자가 키워드 또는 문장을 입력하면, \n \
      키워드 또는 문장을 Weaviate로 논문 기반 벡터 검색을 수행합니다. \n \
      Weaviate는 입력된 텍스트를 벡터로 변환하여 \n \
      고차원 벡터 공간에서 유사한 벡터를 가진 문서를 검색하고, \n 관련성 높은 결과를 반환합니다. \n \
      사용자가 찾고자 하는 정보를 정확하고 신속하게 제공하여, \n \
      연구자와 학습자가 필요한 논문을 쉽게 찾을 수 있도록 지원합니다.'
    },
    {
      title: 'Keyword Extraction',
      image: '/keyword.jpg',
      video: 'video/drive.mp4',
      description: '문서에서 중요 키워드를 추출해보세요.',
      detail: '업로드한 PDF 문서의 텍스트를 분석합니다. \n \
      Text Razor는 자연어 처리(NLP) 기술을 활용하여 \n \
      텍스트를 정밀하게 분석하고, 문서에서 의미 있는 단어와 구를 추출합니다. \n \
      이를 통해 문서의 주요 내용을 효과적으로 파악할 수 있으며, \n \
      중요한 정보와 키워드를 쉽게 식별할 수 있습니다. \n \
      이 과정은 문서의 깊이 있는 이해를 돕고, 기본적인 데이터를 제공합니다. \n \
      Text Razor의 강력한 NLP 기능를 통해, 효율적으로 분석할 수 있습니다.'
    },
    {
      title: 'Summary',
      image: '/summary.jpg',
      video: 'video/drive.mp4',
      description: '긴 문서를 요약해보세요.',
      detail: '긴 문서를 간결하게 요약하여 핵심 내용을 쉽게 파악할 수 있습니다. \n \
      HuggingFace와 의미론적 추출을 결합하여 정확하고 간결한 요약을 생성합니다. \n \
      이 기술은 자연어 처리 모델을 활용하여 문서의 주요 개념과 핵심 문장을 식별하고, 의미론적 분석을 통해 문맥을 파악합니다. \n \
      그 결과 원문의 핵심 메시지를 유지하면서도 불필요한 세부사항을 제거한 간결한 요약을 제공합니다. \n \
      이 기능을 통해 사용자는 긴 문서의 내용을 빠르게 이해하고, \n효율적으로 정보를 처리할 수 있습니다.'
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
    console.log(feature);
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

  const handleLoginClick = () => {
    navigate('/login');
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white', overflowY: 'auto', scrollBehavior: 'smooth' }}>
      <StyledAppBar position="static" sx={{ background: 'white', height: '10%', paddingTop: '15px' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', margin: '0px 20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }} >
            <RouterLink to="/">
              <img src="/header.png" alt="Header Logo" style={{ height: '40px' }} />
            </RouterLink>
            <Typography variant="h6" mx={2} noWrap sx={{ fontSize: '25px', color: '#376FFF', fontWeight: 'bold' }}>PDFast</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center'}} />
          <Box >
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white'  }}}
              onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange(features[0]); }
              if (typeof handleDetailView === 'function') { handleDetailView(features[0]); }}}>Drive</StyledButton>
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white' }}} 
              onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange(features[1]); }
              if (typeof handleDetailView === 'function') { handleDetailView(features[1]); }}}>Chatbot</StyledButton>          
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white'  }}} 
              onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange(features[2]); }
              if (typeof handleDetailView === 'function') { handleDetailView(features[2]); }}}>Vector Search</StyledButton>
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white'  } }} 
              onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange(features[3]); }
              if (typeof handleDetailView === 'function') { handleDetailView(features[3]); }}}>Keyword Extraction</StyledButton>
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white'  } }} 
              onClick={() => { if (typeof handleFeatureChange === 'function') { handleFeatureChange(features[4]); }
              if (typeof handleDetailView === 'function') { handleDetailView(features[4]); }}}>Summary</StyledButton>
          </Box>        
          <Box sx={{ mx: 2, }} /> {/* 여백 추가 */}
          <Box>
          {accessToken && logoutStatus !== 204 ? (
            <StyledButton color="inherit" component={Link} to="/logout" sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white'  } }}>Logout</StyledButton>
          ) : (
            <StyledButton color="inherit" onClick={handleLoginClick} sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white'  } }}>Login</StyledButton>
          )}
            <StyledButton sx={{ fontSize: '18px', fontWeight: 'bold', color: 'black', padding: '5px 20px', '&:hover': { backgroundColor: '#0455BF', color: 'white' } }} onClick={() => navigate('/register')}>Signup</StyledButton>
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
            width: '96%',
          }}
        >
          <FeatureSwiper
            handleFeatureChange={handleFeatureChange}
            features={features}
            onUserInteraction={handleUserInteraction}
            featureRefs={featureRefs}
            handleDetailView={handleDetailView}
          />
          <Box sx={{ marginTop: '3vw' }}>
            <Typography style={{ textAlign: 'left',  color: 'black', fontSize: '2.5em', marginLeft: '50px', fontWeight: 'bold' }}>PDF Learning Solution</Typography>
            <Typography style={{ textAlign: 'left',  color: 'black', fontSize: '2.5em', marginLeft: '50px', fontWeight: 'bold' }}>Analyze Documents Efficiently</Typography>
            <Box sx={{ marginLeft: '50px',  padding: '0px' }}>
              <Box component="hr" sx={{ border: '1px solid #737373', width: '30%', float: 'left' }} />
            </Box>
            <Typography style={{ textAlign: 'left',  width: '43%',  color: '#737373', fontSize: '1.1em', marginLeft: '50px', marginTop: '30px' }}>
              사전학습 기능을 통해 사용자에게 최상의 서비스를 제공합니다. 이를 통해 더 정확하고 개인화된 응답을 받을 수 있습니다.
              사용자의 요구를 깊이 이해하고, 최적의 해결책을 제안합니다. </Typography>
          </Box>
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
      <Box sx={{ width: '100%', position: 'absolute', bottom: 0, textAlign: 'center', backgroundColor: '#fff', color: '#000', padding: '10px 0' }}>Copyright © 2022 Sinizzu. All rights reserved.</Box>
    </div>
  );
}

export default Main;
