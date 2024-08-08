import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Select, MenuItem, FormControl, Button } from '@mui/material';
import axios from 'axios';

const MainFastAPI = process.env.REACT_APP_MainFastAPI;

const Search = ({ setSelectedPdf, setFileName, handleButtonClick, handlePdfSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('keyword');
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value);
  };

  const handleButtonClickLocal = async (pdfLink) => {
    try {
      // PDF 뷰어에 PDF 표시
      setSelectedPdf(pdfLink);


      const MainFastAPI = process.env.REACT_APP_MainFastAPI || process.env.MAIN_FASTAPI;
      const id = await axios.get(`${MainFastAPI}/api/weaviate/searchPaperId?pdf_url=${pdfLink}`);
      const pdf_id = id.data.data;
      handlePdfSelection(pdfLink, pdf_id, 'search');
      const formData = new URLSearchParams();
      formData.append('pdfId', pdf_id);
      formData.append('pdfUrl', pdfLink);
      console.log("PDF ID:", pdf_id);
      console.log("PDF URL:", pdfLink);
      const response = await axios.post(`${MainFastAPI}/api/ocr/ocrTest`,
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.status === 200) {
        console.log('OCR 요청 성공:', response.data);
        const pdf_id = response.data.data.pdf_id;
        let region = "search";
        console.log("OCR ID:", pdf_id);
        handleButtonClick(pdfLink, pdf_id, region); // App 컴포넌트의 상태 변경 함수 호출
      } else {
        console.error('OCR 요청 실패:', response.statusText);
      }
    } catch (error) {
      console.error('에러 상세:', error.response ? error.response.data : 'No response data');
      console.error('IP:', `${MainFastAPI}/api/ocr/ocrTest`);
      console.error('IP:', `${MainFastAPI}/api/weaviate/searchPaperId`);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.nativeEvent.isComposing === false) {
      console.log("Search term:", searchTerm);
      console.log("Search category:", searchCategory);

      if (searchCategory === 'keyword') {
        axios.get(`${MainFastAPI}/api/paper/searchKeyword?searchword=${searchTerm}`)
          .then((response) => {
            const { resultCode, data } = response.data;
            if (resultCode === 200) {
              setPapers(data); // Update the papers state with the new data
            } else {
              console.error('Error: ', response.data);
            }
          })
          .catch((error) => console.error('Error:', error));
      } else if (searchCategory === 'sentence') {
        axios.post(`${MainFastAPI}/api/translate/checkLanguage`, { text: searchTerm })
          .then((res) => {
            console.log("searchLanguage:", res.data);
            if (res.data.lang === 'kr') {
              axios.post(`${MainFastAPI}/api/translate/transelateToEnglish`, { text: searchTerm })
                .then((res) => {
                  const translatedQuery = res.data.data;
                  setSearchQuery(translatedQuery); // Update the searchQuery state with the translated query
                  console.log("translateToEnglish:", translatedQuery);
                  return translatedQuery; // Return the translated query to be used in the next then block
                })
                .then((translatedQuery) => {
                  return axios.get(`${MainFastAPI}/api/paper/searchColl?searchword=${translatedQuery}`);
                })
                .then((response) => {
                  const { resultCode, data } = response.data;
                  console.log("searchSentence:", data);
                  if (resultCode === 200) {
                    setPapers(data);
                  } else {
                    console.error('Error: ', response.data);
                  }
                })
                .catch((error) => console.error('Error:', error));
            } else {
              axios.get(`${MainFastAPI}/api/paper/searchColl?searchword=${searchTerm}`)
                .then((response) => {
                  const { resultCode, data } = response.data;
                  console.log("searchSentence:", data);
                  if (resultCode === 200) {
                    setPapers(data);
                  } else {
                    console.error('Error: ', response.data);
                  }
                })
                .catch((error) => console.error('Error:', error));
            }
          })
          .catch((error) => console.error('Error:', error));
      }
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
    <Box className='drive-container' sx={{ height: '87vh', overflow: 'auto', pr: 2 }}>
      <h1 class="smaller-heading">Paper Search</h1>
      <Box sx={{ display: 'flex', mb: 3, maxWidth: '750px' }}>
        <FormControl sx={{ mr: 1, flexGrow: 1, minWidth:'90px' }}>
          <Select
            labelId="search-category-label"
            id="search-category"
            value={searchCategory}
            onChange={handleCategoryChange}
            sx={{ fontSize: '11px',  width: '100%' }}
          >
            <MenuItem value="keyword" sx={{ fontSize: '11px' }}>키워드</MenuItem>
            <MenuItem value="sentence" sx={{ fontSize: '11px' }}>구어체</MenuItem>
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
        <Typography variant="subtitle1" sx={{ fontSize: '14px' }}>검색 결과: {papers.length}</Typography>
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
                onClick={() => handleButtonClickLocal(paper.pdf_link)}
                sx={{ fontSize: '12px' }}>
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