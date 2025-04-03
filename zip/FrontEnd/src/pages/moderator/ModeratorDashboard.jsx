import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { BookOpen, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Link } from "react-router-dom"

export default function ModeratorDashboard() {
  const [stats, setStats] = useState({
    pendingReviews: 0,
    completedReviews: 0,
    approvedBooks: 0,
    rejectedBooks: 0,
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/moderator/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Moderator Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Books</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedBooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Books</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedBooks}</div>
          </CardContent>
        </Card>
      </div>
      {/* <div className="flex flex-col md:flex-row gap-4">
        <Button asChild className="flex-1">
          <Link to="/moderator/content-moderation">View Content Moderation Challenges</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/moderator/settings">Moderator Settings</Link>
        </Button>
      </div> */}
    </div>
  )
}

