import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Flag, UserPlus } from "lucide-react"
import { toast } from "react-toastify"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"

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
    role_id:5 , 
  })
  
  const [flagReason, setFlagReason] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    fetchModerators()
  }, [])

  const fetchModerators = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/moderators/`, {
        headers: {
          Authorization: ` ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch moderators")
      }
      const moderatorsData = await response.json()
      console.log(moderatorsData)

      const detailedModerators = await Promise.all(
        moderatorsData.map(async (moderator) => {
          const userResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/${moderator.user_id}`, {
            headers: {
              Authorization: ` ${token}`,
            },
          })
          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user info for moderator ${publisher.moderator_id}`)
          }
          const userData = await userResponse.json()
          return {
            ...moderator,
            ...userData,
          }
        }),
      )


      setModerators(detailedModerators)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
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
          Authorization: `${token}`,
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
            Authorization: ` ${token}`,
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
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Manage Moderators</h1>
        <Button onClick={() => setIsAddModeratorOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Moderator
        </Button>
      </div>

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
          {moderators.map((moderator) => (
            <TableRow key={moderator.moderator_id}>
              <TableCell>{moderator.username}</TableCell>
              <TableCell>{moderator.email}</TableCell>
              <TableCell>
                <Badge variant={moderator.is_flagged ? "destructive" : "success"}>
                  {moderator.is_flagged ? "Flagged" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleFlag(moderator)}>
                  <Flag className="h-4 w-4 mr-1" /> Flag
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

