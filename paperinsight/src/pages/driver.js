import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'pdfjs-dist/build/pdf.worker.entry';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import '../styles/main.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

function Home({ setSelectedPdf, setFileName, handleButtonClick, setIsDriveVisible, handlePdfSelection }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const navigate = useNavigate();
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

  const handleCloseIcon = () => {
    setIsDriveVisible(false);

  }

  useEffect(() => {
    fetchPdfFiles();
  }, []);

  const createThumbnail = async (pdfUrl) => {
    const pdfDocument = await getDocument(pdfUrl).promise;
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    return canvas.toDataURL();
  };

  const fetchPdfFiles = async () => {
    try {
      const response = await axios.get(`${MAIN_FASTAPI}/api/paper/listPdfs`);
      const pdfFiles = response.data;

      const thumbnails = await Promise.all(pdfFiles.map(async (pdf) => {
        const pdfUrl = `https://kibwa07.s3.ap-northeast-2.amazonaws.com/${pdf.key}`;
        const thumbnailUrl = await createThumbnail(pdfUrl);

        return {
          name: pdf.key.split('/').pop(),
          url: thumbnailUrl,
          file_url: pdfUrl,
          key: pdf.key,
          lastModified: pdf.fileUrl,
          ocrCompleted: false
        };
      }));

      setThumbnails(thumbnails);
    } catch (error) {
      console.error('Error fetching PDF files:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    navigate('/');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0];
    const url = URL.createObjectURL(uploadedFile);
    setFile(uploadedFile);
    setPdfUrl(url);
    setSelectedPdf(url);

    const thumbnailUrl = await createThumbnail(url);
    
    // 새로운 PDF 미리보기를 기존의 미리보기와 함께 쌓기, OCR 미완료 상태로 초기화
    setThumbnails((prevThumbnails) => [
      { name: uploadedFile.name, url: thumbnailUrl, ocrCompleted: false },
      ...prevThumbnails
    ]);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${MAIN_FASTAPI}/api/paper/saveToS3`, {  
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Full server response:', data);

      const fileUrl = data.file_url || data.fileUrl;
      const key = data.key || data.filePath;
      const uuid = data.uuid;
      console.log('File uploaded to S3:', fileUrl);
      console.log('File key:', key);
      console.log('UUID:', uuid);

      const thumbnailUrl = await createThumbnail(fileUrl);

      setThumbnails((prevThumbnails) => [{
        name: file.name,
        url: thumbnailUrl,
        file_url: fileUrl,
        key: key,
        lastModified: new Date().toISOString(),
        ocrCompleted: false
      }, ...prevThumbnails]);

      setFileName(file.name);
      setPdfUrl(fileUrl);

      handleClose();
      
      // 파일 업로드 후 전체 리스트 새로고침
      // 파일 업로드 후 OCR 처리 실행
      await fetchPdfFiles();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOcr = async (pdfLink, uuid) => {
    if (!pdfLink || !uuid) {
      console.error('PDF link or UUID is not set');
      return;
    }

    setSelectedPdf(pdfLink);

    try {
      const formData = new URLSearchParams();
      formData.append('pdfUrl', pdfLink);
      formData.append('pdfId', uuid);

      const response = await axios.post(
        `${MAIN_FASTAPI}/api/ocr/ocrTest`, 
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.status === 200) {
        console.log('OCR 요청 성공:', response.data);
        const { pdf_id, full_text } = response.data.data;
        let region = "driver";
        console.log("PDF ID:", pdf_id);
        navigate('/keyword', { state: { pdf_id, region } });
        handleButtonClick(pdfLink, pdf_id, region); // App 컴포넌트의 상태 변경 함수 호출

        // OCR 결과를 divideChunk 엔드포인트로 전송
        await divideChunk(pdf_id, full_text);
        
        // OCR 완료 상태 업데이트
        setThumbnails((prevThumbnails) =>
          prevThumbnails.map((thumbnail) =>
            thumbnail.uuid === uuid ? { ...thumbnail, ocrCompleted: true } : thumbnail
          )
        );
      } else {
        console.error('OCR 요청 실패:', response.statusText);
      }
    } catch (error) {
      console.error('OCR 요청 에러:', error);
    }
  };

  const divideChunk = async (pdfId, fullText) => {
    try {
      const response = await axios.post(
        `${MAIN_FASTAPI}/api/chatbot/divideChunk`, // 엔드포인트 URL 확인
        { pdfId: pdfId, fullText: fullText }, // fullText와 pdfId를 payload로 전송
        { headers: { 'Content-Type': 'application/json' } } // JSON 형식으로 전송
      );

      if (response.status === 200) {
        console.log('divideChunk 요청 성공:', response.data);
        // divideChunk 결과를 상태로 설정하거나 다른 처리를 할 수 있습니다.
        // 예: setChunkedData(response.data);
      } else {
        console.error('divideChunk 요청 실패:', response.statusText);
      }
    } catch (error) {
      console.error('divideChunk 요청 에러:', error);
    }
  };

  const handleThumbnailClick = (fileUrl, thumbnailName) => {
    setSelectedPdf(fileUrl);
    setFileName(thumbnailName);
    handlePdfSelection(fileUrl, thumbnailName);
    console.log("Selected PDF URL:", fileUrl);
    console.log("Selected Thumbnail Data:", thumbnailName);
  };

  const handleChatBotClick = (uuid, fileUrl, fileName) => {
    handleThumbnailClick(fileUrl, fileName); // 먼저 썸네일 클릭 처리
    navigate('/chatbot', { state: { pdfId: uuid } }); // uuid를 state로 전달
  };

  return (
    
    <Box className = "drive-container" sx={{ height: '85vh', overflow: 'auto', pr: 2, position: 'relative'  }}>
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={handleCloseIcon}>
        <ArrowBackIosNewOutlinedIcon />
      </IconButton>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Drive
        </Typography>
      </Box>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleClickOpen}>
          +Add PDF
        </Button>
      </Box>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 2 
      }}>
        {thumbnails.slice(-10).map((thumbnail, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: selectedThumbnail === thumbnail.key ? '#e3f2fd' : 'white',
              border: selectedThumbnail === thumbnail.key ? '2px solid #2196f3' : 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              width: '180px',
              maxWidth: '180px'
            }} 
            onClick={() => handleThumbnailClick(thumbnail.file_url, thumbnail.name)}
          >
            <Typography variant="body2" sx={{ fontSize: '14px', mb: 1, width: '100%', wordBreak: 'break-word'}}>{thumbnail.name}</Typography>
            <Box 
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img 
                src={thumbnail.url} 
                alt={thumbnail.name} 
                style={{
                  width: '100%',  // 이미지 너비를 100%로 설정
                  height: 'auto',  // 비율 유지
                  objectFit: 'contain'  // 이미지 비율 유지하면서 컨테이너에 맞춤
                }}
              />
            </Box>
          </Paper>
      ))}
        </Box>
      </Container>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload PDF</DialogTitle>
        <DialogContent>
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="upload-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-file">
            <Button variant="contained" component="span">
              Choose File
            </Button>
          </label>
          {file && <Typography variant="body1" sx={{ mt: 2 }}>{file.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFileUpload} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
