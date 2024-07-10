import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Popover, Button } from '@mui/material';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFPreview = ({ pdfUrl }) => {
  const [jhIp, setJhIp] = useState(process.env.REACT_APP_JH_IP);
  const [selectedText, setSelectedText] = useState('');
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [referenceElement, setReferenceElement] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchResult, setSearchResult] = useState('');
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!jhIp) {
      setJhIp(process.env.REACT_APP_JH_IP);
    }
  }, [jhIp]);

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
  };

  const handleWebSearch = async () => {
    setSearchResult(''); // Reset search result before making a new request

    try {
      const response = await fetch(`http://${jhIp}:3000/search/searchWeb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedResult = data.result.map(result => 
          `<li><a href="${result.link}" class="search-link" target="_blank">${result.title}</a></li>`
        ).join('');
        const resultHtml = `
          <div style="font-size: larger; font-weight: bold;">${selectedText}</div>
          <ul>${formattedResult}</ul>
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

  const open = Boolean(anchorEl);
  const searchOpen = Boolean(searchAnchorEl);
  const id = open ? 'simple-popover' : undefined;
  const searchId = searchOpen ? 'search-popover' : undefined;

  return (
    <div style={{ height: '100vh', position: 'relative' }} ref={viewerRef} onMouseUp={(e) => {
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
    </div>
  );
};

export default PDFPreview;
