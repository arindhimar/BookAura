import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { Eye, Flag, Check, X } from "lucide-react"
import { toast } from "react-toastify"

export default function ManagePublishers() {
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPublisher, setSelectedPublisher] = useState(null)
  const [isViewBooksOpen, setIsViewBooksOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isFlagOpen, setIsFlagOpen] = useState(false)
  const [isUnflagOpen, setIsUnflagOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [flagReason, setFlagReason] = useState("")
  const [password, setPassword] = useState("")
  //const { toast } = useToast()

  useEffect(() => {
    fetchPublishers()
  }, [])

  const fetchPublishers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const publishersResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/publishers/`, {
        headers: {
          Authorization: ` ${token}`,
        },
      })
      if (!publishersResponse.ok) {
        throw new Error("Failed to fetch publishers")
      }
      const publishersData = await publishersResponse.json()

      const detailedPublishers = await Promise.all(
        publishersData.map(async (publisher) => {
          const userResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/${publisher.user_id}`, {
            headers: {
              Authorization: ` ${token}`,
            },
          })
          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user info for publisher ${publisher.publisher_id}`)
          }
          const userData = await userResponse.json()
          return {
            ...publisher,
            ...userData,
          }
        }),
      )

      setPublishers(detailedPublishers)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

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

  const performAction = async (action, data = {}) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/publishers/${selectedPublisher.publisher_id}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ` ${token}`,
          },
          body: JSON.stringify({
            ...data,
            password,
            publisher_id: selectedPublisher.publisher_id, // Add this line
          }),
        },
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} publisher`)
      }
      await fetchPublishers()
      toast.success(`Publisher ${action}ed successfully`)
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    }
  }

  const confirmApprove = async () => {
    const success = await performAction("approve")
    if (success) {
      setIsApproveOpen(false)
      setPassword("")
    }
  }

  const confirmReject = async () => {
    const success = await performAction("reject", { feedback })
    if (success) {
      setIsRejectOpen(false)
      setFeedback("")
      setPassword("")
    }
  }

  const confirmFlag = async () => {
    const success = await performAction("flag", { reason: flagReason })
    if (success) {
      setIsFlagOpen(false)
      setFlagReason("")
      setPassword("")
    }
  }

  const confirmUnflag = async () => {
    const success = await performAction("unflag")
    if (success) {
      setIsUnflagOpen(false)
      setPassword("")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Manage Publishers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publishers.map((publisher) => (
            <TableRow key={publisher.publisher_id}>
              <TableCell>{publisher.username}</TableCell>
              <TableCell>{publisher.email}</TableCell>
              <TableCell>
                <Badge variant={publisher.is_approved === 1 ? "success" : "warning"}>
                  {publisher.is_approved === 1 ? "Approved" : "Pending"}
                </Badge>
                {publisher.is_flagged === 1 && (
                  <Badge variant="destructive" className="ml-2">
                    Flagged
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewBooks(publisher)}>
                    <Eye className="h-4 w-4 mr-1" /> View Books
                  </Button>
                  {publisher.is_approved === 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleApprove(publisher)}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(publisher)}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {publisher.is_flagged === 0 ? (
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
            <DialogTitle>Books Published by {selectedPublisher?.username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>No books published yet.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Publisher</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve {selectedPublisher?.username}?</p>
          <Input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
          <Input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

