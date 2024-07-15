import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { MenuItem, FormControl, Select, Typography, Button } from '@mui/material';

// env에 IP 가져오기
const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Keyword() {
    const location = useLocation();
    const title = location.state?.title || '';
    
    const [searchCategory, setSearchCategory] = useState('summary'); // 기본값을 'summary'로 설정
    const [keywords, setKeywords] = useState({}); // 키워드 목록 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [wikiResult, setWikiResult] = useState(null); // 위키 결과 상태
    const [wikiLoading, setWikiLoading] = useState(false); // 위키 검색 로딩 상태
    const [wikiError, setWikiError] = useState(null); // 위키 검색 에러 상태
    const [showLength, setShowLength] = useState(200); // 표시할 텍스트 길이 상태

    // Fetch the summary on component mount
    useEffect(() => {
        if (title) {
            const fetchSummary = async () => {
                try {
                    const response = await axios.get(`${SubFastAPI}/api/summary/summaryPaper?title=${title}`);
                    setWikiResult(response.data.data.text);
                    setLoading(false);
                } catch (error) {
                    setError(error);
                    setLoading(false);
                }
            };
            fetchSummary();
        } else {
            setLoading(false);
        }
    }, [title]);

    // 검색 카테고리 변경 시 처리
    const handleCategoryChange = async (event) => {
        const selectedKeyword = event.target.value;
        setSearchCategory(selectedKeyword);
        setWikiLoading(true);
        setWikiError(null);
        setShowLength(700); // 초기 길이로 설정

        if (selectedKeyword !== 'summary') {
            try {
                const response = await axios.get(`${MainFastAPI}/search/wikiSearch?query=${selectedKeyword}`);
                if (response.data.result.resultCode === 200) {
                    setWikiResult(response.data.result.data.text);
                } else {
                    throw new Error(response.data.result.data.message || 'No data found in wiki response');
                }
            } catch (error) {
                console.error('Error fetching wiki data:', error);
                setWikiError(error.response?.data?.result?.data?.message || 'An error occurred');
            } finally {
                setWikiLoading(false);
            }
        } else {
            // 'summary' 선택 시 summary 데이터 사용
            setWikiResult(wikiResult);
            setWikiLoading(false);
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

    // 데이터 로딩 중이면 로딩 표시
    if (loading) {
        return <div>Loading...</div>;
    }

    // 에러가 발생하면 에러 메시지 표시
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // UI 렌더링
    return (
        <div>
            <h1>Preview</h1>
            <FormControl sx={{ mr: 1 }}>
                <Select
                    labelId="search-category-label"
                    id="search-category"
                    value={searchCategory}
                    onChange={handleCategoryChange}
                    sx={{ fontSize: '12px' }}
                >
                    <MenuItem value="summary" sx={{ fontSize: '12px' }}>summary</MenuItem>
                    {Object.entries(keywords).map(([keyword]) => (
                        <MenuItem key={keyword} value={keyword} sx={{ fontSize: '12px' }}>
                            {keyword}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* 위키 검색 로딩 중이면 로딩 표시 */}
            {wikiLoading && <div>Loading wiki data...</div>}
            {/* 위키 검색 에러가 있으면 에러 메시지 표시 */}
            {wikiError && <div>Error: {wikiError}</div>}
            {/* 위키 검색 결과가 있으면 결과 표시 */}
            {renderWikiText()}
        </div>
    );
}

export default Keyword;
