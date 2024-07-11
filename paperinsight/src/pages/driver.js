import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';

import 'pdfjs-dist/build/pdf.worker.entry';

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


function Home({ setSelectedPdf }) {
  const [jhIp, setJhIp] = useState(process.env.REACT_APP_JH_IP);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);


  useEffect(() => {
    if (!jhIp) {
      setJhIp(process.env.MAIN_FASTAPI);
    }
  }, [jhIp]);

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
    setSelectedPdf(url); // 파일 URL을 상위 컴포넌트에 전달

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
    
    // 새로운 PDF 미리보기를 기존의 미리보기와 함께 쌓기
    setThumbnails((prevThumbnails) => [
      ...prevThumbnails,
      { name: uploadedFile.name, url: thumbnailUrl },
    ]);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://${jhIp}:3000/api/paper/saveToS3`, {  
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

      handleClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleThumbnailClick = (fileUrl) => {
    setSelectedPdf(fileUrl); // 선택한 PDF 파일 URL을 설정
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', borderRight: '1px solid #ccc', pr: 2 }}>
      <Typography variant="h5">Drive</Typography>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
        <Button variant="contained" onClick={handleClickOpen} sx={{ mb: 2 }}>
          +Add PDF
        </Button>
        {thumbnails.map((thumbnail, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }} onClick={() => handleThumbnailClick(thumbnail.file_url)}>
            <Typography variant="body2" sx={{ fontSize: '14px', mb: 1 }}>{thumbnail.name}</Typography>
            <img src={thumbnail.url} alt={thumbnail.name} width={150} />
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