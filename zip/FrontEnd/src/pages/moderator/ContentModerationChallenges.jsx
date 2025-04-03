import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { toast } from "react-toastify"

export default function ContentModerationChallenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComment, setReviewComment] = useState("")

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/moderator/content-challenges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch content moderation challenges")
      }
      const data = await response.json()
      setChallenges(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleReview = (challenge) => {
    setSelectedChallenge(challenge)
    setIsReviewOpen(true)
  }

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/moderator/content-challenges/${selectedChallenge.id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            decision: reviewDecision,
            comment: reviewComment,
          }),
        },
      )
      if (!response.ok) {
        throw new Error("Failed to submit review")
      }
      toast.success("Review submitted successfully")
      setIsReviewOpen(false)
      setReviewDecision("")
      setReviewComment("")
      fetchChallenges()
    } catch (err) {
      toast.error(err.message)
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
      <h1 className="text-3xl font-bold mb-6">Content Moderation Challenges</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Rejection Reason</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>{challenge.book_title}</TableCell>
              <TableCell>{challenge.author_name}</TableCell>
              <TableCell>{challenge.rejection_reason}</TableCell>
              <TableCell>
                <Button onClick={() => handleReview(challenge)}>Review</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Content Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="book-title">Book Title</Label>
              <Input id="book-title" value={selectedChallenge?.book_title || ""} disabled />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={selectedChallenge?.author_name || ""} disabled />
            </div>
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Input id="rejection-reason" value={selectedChallenge?.rejection_reason || ""} disabled />
            </div>
            <div>
              <Label htmlFor="decision">Decision</Label>
              <select
                id="decision"
                className="w-full p-2 border rounded"
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value)}
              >
                <option value="">Select a decision</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Enter your review comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

