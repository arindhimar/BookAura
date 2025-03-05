"use client"

import { useState } from "react"
import PDFViewer from "./components/PDFViewer"
import Sidebar from "./components/Sidebar"
import TextToSpeech from "./components/TextToSpeech"
import SearchBar from "./components/SearchBar"
import SettingsPanel from "./components/SettingsPanel"

function App() {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [darkMode, setDarkMode] = useState(false)

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">PDF Reader</h1>
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="mb-4" />
        {pdfUrl && (
          <div className="flex">
            <Sidebar currentPage={currentPage} totalPages={totalPages} />
            <div className="flex-1">
              <div className="flex justify-between mb-4">
                <SearchBar />
                <SettingsPanel darkMode={darkMode} setDarkMode={setDarkMode} />
              </div>
              <PDFViewer
                pdfUrl={pdfUrl}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setTotalPages={setTotalPages}
                scale={scale}
                setScale={setScale}
              />
              <TextToSpeech />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

