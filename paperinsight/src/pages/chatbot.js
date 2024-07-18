import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Button, TextField } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;
function Chatbot() {
  const location = useLocation();
  const pdfId = location.state?.pdfId || ''; // 전달된 pdfId를 가져옴
  const [messages, setMessages] = useState([
    { text: '안녕하세요 무엇을 도와드릴까요?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }};
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSendMessage = async () => {
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    
    // 챗봇 응답 처리
    try {
      console.log(`Sending message to chatbot: ${input}`);
      const response = await fetchChatbotResponse(pdfId, input);
      console.log('Response from chatbot:', response);

      // 응답 데이터 구조에 따라 수정 필요
      const botResponse = response.data.data || '챗봇 응답을 가져오지 못했습니다.';
      setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { text: '챗봇 응답 중 오류가 발생했습니다.', sender: 'bot' }]);
    }
  };
  
  const fetchChatbotResponse = async (pdfId, query) => {
    try {
        console.log(`Making API request with pdfId: ${pdfId}, query: ${query}`);
        const response = await axios.post(
            `${MAIN_FASTAPI}/api/chatbot/useChatbot`, // 엔드포인트 URL 확인
            { pdfId: pdfId, query: query }, // pdfId와 query를 payload로 전송
            { headers: { 'Content-Type': 'application/json' } } // JSON 형식으로 전송
        );
        if (response.status === 200) {
            console.log('useChatbot 요청 성공:', response.data);
            return response; // 응답 반환
        } else {
            console.error('useChatbot 요청 실패:', response.statusText);
        }
    } catch (error) {
        console.error('useChatbot 요청 에러:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  return (
    <Box sx={{ height: '85vh', overflow: 'auto', p: 2 }}>
      <Typography variant="h5">Chatbot</Typography>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
        {messages.map((message, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: message.sender === 'bot' ? '#e0f7fa' : '#fff9c4', // 챗봇과 사용자의 말풍선 색상 설정
              alignSelf: message.sender === 'bot' ? 'flex-start' : 'flex-end'
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: message.sender === 'bot' ? 'bold' : 'normal' }}>
              {message.text}
            </Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
        <Box sx={{ display: 'flex', mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress} // Enter 키 핸들러 추가
            placeholder="메시지를 입력하세요..."
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
            전송
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Chatbot;
