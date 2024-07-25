import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MenuItem, FormControl, Select, Typography, Box, CircularProgress, LinearProgress } from '@mui/material';

const MainFastAPI = process.env.REACT_APP_MainFastAPI;

function Keyword({ pdfState }) {
    const [pdf_id, setPdf_id] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [wikiResult, setWikiResult] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPercentage, setLoadingPercentage] = useState(0);

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
                    await fetchWikiData(response.data.data[0]);
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

    const fetchWikiData = async (keyword) => {
        setIsLoading(true);
        setLoadingPercentage(60);  // Initial loading percentage for fetching wiki data
        try {
            let language = await axios.get(`${MainFastAPI}/api/weaviate/searchFulltext?pdf_id=${pdfState.pdf_id}`);
            setLoadingPercentage(70);  // Percentage after getting language
            language = language.data.language;
            console.log("Language:", language);
            const response = await axios.get(`${MainFastAPI}/api/search/wikiSearch?keyword=${keyword}&lang=${language}`);
            setLoadingPercentage(80);  // Percentage after wiki search response
            console.log("Wiki response:", response.data);
            if (response.data.resultCode === 200) {
                setWikiResult(response.data.data.text);
                setLoadingPercentage(100);  // Complete loading
            } else {
                throw new Error(response.data.data.message || 'No data found in wiki response');
            }
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
        fetchWikiData(keyword);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
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
            <h1>Keywords</h1>
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
            <Box className='drive-container' sx={{ maxHeight: 550, overflowY: 'auto',overflowX: 'hidden', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1">{wikiResult}</Typography>
            </Box>
        </Box>
    );
}

export default Keyword;
