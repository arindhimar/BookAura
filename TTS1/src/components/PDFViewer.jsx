"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up pdf.worker.js (important for Vite)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function PDFViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [textContent, setTextContent] = useState("");

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const extractTextFromPage = async (pdf) => {
    const page = await pdf.getPage(currentPage);
    const textContent = await page.getTextContent();
    const extractedText = textContent.items.map((item) => item.str).join(" ");
    setTextContent(extractedText);
  };

  const handleTextToSpeech = () => {
    if (!textContent) return;
    const utterance = new SpeechSynthesisUtterance(textContent);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="pdf-viewer">
      <div className="controls mb-4">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage <= 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {numPages}
        </span>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numPages))} disabled={currentPage >= numPages}>
          Next
        </button>
        <button onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}>Zoom In</button>
        <button onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}>Zoom Out</button>
        <button onClick={handleTextToSpeech} disabled={!textContent}>
          🔊 Read Text
        </button>
      </div>

      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          pageNumber={currentPage}
          scale={scale}
          onLoadSuccess={extractTextFromPage}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
    </div>
  );
}
