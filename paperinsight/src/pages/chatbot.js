import React, { useState, useEffect, useRef, useContext } from 'react';
import { Container, Paper, Typography, Box, Button, TextField, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import '../styles/main.css';
import { AuthContext } from '../contexts/authcontext';



const MainFastAPI = process.env.REACT_APP_MainFastAPI;

const ExampleButton = ({ text, onClick }) => (
  <Button
    variant="outlined"
    size="small"
    onClick={onClick}
    sx={{
      mr: 1,
      mb: 1,
      borderRadius: '16px',
      borderColor: '#4677F0',
      color: '#4677F0',
      '&:hover': {
        backgroundColor: '#4677F0',
        color: 'white',
      }
    }}
  >
    {text}
  </Button>
);

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
        maxWidth: '75%',
        borderRadius: isUser ? '20px 20px 0 20px' : '20px 20px 20px 0',
        backgroundColor: isUser ? '#4677F0' : '#E8E8E8',
        color: isUser ? 'white' : 'black',
        whiteSpace: 'pre-wrap'
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{message}</Typography>
    </Paper>
    {isUser && <Avatar sx={{ ml: 1 }}>U</Avatar>}
  </Box>
);

function Chatbot({ pdfId, fullText, ocrCompleted, uploadedFileUrl, language, pdfState }) {
  const { email, accessToken } = useContext(AuthContext); // AuthContext에서 값 가져오기
  // 채팅 메시지들을 저장하는 상태
  const [messages, setMessages] = useState([]);
  // 사용자 입력을 저장하는 상태
  const [input, setInput] = useState('');
  // 메시지
  const messagesEndRef = useRef(null);
  // 초기 메시지 설정
  const initialMessage = { text: '본문과 관련된 내용 분석을 도와드릴게요😄', sender: 'bot' };
  // 채팅 입력 중 상태
  const [isTyping, setIsTyping] = useState(false);

  const location = useLocation();
  
  // 채팅 예시
  const exampleQuestions = [
    "본문의 핵심 내용을 알려주세요",
    "PDF를 요약해주세요",
    "키워드를 추출해주세요"
  ];

  const handleExampleClick = async (input) => {
    setInput(input);
    await handleSendMessage(input);
  };
  // 페이지 로드 시 채팅 이력 불러오기
  useEffect(() => {
    const fetchChatHistory = async () => {
      // Drive 페이지일 때만 채팅 이력을 불러옵니다.
      if (location.pathname === '/drive') {
        try {
          console.log('fetchChatHistory', pdfId, email);
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/importChat`, {
            params: {
              uuid: pdfId,
              email: email
            },
            headers: {
              'authorization': `Bearer ${accessToken}`,
            }
          });
          if (response.data && response.data.data.length > 0) {
            setMessages(response.data.data.map(chat => ({
              text: chat.message,
              sender: chat.sender
            })));
          } else {
            setMessages([initialMessage]);
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
          setMessages([initialMessage]);
        }
      } else {
        // Search 페이지일 경우 초기 메시지만 설정합니다.
        setMessages([initialMessage]);
      }
    };

    fetchChatHistory();
  }, [pdfId, email, location.pathname]);

  // OCR 완료 시 메시지 추가
  useEffect(() => {
    if (ocrCompleted && fullText && pdfId) {
      // 이전 상태를 기반으로 새 상태를 만드는 것, 상태 업데이트가 비동기적으로 일어날 때 안전하게 처리
      setMessages(prevMessages => [
        ...prevMessages,
        { text: '분석이 완료되었습니다. 질문해 주세요!', sender: 'bot' } // 이배열에 있는 값들 중 하나라도 변경되면 useEffect 내부의 코드가 실행됨
      ]);
    }
  }, [ocrCompleted, fullText, pdfId]);

  // FileUpload 시 메시지 추가
  useEffect(() => {
    if (uploadedFileUrl && pdfId) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: '파일이 업로드 되었습니다. 질문해 주세요!', sender: 'bot' }
      ]);
    }
  }, [uploadedFileUrl, pdfId]);

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
  const handleSendMessage = async (messageInput = input) => {
    if (!messageInput.trim()) return;

    const newMessages = [...messages, { text: messageInput, sender: 'client' }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // 한국어로 전송된 쿼리를 영어로 변경
      const request = await axios.post(`${MainFastAPI}/api/translate/transelateToEnglish`,
        { text: messageInput },
        { headers: { 'Content-Type': 'application/json' } }
      )
      console.log(`Sending message to chatbot: ${request.data.data}`);

      // 챗봇 응답값 반환
      const response = await fetchChatbotResponse(pdfId, request.data.data, language);
      setIsTyping(false);

      let botResponse = response.data.data || '챗봇 응답을 가져오지 못했습니다.';
      console.log("원본 데이터", botResponse);
      
      botResponse = botResponse.split('\n\n').map(paragraph => paragraph.trim()).join('\n\n');
      console.log("줄바꿈 처리", botResponse);
      setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: 'bot' }]);

      // 동기적으로 saveChat API 호출
      await saveChatHistory(pdfId, messageInput, 'client', email); // 사용자 메시지 저장
      await saveChatHistory(pdfId, botResponse, 'bot', email); // 챗봇 응답 저장

    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, { text: '챗봇 응답 중 오류가 발생했습니다.', sender: 'bot' }]);
    }
};

  const fetchChatbotResponse = async (pdfId, query, language) => {
    try {
      const usePdfId = pdfId;
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
  // 채팅 이력 저장 (비동기 방식)
  const saveChatHistory = (uuid, message, sender, email) => {
    // Drive 페이지일 때만 채팅 이력을 저장합니다.
    if (location.pathname === '/drive') {
      return axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/saveChat`,
        { uuid, message, sender, email },
        {
          headers: {
            'authorization': `Bearer ${accessToken}`
          }
        }
      )
        .then(response => {
          console.log('Chat history saved successfully');
          console.log('Server response:', response.data.data);
          return response.data.data;
        })
        .catch((error) => {
          console.error('Error saving chat history:', error);
          throw error;
        });
    }
    // Search 페이지일 경우 아무것도 하지 않습니다.
    return Promise.resolve();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const TypingAnimation = () => (
    <div className="typing-animation">
      <i className="fas fa-circle small-icon"></i>
      <i className="fas fa-circle small-icon"></i>
      <i className="fas fa-circle small-icon"></i>
    </div>
  );

  return (
    <Box className='drive-container' sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box className='drive-container' sx={{ height: '100%', flexGrow: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            message={message.text}
            isUser={message.sender === 'client'}
          />
        ))}
        {isTyping && (
          <ChatBubble
            message={<TypingAnimation />}
            isUser={false}
          />
        )}

        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {exampleQuestions.map((input, index) => (
        <ExampleButton
          key={index}
          text={input}
          onClick={() => handleExampleClick(input)}
        />
      ))}
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
          onClick={() => handleSendMessage()}
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