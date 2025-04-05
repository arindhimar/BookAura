"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Book, Users, Loader, Eye, Clock, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

export default function PublisherDashboard() {
  const [analytics, setAnalytics] = useState({
    total_books: 0,
    total_readers: 0,
    total_views: 0,
    monthly_revenue: [],
    view_distribution: [],
    recent_readers: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPublisherAnalytics()
  }, [])

  const fetchPublisherAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/")
        return
      }

      // First get the publisher ID
      const userResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/me`, {
        headers: {
          Authorization: token,
        },
      })

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data")
      }

      const userData = await userResponse.json()
      const userId = userData.user.user_id

      // Get publisher info
      const publisherResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/publishers/user/${userId}`, {
        headers: {
          Authorization: token,
        },
      })

      if (!publisherResponse.ok) {
        throw new Error("Failed to fetch publisher data")
      }

      const publisherData = await publisherResponse.json()
      const publisherId = publisherData.publisher_id

      // Get analytics
      const analyticsResponse = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/publishers/${publisherId}/analytics`,
        {
          headers: {
            Authorization: token,
          },
        },
      )

      if (!analyticsResponse.ok) {
        throw new Error("Failed to fetch analytics data")
      }

      const analyticsData = await analyticsResponse.json()
      setAnalytics(analyticsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching publisher analytics:", error)
      setError(error.message)
      setLoading(false)
      toast.error("Failed to load dashboard data. Please try again later.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button
            onClick={fetchPublisherAnalytics}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Prepare data for doughnut chart
  const chartData = {
    labels: analytics.view_distribution?.map((item) => item.name) || [],
    datasets: [
      {
        data: analytics.view_distribution?.map((item) => item.views) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Publisher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your content performance.</p>
        </div>
        <button
          onClick={() => navigate("/publisher/analytics")}
          className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all"
        >
          View Detailed Analytics
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books Published</CardTitle>
            <Book className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{analytics.total_books}</div>
            <p className="text-xs text-blue-600 mt-1">Your published content</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readers</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{analytics.total_readers}</div>
            <p className="text-xs text-green-600 mt-1">Unique readers of your books</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{analytics.total_views}</div>
            <p className="text-xs text-purple-600 mt-1">Total views across all books</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Book Performance</CardTitle>
            <CardDescription>View distribution across your top books</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {analytics.view_distribution && analytics.view_distribution.length > 0 ? (
              <div className="w-full max-w-xs">
                <Doughnut
                  data={chartData}
                  options={{
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          boxWidth: 12,
                        },
                      },
                    },
                    cutout: "65%",
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-2 opacity-50" />
                <p>No view data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest readers of your books</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recent_readers && analytics.recent_readers.length > 0 ? (
              <div className="space-y-4">
                {analytics.recent_readers.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.reader} read <span className="font-semibold">{activity.book}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Users className="h-10 w-10 mb-2 opacity-50" />
                <p>No recent activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

