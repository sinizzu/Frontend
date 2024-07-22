import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Button, TextField, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import '../styles/main.css';

const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

const ChatBubble = ({ message, isUser }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      mb: 1,
    }}
  >
    {!isUser && (
      <Avatar sx={{ mr: 1, bgcolor: '#4677F0' }}>
        <SmartToyIcon />
      </Avatar>
    )}
    <Paper
      elevation={1}
      sx={{
        p: 2,
        maxWidth: '80%',
        borderRadius: isUser ? '20px 20px 0 20px' : '20px 20px 20px 0',
        backgroundColor: isUser ? '#4677F0' :  '#E8E8E8',
        color: isUser ? 'white' : 'black',
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.9rem'}}>{message}</Typography>
    </Paper>
    {isUser && <Avatar sx={{ ml: 1 }}>U</Avatar>}
  </Box>
);

function Chatbot({ pdfId, fullText, ocrCompleted, fileName, pdfState, language}) {
  
  const location = useLocation();
  const [messages, setMessages] = useState([
    { text: '본문과 관련된 내용 분석을 도와드릴게요😄', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (ocrCompleted && fullText && pdfId) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: '분석이 완료되었습니다. 질문해 주세요!', sender: 'bot' }
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
      const request = await axios.post(`${SubFastAPI}/api/translate/transelateToEnglish`,
        { text: input },
        { headers: { 'Content-Type': 'application/json' } }
      )
      console.log(`Sending message to chatbot: ${request.data.data}`);
      // input = request.data.data;
      const response = await fetchChatbotResponse(pdfId, request.data.data);
      console.log('Response from chatbot:', response);

      const botResponse = response.data.data || '챗봇 응답을 가져오지 못했습니다.';
      setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { text: '챗봇 응답 중 오류가 발생했습니다.', sender: 'bot' }]);
    }
  };
  
  const fetchChatbotResponse = async (pdfId, query, language) => {
    try {
      console.log(`Making API request with pdfId: ${pdfId}, query: ${query}, language: ${language}`);
      const response = await axios.post(
        `${MAIN_FASTAPI}/api/chatbot/useChatbot`,
        { pdfId: pdfId, query: query, language: language },
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
    <Box className='drive-container' sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box className='drive-container' sx={{ height: '100%',flexGrow: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            message={message.text}
            isUser={message.sender === 'user'}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', mt: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={!ocrCompleted}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: '45px', // 세로 길이 조정
            },
            '& .MuiOutlinedInput-input': {
              padding: '10px 14px', // 내부 패딩 조정
            }
          }}
        />
        <Button 
          variant="contained"
          onClick={handleSendMessage} 
          sx={{ 
            ml: 1,
            backgroundColor: '#4677F0',
            borderRadius: '20px',
            height: '45px', // 세로 길이 조정
            minWidth: '60px', // 최소 너비 설정
            padding: '0 16px', // 좌우 패딩 추가
            whiteSpace: 'nowrap', // 텍스트가 한 줄로 유지되도록 설정
            '&:hover': {
              backgroundColor: '#3a63c8'
            }
          }}
          disabled={!ocrCompleted}
        >
          전송
        </Button>
      </Box>
    </Box>
  );
}

export default Chatbot;