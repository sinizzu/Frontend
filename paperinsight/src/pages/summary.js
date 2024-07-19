import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ClipLoader } from 'react-spinners';

// env에 IP 가져오기
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Summary({ pdfState }) {
    const pdf_id = pdfState.pdf_id || '';
    const region = pdfState.region || '';
    const [summary, setSummary] = useState(''); // summary 데이터를 저장할 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [language, setLanguage] = useState('en'); // 언어 상태

    // Fetch the summary based on the selected language
    const fetchSummary = async (lang) => {
        setLoading(true);
        try {
            let response = null;
            if (lang === 'en') {
                if (region === 'search') {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPaper?pdf_id=${pdf_id}`);
                } else {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPdf?pdf_id=${pdf_id}`);
                }
            } else if (lang === 'ko') {
                response = await axios.get(`${SubFastAPI}/api/translate/transelateSummary?pdf_id=${pdf_id}`);
            }
            console.log("Summary Data:", response.data.data);
            setSummary(response.data.summary || response.data.data); // Adjust based on response structure
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch the summary on component mount or when language changes
    useEffect(() => {
        fetchSummary(language);
    }, [pdf_id, region, language]);

    // 데이터 로딩 중이면 로딩 표시
    if (loading) {
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
            <Typography variant="body1">{summary}</Typography>
        </div>
    );
}

export default Summary;
