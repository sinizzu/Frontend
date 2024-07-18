import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box } from '@mui/material';
import { ClipLoader } from 'react-spinners';

// env에 IP 가져오기
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

function Summary({ pdfState }) {
    const pdf_id = pdfState.pdf_id || '';
    const region = pdfState.region || '';
    const [summary, setSummary] = useState(''); // summary 데이터를 저장할 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // Fetch the summary on component mount
    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                let response = null;
                console.log("region:", region);
                if (region === 'search') {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPaper?pdf_id=${pdf_id}`);
                } else {
                    response = await axios.get(`${SubFastAPI}/api/summary/summaryPdf?pdf_id=${pdf_id}`);
                }
                console.log("Summary Data:", response.data);
                setSummary(response.data.summary);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [pdf_id, region]);

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

    // UI 렌더링
    return (
        <div>
            <h1>Summary</h1>
            <Typography variant="body1">{summary}</Typography>
        </div>
    );
}

export default Summary;
