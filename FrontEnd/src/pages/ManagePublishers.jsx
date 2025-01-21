import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { Eye, Flag, Check, X, Send } from "lucide-react"

const mockPublishers = [
  { id: 1, name: "Acme Publishing", status: "active", booksPublished: 15 },
  { id: 2, name: "Zenith Books", status: "pending", booksPublished: 0 },
  { id: 3, name: "Stellar Press", status: "active", booksPublished: 8 },
  { id: 4, name: "Novella Inc.", status: "flagged", booksPublished: 3 },
]

export default function ManagePublishers() {
  const [publishers, setPublishers] = useState(mockPublishers)
  const [selectedPublisher, setSelectedPublisher] = useState(null)
  const [isViewBooksOpen, setIsViewBooksOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isFlagOpen, setIsFlagOpen] = useState(false)
  const [isUnflagOpen, setIsUnflagOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [flagReason, setFlagReason] = useState("")
  const [password, setPassword] = useState("")

  const handleViewBooks = (publisher) => {
    setSelectedPublisher(publisher)
    setIsViewBooksOpen(true)
  }

  const handleApprove = (publisher) => {
    setSelectedPublisher(publisher)
    setIsApproveOpen(true)
  }

  const handleReject = (publisher) => {
    setSelectedPublisher(publisher)
    setIsRejectOpen(true)
  }

  const handleFlag = (publisher) => {
    setSelectedPublisher(publisher)
    setIsFlagOpen(true)
  }

  const handleUnflag = (publisher) => {
    setSelectedPublisher(publisher)
    setIsUnflagOpen(true)
  }

  const confirmApprove = () => {
    setPublishers(publishers.map((p) => (p.id === selectedPublisher.id ? { ...p, status: "active" } : p)))
    setIsApproveOpen(false)
  }

  const confirmReject = () => {
    setPublishers(publishers.map((p) => (p.id === selectedPublisher.id ? { ...p, status: "rejected" } : p)))
    setIsRejectOpen(false)
    setFeedback("")
  }

  const confirmFlag = () => {
    // In a real application, you would verify the password here
    setPublishers(publishers.map((p) => (p.id === selectedPublisher.id ? { ...p, status: "flagged" } : p)))
    setIsFlagOpen(false)
    setFlagReason("")
    setPassword("")
  }

  const confirmUnflag = () => {
    // In a real application, you would verify the password here
    setPublishers(publishers.map((p) => (p.id === selectedPublisher.id ? { ...p, status: "active" } : p)))
    setIsUnflagOpen(false)
    setPassword("")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Manage Publishers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Books Published</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publishers.map((publisher) => (
            <TableRow key={publisher.id}>
              <TableCell>{publisher.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    publisher.status === "active"
                      ? "success"
                      : publisher.status === "pending"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {publisher.status}
                </Badge>
              </TableCell>
              <TableCell>{publisher.booksPublished}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewBooks(publisher)}>
                    <Eye className="h-4 w-4 mr-1" /> View Books
                  </Button>
                  {publisher.status === "pending" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleApprove(publisher)}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(publisher)}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {publisher.status !== "flagged" ? (
                    <Button variant="outline" size="sm" onClick={() => handleFlag(publisher)}>
                      <Flag className="h-4 w-4 mr-1" /> Flag
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleUnflag(publisher)}>
                      <Flag className="h-4 w-4 mr-1" /> Unflag
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isViewBooksOpen} onOpenChange={setIsViewBooksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Books Published by {selectedPublisher?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPublisher?.booksPublished > 0 ? (
              <p>List of books would appear here.</p>
            ) : (
              <p>No books published yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Publisher</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve {selectedPublisher?.name}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Publisher</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Provide feedback for rejection"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReject}>Reject and Send Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Publisher Account</DialogTitle>
          </DialogHeader>
          <Input placeholder="Reason for flagging" value={flagReason} onChange={(e) => setFlagReason(e.target.value)} />
          <Input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmFlag}>Flag Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnflagOpen} onOpenChange={setIsUnflagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unflag Publisher Account</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnflagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnflag}>Unflag Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

