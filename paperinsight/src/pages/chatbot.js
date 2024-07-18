import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Button, TextField } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

function Chatbot({ pdfId, fullText, ocrCompleted, fileName }) {
  const location = useLocation();
  const [messages, setMessages] = useState([
    { text: '안녕하세요 무엇을 도와드릴까요?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (ocrCompleted && fullText && pdfId) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'OCR 처리가 완료되었습니다. 질문해 주세요!', sender: 'bot' }
      ]);
    }
  }, [ocrCompleted, fullText, pdfId]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    
    try {
      console.log(`Sending message to chatbot: ${input}`);
      const response = await fetchChatbotResponse(pdfId, input);
      console.log('Response from chatbot:', response);

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
        `${MAIN_FASTAPI}/api/chatbot/useChatbot`,
        { pdfId: pdfId, query: query },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        console.log('useChatbot 요청 성공:', response.data);
        return response;
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
              backgroundColor: message.sender === 'bot' ? '#e0f7fa' : '#fff9c4',
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
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={!ocrCompleted}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSendMessage} 
            sx={{ ml: 2 }}
            disabled={!ocrCompleted}
          >
            전송
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Chatbot;