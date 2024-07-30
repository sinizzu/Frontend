import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MenuItem, FormControl, ToggleButton, ToggleButtonGroup, Select, Typography, Box, LinearProgress } from '@mui/material';

const MainFastAPI = process.env.REACT_APP_MainFastAPI;

function Keyword({ pdfState }) {
    const [pdf_id, setPdf_id] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [wikiResult, setWikiResult] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [language, setLanguage] = useState('en'); // 언어 상태
    const [userSelectedLanguage, setUserSelectedLanguage] = useState(null); // 사용자 선택 언어 상태

    useEffect(() => {
        if (pdfState.pdf_id && pdfState.pdf_id !== pdf_id) {
            setPdf_id(pdfState.pdf_id);
            fetchKeywords(pdfState.pdf_id);
        }
    }, [pdfState.pdf_id]);

    const fetchKeywords = async (id) => {
        setIsLoading(true);
        setLoadingPercentage(10);  // Initial loading percentage for keyword fetching
        try {
            console.log("Fetching keywords for pdf_id:", id);
            const response = await axios.get(`${MainFastAPI}/api/topic/keywordExtract?pdf_id=${id}`);
            setLoadingPercentage(30);  // Percentage after getting response
            console.log("Keyword response:", response.data);
            if (response.data && response.data.data) {
                setKeywords(response.data.data);
                setLoadingPercentage(50);  // Percentage after setting keywords
                if (response.data.data.length > 0) {
                    setSelectedKeyword(response.data.data[0]);
                    const detectedLanguage = await detectLanguage(id);
                    await fetchWikiData(response.data.data[0], detectedLanguage);
                }
            } else {
                throw new Error('No keywords data in response');
            }
        } catch (error) {
            console.error("Error fetching keywords:", error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const detectLanguage = async (id) => {
        try {
            const response = await axios.get(`${MainFastAPI}/api/weaviate/searchFulltext?pdf_id=${id}`);
            return response.data.language;
        } catch (error) {
            console.error("Error detecting language:", error);
            return 'en';
        }
    };

    const fetchWikiData = async (keyword, detectedLanguage) => {
        setIsLoading(true);
        setLoadingPercentage(60);
        try {
            const lang = userSelectedLanguage || detectedLanguage;
            console.log("Fetching wiki data with language:", lang);
            const response = await axios.get(`${MainFastAPI}/api/search/wikiSearch?keyword=${keyword}&lang=${lang}`);
            setLoadingPercentage(80);

            let formattedText = response.data.data.text
                .split('\n\n')
                .map(paragraph => paragraph.trim())
                .join('\n\n')
                .split('\n')
                .slice(0, 10)
                .join('\n');

            if (lang === 'ko') {
                console.log("Wiki data 이전 response:", formattedText);
                const transResponse = await axios.post(`${MainFastAPI}/api/translate/transelate`, {
                    text: formattedText,
                    lang: 'ko'
                });
                formattedText = transResponse.data.data;
            }
            console.log("Wiki data response:", formattedText);
            setWikiResult(formattedText);
            setLoadingPercentage(100);
        } catch (error) {
            console.error("Error fetching wiki data:", error);
            setError(error);
            setLoadingPercentage(100);  // Complete loading even if error occurs
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeywordChange = (event) => {
        const keyword = event.target.value;
        setSelectedKeyword(keyword);
        fetchWikiData(keyword, language);
    };

    // 언어 토글 버튼 핸들러
    const handleLanguageChange = (event, newLanguage) => {
        if (newLanguage !== null) {
            setUserSelectedLanguage(newLanguage);
            setLanguage(newLanguage);
            console.log("Selected language:", newLanguage);
            if (selectedKeyword) {
                fetchWikiData(selectedKeyword, newLanguage);
            }
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" sx={{ ml: 2 }}>키워드 추출 중... {loadingPercentage}%</Typography>
                <Box sx={{ width: '70%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={loadingPercentage} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Box className='drive-container' sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <h1>Keywords</h1>
                <Box display="flex" justifyContent="flex-end" mr={2}>
                    <ToggleButtonGroup
                        value={language}
                        exclusive
                        onChange={handleLanguageChange}
                        aria-label="language"
                    >
                        <ToggleButton value="en" aria-label="english">
                            English
                        </ToggleButton>
                        <ToggleButton value="ko" aria-label="korean">
                            한국어
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%', mb: 2 }}>
                <FormControl sx={{ flex: 1, mr: 2 }}>
                    <Select
                        labelId="search-category-label"
                        id="search-category"
                        value={selectedKeyword}
                        onChange={handleKeywordChange}
                        sx={{ fontSize: '12px', width: '100%' }}
                    >
                        {keywords.map((keyword) => (
                            <MenuItem key={keyword} value={keyword} sx={{ fontSize: '12px' }}>
                                {keyword}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box className='drive-container' sx={{ maxHeight: 550, overflowY: 'auto', overflowX: 'hidden', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{wikiResult}</Typography>
            </Box>
        </Box>
    );
}

export default Keyword;
