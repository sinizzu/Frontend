import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, CircularProgress, LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import '../styles/main.css';

const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Summary({ pdfState }) {
    const pdf_id = pdfState.pdf_id || '';
    const region = pdfState.region || '';
    const [summary, setSummary] = useState(''); // summary 데이터를 저장할 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [loadingPercentage, setLoadingPercentage] = useState(0); // 로딩 퍼센트
    const [error, setError] = useState(null); // 에러 상태
    const [language, setLanguage] = useState('en'); // 언어 상태
    const [detectedLanguage, setDetectedLanguage] = useState(''); // 감지된 언어 상태

    // Fetch the detected language for the document
    const fetchDetectedLanguage = async () => {
        try {
            const response = await axios.get(`${MainFastAPI}/api/weaviate/searchFulltext?pdf_id=${pdf_id}`);
            setDetectedLanguage(response.data.language);
            setLoadingPercentage(30); // Detected language fetched, 30% progress
        } catch (error) {
            console.error("Error detecting language:", error);
            setError(error);
            setLoadingPercentage(100); // Error occurred, complete loading
        }
    };

    // Fetch the summary based on the selected language
    const fetchSummary = async (lang) => {
        setLoading(true);
        setLoadingPercentage(50); // Starting summary fetch, 50% progress
        try {
            let response = null;
            if (lang === 'en') {
                if (region === 'search') {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPaper?pdf_id=${pdf_id}`);
                } else {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPdf?pdf_id=${pdf_id}`);
                }
            } else if (lang === 'ko') {
                response = await axios.get(`${MainFastAPI}/api/translate/transelateSummary?pdf_id=${pdf_id}`);
            } else if (detectedLanguage === 'kr') {
                response = await axios.get(`${SubFastAPI}/api/summary/summaryPdf?pdf_id=${pdf_id}`);
            }
            setLoadingPercentage(80); // Summary fetch response received, 80% progress
            if (response && response.data) {
                console.log("Summary React Response:", response.data.summary);
                setSummary(response.data.summary); // Adjust based on response structure
                setLoadingPercentage(100); // Complete loading
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            setError(error);
            setLoadingPercentage(100); // Error occurred, complete loading
        } finally {
            setLoading(false);
        }
    };

    // Fetch the detected language and summary on component mount
    useEffect(() => {
        fetchDetectedLanguage();
    }, [pdf_id]);

    // Fetch the summary when language, pdf_id, or region changes
    useEffect(() => {
        if (pdf_id) {
            fetchSummary(language);
        }
    }, [pdf_id, region, language]);

    // 데이터 로딩 중이면 로딩 표시
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>요약 진행 중... {loadingPercentage}%</Typography>
                <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={loadingPercentage} />
                </Box>
            </Box>
        );
    }

    // 에러가 발생하면 에러 메시지 표시
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // 요약 데이터가 로드되지 않았을 때 아무 것도 표시하지 않음
    if (!summary) {
        return null;
    }

    // 언어 토글 버튼 핸들러
    const handleLanguageChange = (event, newLanguage) => {
        if (newLanguage !== null) {
            setLanguage(newLanguage);
        }
    };

    // UI 렌더링
    return (
        <div>
            <Box display="block" width="100%">
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <h1 style={{ margin: 0 }}>Summary</h1>
                </Box>
                <Box display="flex" justifyContent="flex-end" alignItems="center" width="100%">
                    {detectedLanguage !== 'kr' && (
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
                    )}
                </Box>
            </Box>
            <Box className='drive-container' sx={{ maxHeight: 550, overflowY: 'auto', overflowX: 'hidden', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1">{summary}</Typography>
            </Box>
        </div>
    );
}

export default Summary;
