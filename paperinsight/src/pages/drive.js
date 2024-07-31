import React, { useState, useEffect, useContext } from 'react';
import { Container, Paper, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { pdfjs } from 'react-pdf';
import { getDocument } from 'pdfjs-dist';
import { useNavigate, useLocation } from 'react-router-dom';
import 'pdfjs-dist/build/pdf.worker.entry';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import '../styles/main.css';
import { AuthContext } from '../contexts/authcontext';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';



pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const MAIN_FASTAPI = process.env.REACT_APP_MainFastAPI;

function Drive({ setSelectedPdf, setFileName, setIsDriveVisible, handlePdfSelection, onFileUpload, setThumbnailFileName}) {

  const { email, accessToken, refreshToken } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const navigate = useNavigate();
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

  


  // console.log(`drive로 이동했을때의 api :  ${api}`);
  const handleCloseIcon = () => {
    setIsDriveVisible(false);

  }

  useEffect(() => {
    if (email) {
      fetchPdfFiles();
    }
  }, [email]);

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
    // if (!api) {
    //   console.error('API is not initialized');
    //   return;
    // }


    try {
      // console.log(api);
      // 여기서 api를 인식하지 못함
      console.log(`Bearer ${accessToken}`);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/importS3`, {
        params: {
          email: email,
        },
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${accessToken}`,
        }
      });
      console.log('Response:', response.data);

      const pdfFiles = response.data.data;

      const thumbnails = await Promise.all(pdfFiles.map(async (pdf) => {
        const match = pdf.uuid.match(/^[^_]+_(.*)$/);
        const filename = match ? match[1] : 'Unknown Filename';
        const thumbnailUrl = await createThumbnail(pdf.url);

        return {
          filename: filename,
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

  
  const handleThumbnailClick = (fileUrl, name, thumbnailKey) => {
    console.log("Home component - Thumbnail clicked. fileUrl:", fileUrl, "thumbnailName:", name, "thumbnailKey:", thumbnailKey);
    setSelectedPdf(fileUrl);
    setFileName(name);
    setThumbnailFileName(name);
    handlePdfSelection(fileUrl, thumbnailKey, name); // thumbnailName 대신 thumbnailKey를 전달
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
    if (!accessToken) {
      const goToLogin = window.confirm("이 기능을 사용하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goToLogin){
        navigate('/login');
      }
      return;
    }

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log(`Bearer ${accessToken}`);

      // Generate presigned URL
      const presignedResponse = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/generateS3`, {
        fileName: file.name,
      }, {
        headers: {
          'authorization': `Bearer ${accessToken}`
        }
      });

      const { uuid, url: presignedUrl, key: filePath } = presignedResponse.data.data;
      console.log('Presigned URL response:', presignedResponse.data);

      // Upload the file to S3 using the presigned URL
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': 'application/pdf'
        }
      });

      // Save the S3 file information to MongoDB
      const saveResponse = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/saveS3`, {
        uuid,
        email
      }, {
        headers: {
          'authorization': `Bearer ${accessToken}`
        }
      });

      console.log(saveResponse.data.message);

      const { url: fileUrl } = saveResponse.data.data;
      setPdfUrl(fileUrl);
      setPdfId(uuid);
      onFileUpload(fileUrl, uuid);

      handleClose();

      // Fetch the latest files from S3
      await fetchPdfFiles();

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteFile = async (uuid, email) =>  {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/deleteS3`,
        { 
          uuid,
          email
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}` // accessToken도 필요하다면 추가
          }
        }
      );
      if (response.status === 200) {
        alert('삭제가 완료되었습니다.');
        console.log('File deleted successfully');
        // 썸네일 목록에서 해당 파일 제거
        setThumbnails(prevThumbnails => prevThumbnails.filter(thumb => thumb.key !== uuid));
      } else {
        alert('파일 삭제에 실패했습니다.');
        console.error('Failed to delete file');
      }
    } catch (error) {
      alert('파일 삭제 중 오류가 발생했습니다.');
      console.error('Error deleting file:', error);
    }
  };




  return (

    <Box className="drive-container" sx={{ height: '85vh', overflow: 'auto', pr: 1, position: 'relative' }}>
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
                maxWidth: '180px',
                position: 'relative'
              }}
              onClick={() => handleThumbnailClick(thumbnail.file_url, thumbnail.filename, thumbnail.key)}
            >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    padding: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    handleDeleteFile(thumbnail.key, email);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              <Typography variant="body2" sx={{ fontSize: '14px', mb: 1, width: '100%', wordBreak: 'break-word' }}>{thumbnail.filename}</Typography>
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
                  alt={thumbnail.filename}
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