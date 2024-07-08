import React, { useState, useRef, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pdfjs } from 'react-pdf';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { usePopper } from 'react-popper';

const PDFViewerWithTextSelection = ({ file }) => {
    const [jhIp, setJhIp] = useState(process.env.REACT_APP_JH_IP);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [selectionText, setSelectionText] = useState('');
    const [showPopper, setShowPopper] = useState(false);
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, { placement: 'top' });

    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    useEffect(() => {
        if (!jhIp) {
            setJhIp(process.env.REACT_APP_JH_IP);
        }
    }, [jhIp]);

    const handleMouseUp = async (event) => {
        if (event.target.tagName === 'A') {
            return;
        }

        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText && jhIp) {
            setSelectionText(selectedText);
            setShowPopper(true);
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setReferenceElement({
                getBoundingClientRect: () => rect,
                clientWidth: rect.width,
                clientHeight: rect.height,
            });

            // 팝오버에 "web"과 "wiki" 버튼 표시
            const initialContent = `
                <div style="font-size: larger; font-weight: bold;">${selectedText}</div>
                <button id="web-button" class="custom-button">웹검색</button>
                <button id="wiki-button" class="custom-button">위키백과</button>
            `;
            setSelectionText(initialContent);

            // "web" 버튼 클릭 이벤트 핸들러 추가
            setTimeout(() => {
                const webButton = document.getElementById('web-button');
                if (webButton) {
                    webButton.onclick = async () => {
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
                                    `<li><a href="${result.link}" target="_blank" rel="noopener noreferrer">${result.title}</a></li>`
                                ).join('');
                                const resultHtml = `
                                    <div style="font-size: larger; font-weight: bold;">${selectedText}</div>
                                    <ul>${formattedResult}</ul>
                                `;
                                setSelectionText(resultHtml);  // 서버의 응답을 팝오버에 표시
                            } else {
                                console.error('Error fetching data:', response.statusText);
                            }
                        } catch (error) {
                            console.error('Error fetching data:', error);
                        }
                    };
                }

                const wikiButton = document.getElementById('wiki-button');
                if (wikiButton) {
                    wikiButton.onclick = () => {
                        alert('Wiki search is not implemented yet.');
                    };
                }
            }, 100);
        } else {
            setShowPopper(false);
        }
    };

    const handleClick = (event) => {
        if (event.target.tagName === 'A') {
            return;
        }
    };

    return (
        <div  style={{ height: '750px', maxWidth: '1000px', margin: '0 auto', overflow: 'hidden' }} onMouseUp={handleMouseUp} onClick={handleClick}>
            <Worker workerUrl="/pdf.worker.min.js">
                <Viewer fileUrl={file} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
            {showPopper && (
                <div ref={setPopperElement} style={styles.popper} {...attributes.popper} className="popper">
                    <div className="popper-content" dangerouslySetInnerHTML={{ __html: selectionText }} />  {/* 팝오버에 표시되는 텍스트 */}
                </div>
            )}
        </div>
    );
};

export default PDFViewerWithTextSelection;
