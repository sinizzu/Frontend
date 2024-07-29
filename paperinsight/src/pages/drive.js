import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import 'pdfjs-dist/build/pdf.worker.entry';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import '../styles/main.css';
import api from '../services/api.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

function Drive({ setSelectedPdf, setFileName, setIsDriveVisible, handlePdfSelection, onFileUpload }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfId, setPdfId] = useState(null);
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
      console.log(`Bearer ${localStorage.getItem('accessToken')}`);
      const response = await api.get(`/api/auth/importS3`, {
        params: {
          email: localStorage.getItem('email'),
        },
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log('Response:', response.data);
  
      const pdfFiles = response.data.data;
  
      const thumbnails = await Promise.all(pdfFiles.map(async (pdf) => {
        // 이미 썸네일 URL이 있다면 그것을 사용하고, 없다면 새로 생성합니다.
        const thumbnailUrl = pdf.thumbnailUrl || await createThumbnail(pdf.url);
  
        return {
          filename: pdf.fileName, 
          name: pdf.url.split('/').pop(),
          url: thumbnailUrl,
          file_url: pdf.url,
          key: pdf.uuid,
          lastModified: pdf.uploadedAt,
          ocrCompleted: pdf.ocrCompleted || false
        };
      }));
  
      setThumbnails(thumbnails);
    } catch (error) {
      console.error('Error fetching PDF files:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    navigate('/drive');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setPdfUrl(URL.createObjectURL(uploadedFile));
    setSelectedPdf(URL.createObjectURL(uploadedFile));
  };

  const handleFileUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
  
    try {
      console.log(`Bearer ${localStorage.getItem('accessToken')}`);
  
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
      console.log('filename', file.name)
  
      const req = {
        uuid: uuid,
        url: fileUrl,
        email: localStorage.getItem('email'), 
        fileName: file.name
      };
  
      setPdfUrl(fileUrl);
      setPdfId(uuid);
      onFileUpload(fileUrl, uuid, file.name);
      const res = await api.post(`/api/auth/saveS3`, req, {  
        headers: {
          'authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log(res.data.message);
  
      handleClose();
      
      // S3에서 최신 파일 목록을 가져옵니다.
      await fetchPdfFiles();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleThumbnailClick = (fileUrl, thumbnail, thumbnailKey) => {
    console.log("Home component - Thumbnail clicked. fileUrl:", fileUrl, "thumbnailName:", thumbnail.name, "thumbnailKey:", thumbnailKey);
    setSelectedPdf(fileUrl);
    setFileName(thumbnail.filename || thumbnail.name); 
    handlePdfSelection(fileUrl, thumbnailKey, thumbnail.filename || thumbnail.name); // thumbnailName 대신 thumbnailKey를 전달
    console.log("Selected PDF URL:", fileUrl);
    console.log("Selected Thumbnail Key:", thumbnailKey);
  };


  return (
    
    <Box className = "drive-container" sx={{ height: '85vh', overflow: 'auto', pr: 1, position: 'relative'  }}>
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={handleCloseIcon}>
        <ArrowBackIosNewOutlinedIcon />
      </IconButton>
      <h1 class="smaller-heading">Drive</h1>
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
        {thumbnails.map((thumbnail) => (
          <Paper 
            key={thumbnail.key} 
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
            onClick={() => handleThumbnailClick(thumbnail.file_url, thumbnail.name, thumbnail.key, thumbnail.filename)}
          >
            <Typography variant="body2" sx={{ fontSize: '14px', mb: 1, width: '100%', wordBreak: 'break-word'}}>{thumbnail.filename || thumbnail.name}</Typography>
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

export default Drive;