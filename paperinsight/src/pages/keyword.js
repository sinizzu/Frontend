import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MenuItem, FormControl, Select, Typography, Button, Box } from '@mui/material';
import { ClipLoader } from 'react-spinners';

// env에 IP 가져오기
const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Keyword({ pdfState }) {
    const pdf_id = pdfState.pdf_id || '';
    const [keywords, setKeywords] = useState([]); // 키워드 목록 상태, 초기값을 빈 배열로 설정
    const [selectedKeyword, setSelectedKeyword] = useState(''); // 선택된 키워드 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [wikiResult, setWikiResult] = useState(''); // 위키 결과 상태, 초기값을 빈 문자열로 설정
    const [wikiLoading, setWikiLoading] = useState(false); // 위키 검색 로딩 상태
    const [wikiError, setWikiError] = useState(null); // 위키 검색 에러 상태

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        const fetchKeywords = async () => {
            setLoading(true);
            try {
                console.log("PDF ID:", pdf_id);
                const response = await axios.get(`${SubFastAPI}/api/topic/keywordExtract?pdf_id=${pdf_id}`);
                const keywordsData = response.data.data;
                setKeywords(keywordsData); // 서버에서 받은 키워드 데이터를 설정
                if (keywordsData.length > 0) {
                    setSelectedKeyword(keywordsData[0]); // 첫 번째 키워드를 기본값으로 설정
                    fetchWikiData(keywordsData[0]); // 기본 선택 키워드로 위키 데이터 가져오기
                }
            } catch (error) {
                setError(error); // 에러 설정
            } finally {
                setLoading(false); // 로딩 상태 해제
            }
        };
        fetchKeywords(); // 키워드 데이터 가져오기
    }, [pdf_id, setLoading]); // pdf_id 바뀔 때만 실행

    const fetchWikiData = async (keyword) => {
        setWikiLoading(true);
        setWikiError(null);

        try {
            const response = await axios.get(`${MainFastAPI}/api/search/wikiSearch?keyword=${keyword}`);
            console.log("Wiki Search Data:", response.data);
            if (response.data.resultCode === 200) {
                setWikiResult(response.data.data.text);
            } else {
                throw new Error(response.data.data.message || 'No data found in wiki response');
            }
        } catch (error) {
            console.error('Error fetching wiki data:', error);
            setWikiError(error.response?.data?.result?.data?.message || 'An error occurred');
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
        <div>
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
        </div>
    );
}

export default Keyword;
