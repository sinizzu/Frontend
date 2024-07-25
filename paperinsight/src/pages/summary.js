import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, ToggleButton, ToggleButtonGroup, LinearProgress } from '@mui/material';
import '../styles/main.css';

// env에 IP 가져오기
const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Summary({ pdfState }) {
    const pdf_id = pdfState.pdf_id || '';
    const region = pdfState.region || '';
    const [summary, setSummary] = useState(''); // summary 데이터를 저장할 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [language, setLanguage] = useState('en'); // 언어 상태
    const [tokenCount, setTokenCount] = useState(0); // 토큰 수 저장할 상태
    const [estimatedTime, setEstimatedTime] = useState(0); // 추정 시간을 저장할 상태
    const [progress, setProgress] = useState(0); // 로딩 진행률
    const [userSelectedLanguage, setUserSelectedLanguage] = useState(null); // 사용자 선택 언어 상태

    // Function to count tokens in a text
    const countTokens = (text) => {
        return text.split(/\s+/).filter(token => token.length > 0).length;
    };

    // Function to estimate time based on token count
    const estimateTime = (tokenCount) => {
        const averageTimePerToken = 85 / 6943; // seconds per token
        return tokenCount * averageTimePerToken; // total estimated time in seconds
    };

    // Update progress periodically based on estimated time
    useEffect(() => {
        let interval;
        if (loading && estimatedTime > 0) {
            const startTime = performance.now();
            interval = setInterval(() => {
                const elapsedTime = (performance.now() - startTime) / 1000; // convert to seconds
                const newProgress = Math.min((elapsedTime / estimatedTime) * 100, 100); // calculate progress percentage
                setProgress(newProgress);
                if (newProgress >= 100) {
                    clearInterval(interval);
                }
            }, 100); // update progress every 100ms
        }
        return () => clearInterval(interval);
    }, [loading, estimatedTime]);

    // Fetch the summary based on the selected language
    const fetchSummary = async (lang) => {
        setLoading(true);
        setProgress(0); // Reset progress
        try {
            let response = null;
            let languageResponse = await axios.get(`${MainFastAPI}/api/weaviate/searchFulltext?pdf_id=${pdf_id}`);
            const detectedLanguage = languageResponse.data.language;
            const full_text = languageResponse.data.full_text;

            const summary = (await axios.get(`${MainFastAPI}/api/weaviate/searchSummary?pdf_id=${pdf_id}`)).data.data;
            const transelateSummary = (await axios.get(`${MainFastAPI}/api/weaviate/searchTranslateSummary?pdf_id=${pdf_id}`)).data.data;
            console.log("Summary:", summary, "Transelate Summary:", transelateSummary);
            if (summary.includes("No summary available") || transelateSummary.includes("No translated summary available")) {
                const tokens = countTokens(full_text);
                setTokenCount(tokens); // Set token count
                setEstimatedTime(estimateTime(tokens)); // Set estimated time
            } else {
                setEstimatedTime(3.00);
            }

            if (!userSelectedLanguage) {
                setLanguage(detectedLanguage);
            }

            if (lang === 'en') {
                const startTime = performance.now(); // Start timing
                if (region === 'search') {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPaper?pdf_id=${pdf_id}`);
                } else {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPdf?pdf_id=${pdf_id}`);
                }
                const endTime = performance.now(); // End timing
                const duration = (endTime - startTime) / 1000; // Calculate duration in seconds
                console.log(`Request to summaryPaper/summaryPdf took ${duration.toFixed(2)} seconds.`);
            } else if (lang === 'ko') {
                response = await axios.get(`${MainFastAPI}/api/translate/transelateSummary?pdf_id=${pdf_id}`);
            } else if (detectedLanguage === "kr") {
                response = await axios.get(`${SubFastAPI}/api/summary/summaryPdf?pdf_id=${pdf_id}`);
            }
            if (response && response.data) {
                console.log("Summary Response:", response.data.summary);
                setSummary(response.data.summary); // Adjust based on response structure
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            setError(error);
        } finally {
            // Ensure progress is set to 100% when loading finishes
            setTimeout(() => {
                setProgress(100);
                setLoading(false);
            }, 1000); // 1 second delay before setting progress to 100%
        }
    };

    // Fetch the summary on component mount or when language changes
    useEffect(() => {
        fetchSummary(language);
    }, [pdf_id, region, language]);

    // 언어 토글 버튼 핸들러
    const handleLanguageChange = (event, newLanguage) => {
        if (newLanguage !== null) {
            setUserSelectedLanguage(newLanguage);
            setLanguage(newLanguage);
        }
    };

    // 데이터 로딩 중이면 로딩 표시
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                {/* <Typography variant="body1" sx={{ ml: 2 }}>요약 진행 중... (예상 시간: {estimatedTime.toFixed(2)} 초)</Typography> */}
                <Typography variant="body1" sx={{ ml: 2 }}>요약 진행 중...</Typography>
                <Box sx={{ width: '70%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>{Math.round(progress)}%</Typography>
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

    // UI 렌더링
    return (
        <div>
            <Box display="block" width="100%">
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <h1 style={{ margin: 0 }}>Summary</h1>
                </Box>
                <Box display="flex" justifyContent="flex-end" alignItems="center" width="100%">
                    {language !== 'kr' && (
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
            </Box >
            <Box className='drive-container' sx={{ maxHeight: 550, overflowY: 'auto', overflowX: 'hidden', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1">{summary}</Typography>
            </Box>
        </div>
    );
}

export default Summary;
