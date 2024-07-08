import React from 'react';

const PDFPreview = ({ pdfUrl }) => {
  return (
    <div>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          title="PDF Preview"
        />
      ) : (
        <p>No PDF selected</p>
      )}
    </div>
  );
};

export default PDFPreview;
