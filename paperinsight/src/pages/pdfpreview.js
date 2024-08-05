import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Popover, Button } from '@mui/material';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import axios from 'axios';
import '../styles/main.css';

// env에 IP 가져오기
const MainFastAPI = process.env.REACT_APP_MainFastAPI;
const SubFastAPI = process.env.REACT_APP_SubFastAPI;

const PDFPreview = ({ pdfUrl }) => {
  const [selectedText, setSelectedText] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [referenceElement, setReferenceElement] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchResult, setSearchResult] = useState('');
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryAnchorEl, setSummaryAnchorEl] = useState(null);
  const [translateResult, setTranslateResult] = useState('');
  const [translateAnchorEl, setTranslateAnchorEl] = useState(null);
  const viewerRef = useRef(null);
  const [wikiResult, setWikiResult] = useState({ text: '', link: '' });
  const [language, setLanguage] = useState(''); // language 상태 추가
  const [isLoading, setIsLoading] = useState(false); // loading 상태 추가

  useEffect(() => {
    const handleLinkClick = (event) => {
      if (event.target.tagName === 'A' && event.target.classList.contains('search-link')) {
        event.preventDefault();
        const url = event.target.getAttribute('href');
        window.open(url, '_blank');
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [selectedText]);

  const TypingAnimation = ({color = 'white'}) => (
    <div className="typing-animation">
      <i className="fas fa-circle small-icon" style={{ color }}></i>
      <i className="fas fa-circle small-icon" style={{ color }}></i>
      <i className="fas fa-circle small-icon" style={{ color }}></i>
    </div>
  );

  const handleTextSelection = async (event) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      const tokens = text.split(/\s+/); // Count the tokens (words)
      setTokenCount(tokens.length);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setReferenceElement({
        getBoundingClientRect: () => rect,
        clientWidth: rect.width,
        clientHeight: rect.height,
      });

      setAnchorEl(event.target);

      try {
        const response = await axios.post(`${MainFastAPI}/api/translate/checkLanguage`, 
          { text },
          { headers: { 'Content-Type': 'application/json' } }
        );
        setLanguage(response.data.lang);
      } catch (error) {
        console.error('Error fetching language:', error);
      }

    } else {
      setReferenceElement(null);
      setAnchorEl(null);
      setLanguage(''); // 선택 해제 시 language 초기화
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchAnchorEl(null);
    setSummaryAnchorEl(null);
    setTranslateAnchorEl(null);
  };

  const handleWebSearch = async () => {
    setSearchResult(''); // Reset search result before making a new request
  
    try {
      const response = await axios.post(`${MainFastAPI}/api/search/searchWeb`, 
        { text: selectedText },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.status === 200) {
        const data = response.data;
        const formattedResult = data.result.map(result => 
          `<li class="search-item">
            <a href="${result.link}" class="search-link" target="_blank">
              <div class="search-item-header">
                ${result.image ? `<img src="${result.image}" alt="${result.title}" class="search-image">` : ''}
                <div class="search-item-content">
                  ${result.title}
                </div>
              </div>
              ${result.snippet ? `<p class="search-snippet">${result.snippet}</p>` : ''}
            </a>
          </li>`
        ).join('');
        const resultHtml = `
          <div style="font-size: 18px; font-weight: bold; padding-top: 20px;">🔎구글 검색 &lt;${selectedText}&gt;</div>
          <ul class="spaced-ul">${formattedResult}</ul>
        `;
        setSearchResult(resultHtml);
        setSearchAnchorEl(anchorEl); // Set search popover anchor after receiving the response
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleWikiSearch = async () => {
    setSearchResult(''); // 새 요청 전 검색 결과 초기화
  
    try {
      const response = await axios.get(`${MainFastAPI}/api/search/wikiSearch`, {
        params: { keyword: selectedText, lang: language },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const { resultCode, data } = response.data;
      
      if (resultCode === 200) {
        // 성공 케이스 처리
        const sentences = data.text.split(/(?<=\.)\s+/);
        const initialText = sentences.slice(0, 10).join(' ');
        const remainingText = sentences.slice(10).join(' ');
        
        const formattedResult = `
          <li class="search-item">
            <div class="search-item-content">
              <p >Wikipedia: ${selectedText}</p>
              <a href="${data.link}" class="search-snippet" target="_blank">${data.link}</a>
            </div>
            <div>
              <p class="search-snippet" id="wikiText">${initialText}</p>
              <p class="search-snippet" id="remainingText" style="display: none;">${remainingText}</p>
            </div>
            ${remainingText ? '<button id="showMoreBtn" class="show-more-btn">더보기</button>' : ''}
          </li>
        `;
        
        const resultHtml = `
          <div style="font-size: 18px; font-weight: bold; padding-top: 20px;">🔎위키피디아 검색 &lt;${selectedText}&gt;</div>
          <ul class="spaced-ul">${formattedResult}</ul>
        `;
        
        setSearchResult(resultHtml);
        setSearchAnchorEl(anchorEl);
  
        // 더보기 버튼 이벤트 리스너 추가
        setTimeout(() => {
          const showMoreBtn = document.getElementById('showMoreBtn');
          const remainingText = document.getElementById('remainingText');
          if (showMoreBtn && remainingText) {
            showMoreBtn.addEventListener('click', () => {
              remainingText.style.display = 'block';
              showMoreBtn.style.display = 'none';
            });
          }
        }, 0);
      } else if (resultCode === 404) {
        // 404 에러 처리
        const formattedResult = `
          <li class="search-item">
            <div class="search-item-header">
              <div class="search-item-content">
                Wikipedia: ${selectedText}
              </div>
            </div>
            <p class="search-snippet">위키 검색 결과가 없습니다.</p>
            <a href="${data.link}" class="search-link" target="_blank">직접 위키피디아에서 검색해보기</a>
          </li>
        `;
  
        const resultHtml = `
          <div style="font-size: 18px; font-weight: bold; padding-top: 20px;">🔎위키피디아 검색 &lt;${selectedText}&gt;</div>
          <ul class="spaced-ul">${formattedResult}</ul>
        `;
  
        setSearchResult(resultHtml);
        setSearchAnchorEl(anchorEl);
      } else {
        console.error('위키피디아 검색 중 오류 발생:', resultCode);
      }
    } catch (error) {
      console.error('위키피디아 검색 요청 실패:', error.message);
    }
  };

  const handleSummary = async () => {
    setIsLoading(true); // 로딩 시작
    setSummaryResult(''); // Reset summary result before making a new request

    try {
      const response = await axios.post(`${SubFastAPI}/api/summary/summaryScroll`,
        { text: selectedText, lang: language },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log(data)
        const summaryHtml = `
          <div style="font-size: 14px; font-weight: bold;"> 요약</div>
          <p style="font-size: 12px; line-height: 1.4;">${data.data}</p>
        `;
        setSummaryResult(summaryHtml);
        setSummaryAnchorEl(anchorEl); // Set summary popover anchor after receiving the response
      } else {
        console.error('Error fetching summary:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally{
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleTranslate = async () => {
    setTranslateResult(''); // Reset translate result before making a new request

    try {
      const response = await axios.post(`${MainFastAPI}/api/translate/transelate`,
        { text: selectedText, lang: language },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.resultCode === 200) {
        const data = response.data.data;
        console.log(data);
        const translateHtml = `
          <p style="font-size: 12px; line-height: 1.4;">${data}</p>
        `;
        setTranslateResult(translateHtml);
        setTranslateAnchorEl(anchorEl); // Set translate popover anchor after receiving the response
      } else {
        console.error('Error fetching translation:', response);
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
    }
  };

  const open = Boolean(anchorEl);
  const searchOpen = Boolean(searchAnchorEl);
  const summaryOpen = Boolean(summaryAnchorEl);
  const translateOpen = Boolean(translateAnchorEl);
  const id = open ? 'simple-popover' : undefined;
  const searchId = searchOpen ? 'search-popover' : undefined;
  const summaryId = summaryOpen ? 'summary-popover' : undefined;
  const translateId = translateOpen ? 'translate-popover' : undefined;

  return (
    <div style={{ height: '85vh', position: 'relative' }} ref={viewerRef} onMouseUp={(e) => {
      if (viewerRef.current && viewerRef.current.contains(e.target)) {
        handleTextSelection(e);
      }
    }}>

      {pdfUrl ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      ) : null}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorPosition={{ top: window.pageYOffset + anchorEl?.getBoundingClientRect().bottom || 0, 
                          left: anchorEl?.getBoundingClientRect().left || 0 }}
        sx={{
          '& .MuiPopover-paper': {
            width: '200px',
            padding: '8px', // 패딩을 줄여 전체 크기를 줄입니다
            backgroundColor: 'rgba(38, 38, 38, 0.9)',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'row',
            gap: '3px', // 버튼 간 간격을 더 줄입니다
            justifyContent: 'center',
          },
          '& .MuiButton-root': { // 모든 버튼에 적용될 스타일
            color: '#ffffff',
            backgroundColor: 'transparent',
            fontSize: '13px', // 폰트 크기를 더 줄입니다
            padding: '4px 8px', // 버튼 내부 패딩을 줄입니다
            minWidth: '40px', // 버튼의 최소 너비를 설정합니다
            '&:hover': { 
              color: '#000', 
              backgroundColor: '#d3d3d3' 
            },
          }
        }}
      >
        <Button
          id="web-search-button"
          variant="text"
          onClick={handleWebSearch}
        >
          구글
        </Button>
        <Button
          id="wiki-search-button"
          variant="text"
          onClick={handleWikiSearch}
          disabled={tokenCount > 2}
        >
          위키
        </Button>
        <Button
          id="summary-button"
          variant="text"
          onClick={handleSummary}
          disabled={tokenCount < 50 || tokenCount > 512 || isLoading}
        >
          {isLoading ? <TypingAnimation /> : '요약'}
        </Button>
        <Button
          id="translate-button"
          variant="text"
          onClick={handleTranslate}
          disabled={tokenCount > 512}
        >
          번역
        </Button>
      </Popover>
      <Popover
        id={searchId}
        open={searchOpen}
        anchorEl={searchAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: '400px',
            padding: '10px',
            backgroundColor: '#f2f2f2',
            border: '1px solid #ccc',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c8c8c8',
              borderRadius: '10px',
              '&:hover': {
                background: '#939393',
              },
            },
          },
        }}
      >
        {searchResult && <div dangerouslySetInnerHTML={{ __html: searchResult }} />}
      </Popover>
      <Popover
        id={summaryId}
        open={summaryOpen}
        anchorEl={summaryAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: '300px',
            padding: '10px',
            backgroundColor: '#f2f2f2',
            border: '1px solid #ccc',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c8c8c8',
              borderRadius: '10px',
              '&:hover': {
                background: '#939393',
              },
            },
          },
        }}
      >
        {summaryResult && <div dangerouslySetInnerHTML={{ __html: summaryResult }} />}
      </Popover>
      <Popover
        id={translateId}
        open={translateOpen}
        anchorEl={translateAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: '250px',
            padding: '10px',
            backgroundColor: '#f2f2f2',
            border: '1px solid #ccc',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c8c8c8',
              borderRadius: '10px',
              '&:hover': {
                background: '#939393',
              },
            },
          },
        }}
      >
        {translateResult && <div dangerouslySetInnerHTML={{ __html: translateResult }} />}
      </Popover>
    </div>
  );
};

export default PDFPreview;
