import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MenuItem, FormControl, Select, Typography, Button, Box } from '@mui/material';
import { ClipLoader } from 'react-spinners';

// env에 IP 가져오기
const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Keyword({ pdfState, setKeywordLoading, setWikiLoading }) {
    const pdf_id = pdfState.pdf_id || '';
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [wikiResult, setWikiResult] = useState('');
    const [error, setError] = useState(null);
    const [wikiError, setWikiError] = useState(null); // wikiError 상태 추가

    useEffect(() => {
        const fetchKeywords = async () => {
            if (!pdf_id) {
                console.log("Keyword component - No pdf_id, skipping fetchKeywords");
                return;}
            console.log("Keyword component - Fetching keywords for pdf_id:", pdf_id);
            setKeywordLoading(true);
            try {
                const response = await axios.get(`${SubFastAPI}/api/topic/keywordExtract?pdf_id=${pdf_id}`);
                setKeywords(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedKeyword(response.data.data[0]);
                    await fetchWikiData(response.data.data[0]);
                }
            } catch (error) {
                setError(error);
            } finally {
                setKeywordLoading(false);
            }
        };
        fetchKeywords();
    }, [pdf_id, setKeywordLoading]);

    const fetchWikiData = async (keyword) => {
        setWikiLoading(true);
        try {
            const response = await axios.get(`${MainFastAPI}/api/search/wikiSearch?keyword=${keyword}`);
            if (response.data.resultCode === 200) {
                setWikiResult(response.data.data.text);
            } else {
                throw new Error(response.data.data.message || 'No data found in wiki response');
            }
        } catch (error) {
            setError(error);
        } finally {
            setWikiLoading(false);
        }
    };

    const handleKeywordChange = (event) => {
        const keyword = event.target.value;
        setSelectedKeyword(keyword);
        fetchWikiData(keyword);
    };

    const renderWikiText = () => {
        if (!wikiResult) return null;
        const textToShow = wikiResult;
        return (
            <div>
                <Typography variant="body1">{textToShow}</Typography>
            </div>
        );
    };

    // 데이터 로딩 중이면 로딩 표시
    // if (loading || wikiLoading) {
    //     return (
    //         <div>
    //             <Typography variant="body1">Loading...</Typography>
    //             <ClipLoader size={50} />
    //         </div>
    //     );
    // }

    // 에러가 발생하면 에러 메시지 표시
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // UI 렌더링
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
            <Box>
                {renderWikiText()}
            </Box>
            {wikiError && <div>Error: {wikiError}</div>}
        </Box>
    );
}

export default Keyword;