import React from 'react';
import { Typography, Button, Card, Box, CardMedia, Container, AppBar, Toolbar, Link } from '@mui/material';
import { styled } from '@mui/system';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'white',
  color: 'black',
});


const StyledButton = styled(Button)({
  margin: '0 5px',
});


const FeatureCard = styled(Card)(({ isActive }) => ({
    height: isActive ? '300px' : '250px',
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
  

  function FeatureSwiper() {
    const navigate = useNavigate();
    const features = [
      { title: '드라이브', image: '/study.jpg', link:'/drive', description: '설명 텍스트...'},
      { title: '벡터 검색', image: '/search.jpg', link:'/search', description: '벡터 검색을 통해서 검색한 쿼리에 대한 유사도가 가장 높은 논문들을 찾아보세요.' },
      { title: '챗봇', image: '/chat.jpg', description: '설명 텍스트...' },
    ];

    const handleButtonClick = (link) => {
      navigate(link);
    }
  
    return (
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow]}
        spaceBetween={10}
        slidesPerView={3}
        initialSlide={2}
        centeredSlides={true}
        loop={true}
        effect={'coverflow'}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        navigation
      >
        {features.map((feature, index) => (
          <SwiperSlide key={index}>
            {({ isActive }) => (
            // 중앙에 위치하고 사용자에게 주요하게 보이는 상태
              <FeatureCard isActive={isActive}> 
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
                    onClick={()=>handleButtonClick(feature.link)}>기능 시작하기 </Button>
                </CardOverlay>
              </FeatureCard>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
function Main() {
  return (
    <div>
      <StyledAppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }} >
          <Link to="/">
          <img src="/header.png" alt="Header Logo" style={{ height: '40px' }} /></Link>
          <Typography variant="h6" mx={2} noWrap sx={{ color: 'black', fontWeight: 'bold' }}>PaperInsight</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} /> 
        <Box>
          <StyledButton color="inherit">백터 검색</StyledButton>
          <StyledButton color="inherit">챗봇사용</StyledButton>
          <StyledButton color="inherit">학습하기</StyledButton>
          <StyledButton variant="outlined" color="inherit">Login</StyledButton>
          <StyledButton variant="contained" sx ={{backgroundColor: 'black', color: 'white'}}>Signup</StyledButton>
        </Box>
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth="lg" style={{ marginTop: '40px' }}>
        <FeatureSwiper />
        <Typography variant="h4" style={{ marginTop: '40px', marginBottom: '20px' }}>
          벡터 검색
        </Typography>
        <Typography variant="body1">
          벡터 검색을 통해서 검색한 쿼리에 대한 유사도가 가장 높은 논문들을 찾아보세요.
        </Typography>
      </Container>
    </div>
  );
}

export default Main;