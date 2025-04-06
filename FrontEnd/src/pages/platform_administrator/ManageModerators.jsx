"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Flag, UserPlus, Loader2, Search, MoreHorizontal } from "lucide-react"
import { toast } from "react-toastify"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

export default function ManageModerators() {
  const [moderators, setModerators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddModeratorOpen, setIsAddModeratorOpen] = useState(false)
  const [isFlagOpen, setIsFlagOpen] = useState(false)
  const [selectedModerator, setSelectedModerator] = useState(null)
  const [newModeratorData, setNewModeratorData] = useState({
    username: "",
    email: "",
    password: "",
    role_id: 5,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredModerators, setFilteredModerators] = useState([])
  const [flagReason, setFlagReason] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    fetchModerators()
  }, [])

  useEffect(() => {
    // Filter moderators based on search query
    if (searchQuery.trim() === "") {
      setFilteredModerators(moderators)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = moderators.filter(
        (moderator) =>
          moderator.username.toLowerCase().includes(query) || moderator.email.toLowerCase().includes(query),
      )
      setFilteredModerators(filtered)
    }
  }, [moderators, searchQuery])

  const fetchModerators = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/moderators/`, {
        headers: {
          Authorization: token,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch moderators")
      }
      const moderatorsData = await response.json()

      const detailedModerators = await Promise.all(
        moderatorsData.map(async (moderator) => {
          const userResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/${moderator.user_id}`, {
            headers: {
              Authorization: token,
            },
          })
          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user info for moderator ${moderator.moderator_id}`)
          }
          const userData = await userResponse.json()
          return {
            ...moderator,
            ...userData,
          }
        }),
      )

      setModerators(detailedModerators)
      setFilteredModerators(detailedModerators)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      toast.error("Failed to load moderators. Please try again later.")
    }
  }

  const handleAddModerator = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ ...newModeratorData, role_id: 5 }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add moderator")
      }
      await fetchModerators()
      setIsAddModeratorOpen(false)
      setNewModeratorData({ username: "", email: "", password: "", role_id: 5 })
      toast.success("Moderator added successfully")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleFlag = (moderator) => {
    setSelectedModerator(moderator)
    setIsFlagOpen(true)
  }

  const confirmFlag = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/moderators/${selectedModerator.moderator_id}/flag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ reason: flagReason, password }),
        },
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to flag moderator")
      }
      await fetchModerators()
      setIsFlagOpen(false)
      setFlagReason("")
      setPassword("")
      toast.success("Moderator flagged successfully")
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading moderators...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button
            onClick={fetchModerators}
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
        <h1 className="text-3xl font-bold">Manage Moderators</h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search moderators..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModeratorOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Moderator
          </Button>
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
            {filteredModerators.length > 0 ? (
              filteredModerators.map((moderator) => (
                <TableRow key={moderator.moderator_id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{moderator.username}</TableCell>
                  <TableCell>{moderator.email}</TableCell>
                  <TableCell>
                    <Badge variant={moderator.is_flagged ? "destructive" : "success"}>
                      {moderator.is_flagged ? "Flagged" : "Active"}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleFlag(moderator)}>
                          <Flag className="mr-2 h-4 w-4 text-amber-600" />
                          Flag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No moderators found matching your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddModeratorOpen} onOpenChange={setIsAddModeratorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Moderator</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddModerator}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newModeratorData.username}
                  onChange={(e) => setNewModeratorData({ ...newModeratorData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newModeratorData.email}
                  onChange={(e) => setNewModeratorData({ ...newModeratorData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newModeratorData.password}
                  onChange={(e) => setNewModeratorData({ ...newModeratorData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModeratorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Moderator</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Moderator Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="flagReason">Reason for flagging (optional)</Label>
              <Textarea
                id="flagReason"
                placeholder="Enter reason for flagging"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Your Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmFlag}>Flag Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

