import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';

import 'pdfjs-dist/build/pdf.worker.entry';

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


function Home({ setSelectedPdf }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);

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

  const handleFileUpload = () => {
    console.log('파일 업로드:', file);
    handleClose();
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', borderRight: '1px solid #ccc', pr: 2 }}>
      <Typography variant="h5">Drive</Typography>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
        <Button variant="contained" onClick={handleClickOpen} sx={{ mb: 2 }}>
          +Add PDF
        </Button>
        {thumbnails.map((thumbnail, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
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
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;