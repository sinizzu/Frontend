import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'pdfjs-dist/build/pdf.worker.entry';

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Home({ setSelectedPdf, setFileName }) {
  const [MAIN_FASTAPI, setIp] = useState(process.env.REACT_APP_MainFastAPI || process.env.MAIN_FASTAPI);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [pdfLink, setPdfLink] = useState(null);  // pdfLink 변수를 상태로 정의
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [ocrCompleted, setOcrCompleted] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
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

    // PDF의 첫 페이지를 미리보기로 생성
    const pdf = await getDocument(url).promise;
    const page = await pdf.getPage(1);
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
    const thumbnailUrl = canvas.toDataURL();
    
    // 새로운 PDF 미리보기를 기존의 미리보기와 함께 쌓기, OCR 미완료 상태로 초기화
    setThumbnails((prevThumbnails) => [
      ...prevThumbnails,
      { name: uploadedFile.name, url: thumbnailUrl, ocrCompleted: false },
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
      console.log('File uploaded to S3:', data.file_url);

      // 업로드된 파일의 UUID를 사용하여 썸네일 업데이트
      setThumbnails((prevThumbnails) => 
        prevThumbnails.map((thumbnail) => 
          thumbnail.name === file.name ? { ...thumbnail, uuid: data.uuid, file_url: data.file_url } : thumbnail
        )
      );

      // setFileName(file.name);

      setPdfLink(data.file_url);

      handleClose();

      // 파일 업로드 후 OCR 처리 실행
      await handleOcr(data.file_url, data.uuid);
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
        console.log("PDF ID:", pdf_id);
        console.log("Full Text:", full_text);

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


const handleThumbnailClick = (fileUrl) => {
    setSelectedPdf(fileUrl); // 선택한 PDF 파일 URL을 설정
  };
  const handleChatBotClick = (uuid, fileUrl) => {
    handleThumbnailClick(fileUrl);  // 먼저 썸네일 클릭 처리
    navigate('/chatbot', { state: { pdfId: uuid } }); // uuid를 state로 전달
};
  return (
    <Box sx={{ height: '85vh', overflow: 'auto', borderRight: '1px solid #ccc', pr: 2 }}>
      <Typography variant="h5">Drive</Typography>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
        <Button variant="contained" onClick={handleClickOpen} sx={{ mb: 2 }}>
          +Add PDF
        </Button>
        {thumbnails.map((thumbnail, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }} onClick={() => handleThumbnailClick(thumbnail.file_url)}>
            <Typography variant="body2" sx={{ fontSize: '14px', mb: 1 }}>{thumbnail.name}</Typography>
            <img src={thumbnail.url} alt={thumbnail.name} width={150} />
            {thumbnail.ocrCompleted && (
              <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleChatBotClick(thumbnail.uuid, thumbnail.file_url)} 
              sx={{ mb: 2, mr: 2 }}
          >
              ChatBot 사용해보기
          </Button>
            )}
          </Paper>
        ))}
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
