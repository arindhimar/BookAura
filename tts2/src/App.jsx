"use client"

import { useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function App() {
  const canvasRef = useRef(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Render the current page
  const renderPage = async (pageNumber) => {
    if (!pdfDoc) return

    try {
      setLoading(true)
      const page = await pdfDoc.getPage(pageNumber)
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      const viewport = page.getViewport({ scale })
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise
      setLoading(false)
    } catch (err) {
      setError("Error rendering page: " + err.message)
      setLoading(false)
    }
  }

  // Load PDF document
  const loadPDF = async (file) => {
    try {
      setLoading(true)
      setError(null)

      const fileUrl = URL.createObjectURL(file)
      const loadingTask = pdfjsLib.getDocument(fileUrl)
      const pdf = await loadingTask.promise

      setPdfDoc(pdf)
      setTotalPages(pdf.numPages)
      setPageNum(1)

      // Clean up the URL
      URL.revokeObjectURL(fileUrl)
    } catch (err) {
      setError("Error loading PDF: " + err.message)
      setLoading(false)
    }
  }

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === "application/pdf") {
      loadPDF(file)
    } else {
      setError("Please select a valid PDF file")
    }
  }

  // Navigation functions
  const nextPage = () => {
    if (pageNum < totalPages) {
      setPageNum(pageNum + 1)
    }
  }

  const prevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
    }
  }

  // Zoom functions
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5))

  // Render page when pageNum or scale changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum)
    }
  }, [pageNum, pdfDoc, scale])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Simple PDF Viewer</h1>

          {/* File input */}
          <Input type="file" accept=".pdf" onChange={handleFileChange} className="max-w-xs" />

          {error && <div className="text-destructive">{error}</div>}

          {/* Controls */}
          {pdfDoc && (
            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={prevPage} disabled={pageNum <= 1 || loading}>
                Previous
              </Button>

              <span className="mx-2">
                Page {pageNum} of {totalPages}
              </span>

              <Button onClick={nextPage} disabled={pageNum >= totalPages || loading}>
                Next
              </Button>

              <div className="ml-4 flex gap-2">
                <Button onClick={zoomOut} disabled={loading} variant="outline">
                  Zoom Out
                </Button>
                <Button onClick={zoomIn} disabled={loading} variant="outline">
                  Zoom In
                </Button>
              </div>

              <span className="ml-2">Zoom: {Math.round(scale * 100)}%</span>
            </div>
          )}

          {/* PDF Viewer */}
          <div className="relative border rounded-lg overflow-auto max-h-[80vh]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            <canvas ref={canvasRef} className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

