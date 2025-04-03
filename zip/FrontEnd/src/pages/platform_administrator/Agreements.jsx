import { useState, useMemo } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

export default function Agreements() {
  const [agreements, setAgreements] = useState({
    publisher: "",
    author: "",
    user: "",
  })
  const [currentAgreement, setCurrentAgreement] = useState("publisher")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    [],
  )

  const handleAgreementChange = (content) => {
    setAgreements((prev) => ({
      ...prev,
      [currentAgreement]: content,
    }))
  }

  const handleSave = () => {
    // In a real application, you would save the agreement to your backend here
    console.log(`Saved ${currentAgreement} agreement:`, agreements[currentAgreement])
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Manage Agreements</h1>

      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => setCurrentAgreement("publisher")}
          variant={currentAgreement === "publisher" ? "default" : "outline"}
        >
          Publisher Agreement
        </Button>
        <Button
          onClick={() => setCurrentAgreement("author")}
          variant={currentAgreement === "author" ? "default" : "outline"}
        >
          Author Agreement
        </Button>
        <Button
          onClick={() => setCurrentAgreement("user")}
          variant={currentAgreement === "user" ? "default" : "outline"}
        >
          User Agreement
        </Button>
      </div>

      <ReactQuill
        theme="snow"
        value={agreements[currentAgreement]}
        onChange={handleAgreementChange}
        modules={modules}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4"
        style={{ height: "400px", marginBottom: "50px" }}
      />

      <div className="flex justify-end space-x-4 mt-16">
        <Button onClick={() => setIsPreviewOpen(true)}>Preview</Button>
        <Button onClick={handleSave}>Save Agreement</Button>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentAgreement.charAt(0).toUpperCase() + currentAgreement.slice(1)} Agreement Preview
            </DialogTitle>
          </DialogHeader>
          <div
            className="mt-4 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: agreements[currentAgreement] }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

