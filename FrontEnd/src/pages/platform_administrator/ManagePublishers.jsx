"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Flag, Check, X, Loader, Search, Filter, MoreHorizontal, BookOpen } from "lucide-react"
import { toast } from "react-toastify"
import { Textarea } from "../../components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select"

export default function ManagePublishers() {
  const [publishers, setPublishers] = useState([])
  const [filteredPublishers, setFilteredPublishers] = useState([])
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
  const [publisherBooks, setPublisherBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchPublishers()
  }, [])

  useEffect(() => {
    // Filter publishers based on search query and status filter
    let filtered = [...publishers]

    if (searchQuery) {
      filtered = filtered.filter(
        (publisher) =>
          publisher.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          publisher.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        filtered = filtered.filter((publisher) => publisher.is_approved === 1)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((publisher) => publisher.is_approved === 0)
      } else if (statusFilter === "flagged") {
        filtered = filtered.filter((publisher) => publisher.is_flagged === 1)
      }
    }

    setFilteredPublishers(filtered)
  }, [publishers, searchQuery, statusFilter])

  const fetchPublishers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const publishersResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/publishers/`, {
        headers: {
          Authorization: token,
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
              Authorization: token,
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
      setFilteredPublishers(detailedPublishers)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      toast.error("Failed to load publishers. Please try again later.")
    }
  }

  const fetchPublisherBooks = async (publisherId) => {
    try {
      setLoadingBooks(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/publisher/${publisherId}`, {
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch publisher books")
      }

      const data = await response.json()
      setPublisherBooks(data)
      setLoadingBooks(false)
    } catch (error) {
      console.error("Error fetching publisher books:", error)
      setPublisherBooks([])
      setLoadingBooks(false)
      toast.error("Failed to load publisher books. Please try again later.")
    }
  }

  const handleViewBooks = (publisher) => {
    setSelectedPublisher(publisher)
    fetchPublisherBooks(publisher.publisher_id)
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
            Authorization: token,
          },
          body: JSON.stringify({
            ...data,
            password,
            publisher_id: selectedPublisher.publisher_id,
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
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading publishers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button
            onClick={fetchPublishers}
            className="mt-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 font-semibold py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Publishers</h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search publishers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-40">
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>
                  {statusFilter === "all"
                    ? "All Status"
                    : statusFilter === "approved"
                      ? "Approved"
                      : statusFilter === "pending"
                        ? "Pending"
                        : "Flagged"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPublishers.length > 0 ? (
              filteredPublishers.map((publisher) => (
                <TableRow key={publisher.publisher_id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{publisher.username}</TableCell>
                  <TableCell>{publisher.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={publisher.is_approved === 1 ? "success" : "warning"} className="capitalize">
                        {publisher.is_approved === 1 ? "Approved" : "Pending"}
                      </Badge>
                      {publisher.is_flagged === 1 && (
                        <Badge variant="destructive" className="ml-2">
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewBooks(publisher)}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          View Books
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {publisher.is_approved === 0 && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(publisher)}>
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(publisher)}>
                              <X className="mr-2 h-4 w-4 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {publisher.is_flagged === 0 ? (
                          <DropdownMenuItem onClick={() => handleFlag(publisher)}>
                            <Flag className="mr-2 h-4 w-4 text-amber-600" />
                            Flag
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnflag(publisher)}>
                            <Flag className="mr-2 h-4 w-4 text-green-600" />
                            Unflag
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No publishers found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewBooksOpen} onOpenChange={setIsViewBooksOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Books Published by {selectedPublisher?.username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingBooks ? (
              <div className="flex justify-center items-center h-20">
                <Loader className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading books...</span>
              </div>
            ) : publisherBooks.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publisherBooks.map((book) => (
                    <TableRow key={book.book_id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>
                        <Badge variant={book.is_approved ? "success" : "warning"}>
                          {book.is_approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>{book.views || 0}</TableCell>
                      <TableCell>{new Date(book.uploaded_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-2 opacity-50" />
                <p>No books published yet.</p>
              </div>
            )}
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
          <Textarea
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
          <Textarea
            placeholder="Reason for flagging"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
          />
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

