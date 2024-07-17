import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { MenuItem, FormControl, Select, Typography, Button, Box } from '@mui/material';
import { ClipLoader } from 'react-spinners';

// env에 IP 가져오기
const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Keyword() {
    const location = useLocation();
    const pdf_id = location.state?.pdf_id || '';
    
    const [searchCategory, setSearchCategory] = useState('summary'); // 기본값을 'summary'로 설정
    const [keywords, setKeywords] = useState([]); // 키워드 목록 상태, 초기값을 빈 배열로 설정
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [wikiResult, setWikiResult] = useState(''); // 위키 결과 상태, 초기값을 빈 문자열로 설정
    const [wikiLoading, setWikiLoading] = useState(false); // 위키 검색 로딩 상태
    const [wikiError, setWikiError] = useState(null); // 위키 검색 에러 상태
    const [showLength, setShowLength] = useState(200); // 표시할 텍스트 길이 상태
    const [summary, setSummary] = useState(''); // summary 데이터를 저장할 상태
    const [summaryFetched, setSummaryFetched] = useState(false); // summary 데이터가 이미 가져왔는지 여부 상태

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        const fetchKeywords = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${SubFastAPI}/api/topic/keywordExtract?pdf_id=${pdf_id}`);
                console.log("Keywords Data:", response.data.data); // Check the structure of the response data
                setKeywords(response.data.data); // 서버에서 받은 키워드 데이터를 설정
            } catch (error) {
                setError(error); // 에러 설정
            } finally {
                setLoading(false); // 로딩 상태 해제
            }
        };
        fetchKeywords(); // 키워드 데이터 가져오기
    }, [pdf_id]); // pdf_id 바뀔 때만 실행

    // Fetch the summary on component mount
    useEffect(() => {
        const fetchSummary = async () => {
            if (pdf_id && !summaryFetched) {
                setLoading(true);
                try {
                    const response = await axios.get(`${SubFastAPI}/api/summary/summaryPaper?pdf_id=${pdf_id}`);
                    console.log("Summary Data:", response.data);
                    setSummary(response.data.summary);
                    setSummaryFetched(true); // summary 데이터 가져왔음 설정
                } catch (error) {
                    setError(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchSummary();
    }, [pdf_id, summaryFetched]);

    // 검색 카테고리 변경 시 처리
    const handleCategoryChange = async (event) => {
        const selectedKeyword = event.target.value;
        setSearchCategory(selectedKeyword);
        setWikiLoading(true);
        setWikiError(null);
        setShowLength(700); // 초기 길이로 설정

        if (selectedKeyword === 'summary') {
            // 'summary' 선택 시 summary 데이터를 wikiResult로 설정
            setWikiResult(summary);
            setWikiLoading(false);
        } else {
            try {
                const response = await axios.get(`${MainFastAPI}/api/search/wikiSearch?keyword=${selectedKeyword}`);
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
        }
    };

    const handleShowMore = () => {
        setShowLength(prevLength => prevLength + 700);
    };

    const renderWikiText = () => {
        if (!wikiResult) return null;
        const textToShow = wikiResult.slice(0, showLength);
        return (
            <div>
                <Typography variant="body1">{textToShow}</Typography>
                {wikiResult.length > showLength && (
                    <Button onClick={handleShowMore}>
                        Show More
                    </Button>
                )}
            </div>
        );
    };

    const renderSummaryText = () => {
        if (!summary) return null;
        const textToShow = summary.slice(0, showLength);
        return (
            <div>
                <Typography variant="body1">{textToShow}</Typography>
                {summary.length > showLength && (
                    <Button onClick={handleShowMore}>
                        Show More
                    </Button>
                )}
            </div>
        );
    };

    // 데이터 로딩 중이면 로딩 표시
    if (loading || wikiLoading) {
        return (
            <div>
                <Typography variant="body1">Loading...</Typography>
                <ClipLoader size={50} />
            </div>
        );
    }

    // 에러가 발생하면 에러 메시지 표시
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // UI 렌더링
    return (
        <div>
            <h1>Preview</h1>
            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%', mb: 2 }}>
                <FormControl sx={{ flex: 1, mr: 2 }}>
                    <Select
                        labelId="search-category-label"
                        id="search-category"
                        value={searchCategory}
                        onChange={handleCategoryChange}
                        sx={{ fontSize: '12px', width: '100%' }}
                    >
                        <MenuItem value="summary" sx={{ fontSize: '12px' }}>summary</MenuItem>
                        {keywords.map((keyword) => (
                            <MenuItem key={keyword} value={keyword} sx={{ fontSize: '12px' }}>
                                {keyword}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* 위키 검색 에러가 있으면 에러 메시지 표시 */}
            {wikiError && <div>Error: {wikiError}</div>}
            {/* 위키 검색 결과가 있으면 결과 표시 */}
            {searchCategory === 'summary' ? renderSummaryText() : renderWikiText()}
        </div>
    );
}

export default Keyword;
