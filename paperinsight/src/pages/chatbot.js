import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Button, TextField, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import '../styles/main.css';
import api from '../services/api.js';

const MainFastAPI = process.env.REACT_APP_MainFastAPI;

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
        backgroundColor: isUser ? '#4677F0' : '#E8E8E8',
        color: isUser ? 'white' : 'black',
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{message}</Typography>
    </Paper>
    {isUser && <Avatar sx={{ ml: 1 }}>U</Avatar>}
  </Box>
);

function Chatbot({ pdfId, fullText, ocrCompleted, uploadedFileUrl, uploadedFileId, language }) {

  const location = useLocation();

  // 채팅 메시지들을 저장하는 상태
  const [messages, setMessages] = useState([
    { text: '본문과 관련된 내용 분석을 도와드릴게요😄', sender: 'bot' }
  ]);

  // 사용자 입력을 저장하는 상태
  const [input, setInput] = useState('');

  // 메시지
  const messagesEndRef = useRef(null);

  // OCR 완료 시 메시지 추가
  useEffect(() => {
    if (ocrCompleted && fullText && pdfId) {
      // 이전 상태를 기반으로 새 상태를 만드는 것, 상태 업데이트가 비동기적으로 일어날 때 안전하게 처리
      setMessages(prevMessages => [
        ...prevMessages,
        { text: '분석이 완료되었습니다. 질문해 주세요!', sender: 'bot' }
      ]);
    }
  }, [ocrCompleted, fullText, pdfId]); // 이배열에 있는 값들 중 하나라도 변경되면 useEffect 내부의 코드가 실행됨


  // FileUpload 시 메시지 추가
  useEffect(() => {
    if (uploadedFileUrl && uploadedFileId) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: '파일이 업로드 되었습니다. 질문해 주세요!', sender: 'bot' }
      ]);
    }
  }, [uploadedFileUrl, uploadedFileId]);


  // 텍스트를 기반으로 새 메시지 추가
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };


  // input 텍스트를 기반으로 이벤트 타겟 값 변경
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };


  // 응답 메시지 핸들링
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: 'client' }];
    setMessages(newMessages);
    setInput('');

    try {
      // 한국어로 전송된 쿼리를 영어로 변경
      const request = await axios.post(`${MainFastAPI}/api/translate/transelateToEnglish`,
        { text: input },
        { headers: { 'Content-Type': 'application/json' } }
      )
      console.log(`Sending message to chatbot: ${request.data.data}`);

      // 챗봇 응답값 반환
      const response = await fetchChatbotResponse(pdfId, request.data.data, language);
      console.log('Response from chatbot:', response);

      const botResponse = response.data.data || '챗봇 응답을 가져오지 못했습니다.';
      setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: 'bot' }]);

      const email = localStorage.getItem('email');
      // 비동기로 saveChat API 호출
      saveChatHistory(pdfId, input, 'client', email); // 사용자 메시지 저장
      saveChatHistory(pdfId, botResponse, 'bot', email); // 챗봇 응답 저장


    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { text: '챗봇 응답 중 오류가 발생했습니다.', sender: 'bot' }]);
    }
  };

  const fetchChatbotResponse = async (pdfId, query, language) => {
    try {

      const usePdfId = uploadedFileId || pdfId;
      console.log(`Making API request with pdfId: ${usePdfId}, query: ${query}`);
      const response = await axios.post(
        `${MainFastAPI}/api/chatbot/useChatbot`,
        { pdfId: usePdfId, query: query, language: language },
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


  // 챗봇 이력 저장 (비동기 방식)
  const saveChatHistory = (uuid, message, sender, email) => {
    return api.post(
      `/api/auth/saveChat`,
      { uuid, message, sender, email },
      {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    )
      .then(response => {
        console.log('Chat history saved successfully');
        console.log('Server response:', response.data.data); // 서버 응답 출력
        return response.data.data; // 필요한 경우 응답 데이터 반환
      })
      .catch((error) => {
        console.error('Error saving chat history:', error);
        throw error; // 에러를 다시 던져서 호출자가 처리할 수 있게 함
      });
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box className='drive-container' sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box className='drive-container' sx={{ height: '100%', flexGrow: 1, overflow: 'auto', mb: 2 }}>
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