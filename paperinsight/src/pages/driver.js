import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

function Home({ setSelectedPdf, setFileName }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const navigate = useNavigate();
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

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
      console.log("IP:", process.env.REACT_APP_MainFastAPI);
      console.log('Uploading to URL:', `${MAIN_FASTAPI}/api/paper/saveToS3`);
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
      await fetchPdfFiles();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleThumbnailClick = (fileUrl, thumbnailName) => {
    setSelectedPdf(fileUrl);
    setFileName(thumbnailName);
    console.log("Selected PDF URL:", fileUrl);
    console.log("Selected Thumbnail Data:", thumbnailName);
  };

  return (
    <Box sx={{ height: '85vh', overflow: 'auto', pr: 2 }}>
      <Typography variant="h5">Drive</Typography>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
        <Button variant="contained" onClick={handleClickOpen} sx={{ mb: 2 }}>
          +Add PDF
        </Button>
        {thumbnails.slice(-10).map((thumbnail, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: selectedThumbnail === thumbnail.key ? '#e3f2fd' : 'white',
              border: selectedThumbnail === thumbnail.key ? '2px solid #2196f3' : 'none',
              transition: 'all 0.3s ease'
            }} 
            onClick={() => handleThumbnailClick(thumbnail.file_url, thumbnail.name)}
          >
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
