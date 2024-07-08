import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Select, MenuItem, FormControl } from '@mui/material';

const papers = [
  {
    title: "Towards Robust Speech Representation Learning for Thousands of Languages",
    authors: "William Chen1, Wangyou Zhang1,2, Yifan Peng1, Xinjiang Li3, Jinchuan Tian1, Jiatong Shi1, Xuankai Chang1, Soumi Maiti1, Karen Livescu1,4, Shinji Watanabe1",
    summary: "Self-supervised learning (SSL) has helped extend speech technologies to more languages by reducing the need for labeled data. However, models are still far from supporting the world's 7000+ languages...",
    date: "30 June 2024",
    pdf: "path/to/pdf1.pdf"
  },
  {
    title: "Characterizing Stereotypical Bias from Privacy-preserving Pre-Training",
    authors: "Simran Arlot, Rene Gulden, Annica Schreiner",
    summary: "Biases can introduce real challenges for model privatization, which are known to degrade language modeling capabilities, unfair social outcomes and undesired biases...",
    date: "30 June 2024",
    pdf: "path/to/pdf2.pdf"
  }
  // Add more papers as needed
];

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('keyword');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value);
  };

  const handleSearchSubmit = () => {
    console.log("Search term:", searchTerm);
    console.log("Search category:", searchCategory);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <Box sx={{ height: '88vh', overflow: 'auto', borderRight: '1px solid #ccc', pr: 2 }}>
      <h1>Paper Search</h1>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, maxWidth: '750px' }}>
        <FormControl sx={{ mr: 1 }}>
          <Select
            labelId="search-category-label"
            id="search-category"
            value={searchCategory}
            onChange={handleCategoryChange}
            sx={{ fontSize: '12px' }}
          >
            <MenuItem value="keyword" sx={{ fontSize: '12px' }}>키워드검색</MenuItem>
            <MenuItem value="setence" sx={{ fontSize: '12px' }}>구어체검색</MenuItem>
          </Select>
        </FormControl>
        <TextField 
          variant="outlined" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          sx={{ flexGrow: 0.8 }}
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
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '14px' }}>{paper.title}</Typography>
            <Typography variant="subtitle1" sx={{ fontSize: '10px' }}>{paper.authors}</Typography>
            <Typography variant="body2" sx={{ fontSize: '10px' }}>{paper.summary}</Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>{paper.date}</Typography>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default Search;
