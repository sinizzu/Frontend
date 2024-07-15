import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Popover, Button } from '@mui/material';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import axios from 'axios';

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
  const viewerRef = useRef(null);

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

  const handleTextSelection = (event) => {
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
    } else {
      setReferenceElement(null);
      setAnchorEl(null);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchAnchorEl(null);
    setSummaryAnchorEl(null);
  };

  const handleWebSearch = async () => {
    setSearchResult(''); // Reset search result before making a new request
  
    try {
      const response = await axios.post(`${MainFastAPI}/api/keyword/searchWeb`, 
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
          <div style="font-size: 20px; font-weight: bold;">Search results for "${selectedText}"</div>
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

  const handleSummary = async () => {
    setSummaryResult(''); // Reset summary result before making a new request

    try {
      const response = await axios.post(`${SubFastAPI}/api/summary/summaryScroll`,
        { text: selectedText },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        const data = response.data;
        const summaryHtml = `
          <div style="font-size: 14px; font-weight: bold;">Summary for "${selectedText}"</div>
          <p style="font-size: 12px; line-height: 1.4;">${data.summary}</p>
        `;
        setSummaryResult(summaryHtml);
        setSummaryAnchorEl(anchorEl); // Set summary popover anchor after receiving the response
      } else {
        console.error('Error fetching summary:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const open = Boolean(anchorEl);
  const searchOpen = Boolean(searchAnchorEl);
  const summaryOpen = Boolean(summaryAnchorEl);
  const id = open ? 'simple-popover' : undefined;
  const searchId = searchOpen ? 'search-popover' : undefined;
  const summaryId = summaryOpen ? 'summary-popover' : undefined;

  return (
    <div style={{ height: '100vh', position: 'relative' }} ref={viewerRef} onMouseUp={(e) => {
      if (viewerRef.current && viewerRef.current.contains(e.target)) {
        handleTextSelection(e);
      }
    }}>
      <style>
        {`
        .search-link {
            text-decoration: none;
            color: inherit;
            font-weight: bold;
        }
        .search-link:hover {
            text-decoration: underline;
            cursor: pointer;
        }
        .search-link .search-image,
        .search-link .search-snippet,
        .search-link .search-item-content {
            display: inline-block;
            vertical-align: middle;
        }
        .search-snippet {
            font-size: 1em;
            font-weight: normal;
            color: #4d5156;
            margin-top: 5px;
        }
        .search-image {
            max-width: 60px;
            max-height: 60px;
            width: auto;
            height: auto;
            margin-right: 10px;
        }
        .search-item {
            display: flex;
            flex-direction: column; /* 세로 방향으로 정렬 */
            margin-bottom: 20px;
            border-bottom: 1px solid #ccc;
        }
        .search-item-header {
            display: flex;
            align-items: flex-start;
        }
        .search-item-content {
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .spaced-ul {
            margin-top: 35px;
          }
        `}
      </style>

      {pdfUrl ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      ) : (
        <p>No PDF selected</p>
      )}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
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
            width: '200px',
            padding: '10px',
            backgroundColor: '#FFFFE1',
            border: '1px solid #ccc',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            justifyContent: 'center',
          },
        }}
      >
        <Button
          id="web-search-button"
          variant="text"
          sx={{
            color: '#000',
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: '#d3d3d3' },
            fontSize: '14px',
          }}
          onClick={handleWebSearch}
        >
          웹 검색
        </Button>
        <Button
          id="wiki-search-button"
          variant="text"
          sx={{
            color: '#000',
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: '#d3d3d3' },
            fontSize: '14px',
          }}
          onClick={() => window.open(`https://en.wikipedia.org/wiki/${selectedText}`)}
        >
          위키 검색
        </Button>
        <Button
          id="summary-button"
          variant="text"
          sx={{
            color: '#000',
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: '#d3d3d3' },
            fontSize: '14px',
          }}
          onClick={handleSummary}
          disabled={tokenCount < 50 || tokenCount > 512}
        >
          요약
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
            width: '500px',
            padding: '10px',
            backgroundColor: '#FFFFE1',
            border: '1px solid #ccc',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
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
            height: '200px',
            padding: '10px',
            backgroundColor: '#FFFFE1',
            border: '1px solid #ccc',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
            overflowY: 'auto',
            fontSize: '12px', // Set font size for summary text
          },
        }}
      >
        {summaryResult && <div dangerouslySetInnerHTML={{ __html: summaryResult }} />}
      </Popover>
    </div>
  );
};

export default PDFPreview;
