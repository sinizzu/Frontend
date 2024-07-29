import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Typography, Button, Card, Box, CardMedia, Container, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/system';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

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
  height: active === 'true' ? '300px' : '250px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '20px',
  transition: 'all 0.3s ease'
}));

const CardOverlay = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  padding: '30px',
  color: 'white',
});

const expandedBoxStyle = {
  maxHeight: '300px',
  transition: 'max-height 0.3s ease-in-out, background-color 0.3s ease',
  overflow: 'hidden',
};

const collapsedBoxStyle = {
  maxHeight: '100px',
  transition: 'max-height 0.3s ease-in-out, background-color 0.3s ease',
  overflow: 'hidden',
};

const FeatureSwiper = ({ setActiveFeature, features, onUserInteraction, featureRefs }) => {
  const [swiper, setSwiper] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // const handleSlideChange = useCallback((swiper) => {
  //   if (userInteracted) {
  //     onUserInteraction();
  //     if (swiper && typeof swiper.realIndex === 'number' && features[swiper.realIndex]) {
  //       setActiveFeature(features[swiper.realIndex]);
  //     }
  //   }
  // }, [features, setActiveFeature, onUserInteraction, userInteracted]);

  // const handleSwiper = (swiper) => {
  //   setSwiper(swiper);
  // };

  // const handleSlideChangeTransitionStart = () => {
  //   if (!userInteracted) {
  //     setUserInteracted(true);
  //     onUserInteraction();
  //   }
  // };

const totalSlides = features.length; // features 배열의 길이
const initialSlideIndex = Math.floor(totalSlides / 2);

  return (

    <Swiper
      modules={[Navigation, Pagination, EffectCoverflow]}
      spaceBetween={30} // 슬라이드 간 간격을 100px로 조정
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
      style={{ background: 'transparent' }}
      // onSwiper={handleSwiper}
      // onSlideChange={handleSlideChange}
      // onSlideChangeTransitionStart={handleSlideChangeTransitionStart}
    >
      {features.map((feature, index) => (
        <SwiperSlide key={index}>
          {({ isActive }) => (
            <FeatureCard active={isActive.toString()} style={{ width: '450px', height: '280px' }}>
              <CardMedia
                component="img"
                height="100%"
                image={feature.image}
                alt={feature.title}
              />
              <CardOverlay>
                <Typography gutterBottom variant="h6" component="div"sx={{ fontFamily: 'inherit',fontSize: '1.1rem'}} >
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontFamily: 'inherit' }}>
                  {feature.description}
                </Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  style={{ 
                    position: 'absolute',
                    bottom: '30px',
                    right: '30px',
                    backgroundColor: 'white', 
                    color: 'black', 
                    fontWeight: 'bold',
                    fontFamily: 'inherit'
                  }}
                  onClick={() => {
                    setActiveFeature(feature);
                    // onUserInteraction();
                    if (featureRefs.current[index]) {
                      featureRefs.current[index].scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }
                  }}>
                  상세보기
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
  const featureRefs = useRef([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  const features = useMemo(() => [
    { 
      title: '드라이브', 
      image: '/drive.jpeg', 
      techimg: ['/s3.png', '/mongo.png'],  // 배열로 변경
      description: '학습자료를 업로드하여 스터디 할 수 있어요.', 
      detail: '원하는 자료를 업로드 할 수 있습니다. 자료들을 기반으로 챗봇, 키워드, 요약 기능을 활용해보세요. \nPDF뷰어를 지원하여 직접 자료를 분석해볼 수 있습니다.'
    },
    { 
      title: '챗봇', 
      image: '/chat.jpeg', 
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
    },
    { 
      title: 'PDF 뷰어', 
      image: '/pdf.jpg', 
      description: '직접 업로드 한 PDF자료를 볼 수 있습니다.', 
      detail: '사용자는 텍스트, 구문 등을 드래그하여 검색할 수 있습니다. 검색 내용은 툴팁 형식으로 페이지 안에서 곧바로 확인할 수 있으며, 이는 사용자가 원하는 정보를 직관적으로 파악하여 학습 효율을 높일 수 있습니다.'
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

  return (
    <div>

      <StyledAppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }} >
            <RouterLink to="/">
              <img src="/header.png" alt="Header Logo" style={{ height: '40px' }} />
            </RouterLink>
            <Typography variant="h6" mx={2} noWrap sx={{ fontSize:'25px',color: 'black', fontWeight: 'bold' }}>PaperInsight</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} /> 
          <Box>
            <StyledButton color="inherit" onClick={() => navigate('/search')} sx={{fontSize:'15px',fontWeight: 'bold'}}>벡터 검색</StyledButton>
            <StyledButton color="inherit" onClick={() => navigate('/drive')} sx={{fontSize:'15px',fontWeight: 'bold'}}>학습하기</StyledButton>
          </Box>
          <Box sx={{ mx: 2 }} /> {/* 여백 추가 */}
          <Box>
            <StyledButton variant="outlined" color="inherit" onClick={() => navigate('/login')}>Login</StyledButton>
            <StyledButton variant="contained" sx={{backgroundColor: 'black', color: 'white'}} onClick={() => navigate('/signup')}>Signup</StyledButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth="xl" style={{ marginTop: '40px' }}>
      <Box sx={{ 
        height: '400px', 
        mb: 4, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width:'100%'
      }}>
        <div style={{
          width: '100%',
          height: '400px',  // 스와이퍼의 높이를 지정합니다. 필요에 따라 조절하세요.
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FeatureSwiper 
            setActiveFeature={handleFeatureChange} 
            features={features}
            onUserInteraction={handleUserInteraction} 
            featureRefs={featureRefs}
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
              '&:hover': { backgroundColor: '#f5f5f5' },
              ...(activeFeature?.title === feature.title ? expandedBoxStyle : collapsedBoxStyle),
            }}
            onClick={() => {
              handleUserInteraction();
              handleFeatureChange(feature);
            }}
          >
            <Typography variant="h6" sx={{fontFamily: 'inherit'}}>{feature.title}</Typography>
            {activeFeature?.title !== feature.title && (
            <Typography variant="h6" sx={{fontSize:'14px', marginBottom:'20px',fontFamily: 'inherit'}}>
              {feature.description}
            </Typography>
          )}
            <Box mt='2' sx={{ opacity: activeFeature?.title === feature.title ? 1 : 0, transition: 'opacity 0.3s ease', marginTop:'20px' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '10px', // 이미지 사이의 간격
              }}
            >
            {feature.techimg && feature.techimg.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`${feature.title} 기술 이미지 ${index + 1}`}
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain'
                }}
              />
            ))}
            </Box>
              <Typography variant="body1"
                          sx={{ whiteSpace: 'pre-line', fontSize:'15px', fontStyle:'a', fontFamily: 'inherit'}} >{feature.detail}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      </Container>
    </div>
  );
}

export default Main;
