import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Select, MenuItem, FormControl, Button } from '@mui/material';
import axios from 'axios';

const Search = ({ setSelectedPdf }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('keyword');
  const [papers, setPapers] = useState([]);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value);
  };

// pdf로 보기 버튼 눌렀을 때 viewer로 연결 및 ocr 실행 및 저장
  const handleButtonClick = async (pdfLink) => {
    // PDF 링크를 setSelectedPdf로 설정
    setSelectedPdf(pdfLink);
  
    try {
      const MainFastAPI = process.env.REACT_APP_MainFastAPI;
      const formData = new URLSearchParams();
      formData.append('pdfUrl', pdfLink);
  
      const response = await axios.post(`${MainFastAPI}/api/ocr/ocrTest`, 
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
  
      if (response.status === 200) {
        console.log('OCR 요청 성공:', response.data);
      } else {
        console.error('OCR 요청 실패:', response.statusText);
      }
    } catch (error) {
      console.error('OCR 요청 에러:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.nativeEvent.isComposing === false) {
      console.log("Search term:", searchTerm);
      console.log("Search category:", searchCategory);
      const MainFastAPI = process.env.REACT_APP_MainFastAPI;
      let response = null;
      if (searchCategory === 'keyword') {
        response = axios.get(`${MainFastAPI}/api/paper/searchKeyword?searchword=${searchTerm}`);
      }
      else if (searchCategory === 'sentence') {
        response = axios.get(`${MainFastAPI}/api/paper/getColl?searchword=${searchTerm}`);
      }
      response.then((res) => {
        const { resultCode, data } = res.data;
        if (resultCode === 200) {
          setPapers(data); // Update the papers state with the new data
        } else {
          console.error('Error: ', res.data);
        }
      }).catch((error) => {
        console.error('Error fetching data:', error);
      });
    }
  };
  const toggleAbstract = (index) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const truncateAbstract = (abstract, index) => {
    if (abstract.length > 200) {
      if (expandedAbstracts[index]) {
        return (
          <>
            {abstract} <Button onClick={() => toggleAbstract(index)} sx={{ fontSize: '10px' }}>show less</Button>
          </>
        );
      }
      return (
        <>
          {abstract.substring(0, 200)}... <Button onClick={() => toggleAbstract(index)} sx={{ fontSize: '10px' }}>show more</Button>
        </>
      );
    }
    return abstract;
  };
  return (
    <Box sx={{ height: '87vh', overflow: 'auto', borderRight: '1px solid #ccc', pr: 2 }}>
      <h1>Paper Search</h1>
      <Box sx={{ display: 'flex', mb: 3, maxWidth: '750px' }}>
        <FormControl sx={{ mr: 1, flexGrow: 1 }}>
          <Select
            labelId="search-category-label"
            id="search-category"
            value={searchCategory}
            onChange={handleCategoryChange}
            sx={{ fontSize: '12px' }}
          >
            <MenuItem value="keyword" sx={{ fontSize: '12px' }}>키워드검색</MenuItem>
            <MenuItem value="sentence" sx={{ fontSize: '12px' }}>구어체검색</MenuItem>
          </Select>
        </FormControl>
        <TextField 
          variant="outlined" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          sx={{ flexGrow: 10 }}
          InputProps={{
            style: {
              fontSize: '12px',
            },
          }}
        />
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ fontSize: '14px' }}>검색결과: {papers.length}</Typography>
      </Box>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
        {papers.map((paper, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #ccc' }}>
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#666' }}>
              {index + 1}. category: {paper.category}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: '18px', color: '#1a73e8', mb: 1 }}>
              {paper.title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#333' }}>
              <strong>Authors:</strong> {paper.authors.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#333', mt: 1 }}>
              <strong>Abstract:</strong> {truncateAbstract(paper.abstract, index)}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '10px', color: '#999', mt: 1 }}>
              Submitted {new Date(paper.published).toLocaleDateString()}
            </Typography>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => handleButtonClick(paper.pdf_link)}
                sx={{ fontSize: '12px' }}
              >
                PDF로 보기
              </Button>
            </Box>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default Search;
