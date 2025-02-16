"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, VolumeIcon as VolumeUp, VolumeX, ZoomIn, ZoomOut } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const FullPageReader = ({ bookUrl, onClose, title, author }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [utterance, setUtterance] = useState(null)

  useEffect(() => {
    const synth = window.speechSynthesis
    const u = new SpeechSynthesisUtterance()
    setUtterance(u)

    return () => {
      synth.cancel()
    }
  }, [])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset)
  }

  const toggleTextToSpeech = () => {
    const synth = window.speechSynthesis

    if (isSpeaking) {
      synth.cancel()
    } else {
      utterance.text = "Reading " + title + " by " + author + ". Page " + pageNumber + " of " + numPages
      synth.speak(utterance)
    }

    setIsSpeaking(!isSpeaking)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div className="bg-white w-full h-full max-w-4xl max-h-full overflow-auto rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-4">
            <button onClick={() => setScale(scale + 0.1)} className="text-gray-600 hover:text-gray-800">
              <ZoomIn className="h-6 w-6" />
            </button>
            <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} className="text-gray-600 hover:text-gray-800">
              <ZoomOut className="h-6 w-6" />
            </button>
            <button onClick={toggleTextToSpeech} className="text-gray-600 hover:text-gray-800">
              {isSpeaking ? <VolumeX className="h-6 w-6" /> : <VolumeUp className="h-6 w-6" />}
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <Document file={bookUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center">
          <button
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button
            disabled={pageNumber >= numPages}
            onClick={() => changePage(1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default FullPageReader

