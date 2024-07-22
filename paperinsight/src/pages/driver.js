import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'pdfjs-dist/build/pdf.worker.entry';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import '../styles/main.css';
import api from '../services/api.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

function Home({ setSelectedPdf, setFileName, handleButtonClick, setIsDriveVisible, handlePdfSelection, id, password }) {
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
    console.log( `Bearer ${localStorage.getItem('accessToken')}`);
    const response = await api.get(`/api/auth/importS3`, {
      params: {
        email: localStorage.getItem('email'),
      },
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    const pdfFiles = response.data.data;  // 응답에서 'data' 필드를 추출합니다.

    const thumbnails = await Promise.all(pdfFiles.map(async (pdf) => {
      const thumbnailUrl = await createThumbnail(pdf.url);

      return {
        name: pdf.url.split('/').pop(),  // URL에서 파일 이름을 추출합니다.
        url: thumbnailUrl,               // 생성된 썸네일 URL
        file_url: pdf.url,               // PDF 파일의 원본 URL
        key: pdf.uuid,                   // PDF 파일의 UUID를 키로 사용합니다.
        lastModified: pdf.uploadedAt,    // 업로드된 날짜를 마지막 수정 날짜로 사용합니다.
        ocrCompleted: false              // OCR 작업 완료 여부 (초기값 false)
      };
    }));

    setThumbnails(thumbnails);
  } catch (error) {
    console.error('Error fetching PDF files:', error);
    throw error;
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
      console.log( `Bearer ${localStorage.getItem('accessToken')}`);

      const response = await api.post(`/api/auth/uploadS3`, formData, {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
      });

      const data = response.data.data;
      console.log('Full server response:', data);

      const fileUrl = data.file_url;
      const key = data.key;
      const uuid = data.uuid;
      console.log('File uploaded to S3:', fileUrl);
      console.log('File key:', key);
      console.log('UUID:', uuid);

      const thumbnailUrl = await createThumbnail(fileUrl);

      setThumbnails((prevThumbnails) => [{
        name: uuid,
        url: thumbnailUrl,
        file_url: fileUrl,
        key: key,
        lastModified: new Date().toISOString(),
        ocrCompleted: false
      }, ...prevThumbnails]);

      const req = {
        uuid : uuid,
        url : fileUrl,
        email: localStorage.getItem('email')
      }

      setPdfUrl(fileUrl);
      const res = await api.post(`/api/auth/saveS3`, req, {  
        headers: {
          'authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log(res.data.message);


      handleClose();
      
      // 파일 업로드 후 OCR 처리 실행
      await fetchPdfFiles();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleThumbnailClick = (fileUrl, thumbnailName) => {
    console.log("Home component - Thumbnail clicked. fileUrl:", fileUrl, "thumbnailName:", thumbnailName);
    setSelectedPdf(fileUrl);
    setFileName(thumbnailName);
    handlePdfSelection(fileUrl, thumbnailName);
    console.log("Selected PDF URL:", fileUrl);
    console.log("Selected Thumbnail Data:", thumbnailName);
  };


  return (
    
    <Box className = "drive-container" sx={{ height: '85vh', overflow: 'auto', pr: 1, position: 'relative'  }}>
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={handleCloseIcon}>
        <ArrowBackIosNewOutlinedIcon />
      </IconButton>
      <h1>Drive</h1>
        <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" size="small" onClick={handleClickOpen}>
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
