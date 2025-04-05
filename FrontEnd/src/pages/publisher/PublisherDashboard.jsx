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
      setLoading(true)
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
        const errorData = await analyticsResponse.json()
        throw new Error(errorData.message || "Failed to fetch analytics data")
      }

      const analyticsData = await analyticsResponse.json()

      // Ensure we have all the expected properties with fallbacks
      const processedData = {
        total_books: analyticsData.total_books || 0,
        total_readers: analyticsData.total_readers || 0,
        total_views: analyticsData.total_views || 0,
        monthly_revenue: analyticsData.monthly_revenue || [],
        view_distribution: analyticsData.view_distribution || [],
        recent_readers: analyticsData.recent_readers || [],
      }

      setAnalytics(processedData)
      setError(null)
    } catch (error) {
      console.error("Error fetching publisher analytics:", error)
      setError(error.message)

      // Set fallback data
      setAnalytics({
        total_books: 0,
        total_readers: 0,
        total_views: 0,
        monthly_revenue: generateSampleMonthlyData(),
        view_distribution: [],
        recent_readers: [],
      })

      toast.error("Failed to load dashboard data. Using sample data instead.")
    } finally {
      setLoading(false)
    }
  }

  // Generate sample monthly data for fallback
  const generateSampleMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const sampleValues = [1200, 1500, 1800, 2200, 2500, 2800]

    return months.map((month, index) => ({
      name: month,
      total: sampleValues[index],
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  // Prepare data for doughnut chart with improved colors for better contrast
  const chartData = {
    labels: analytics.view_distribution?.map((item) => item.name) || [],
    datasets: [
      {
        data: analytics.view_distribution?.map((item) => item.views) || [],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)", // Indigo
          "rgba(236, 72, 153, 0.8)", // Pink
          "rgba(245, 158, 11, 0.8)", // Amber
          "rgba(16, 185, 129, 0.8)", // Emerald
          "rgba(99, 102, 241, 0.8)", // Indigo lighter
        ],
        borderColor: [
          "rgba(79, 70, 229, 1)", // Indigo
          "rgba(236, 72, 153, 1)", // Pink
          "rgba(245, 158, 11, 1)", // Amber
          "rgba(16, 185, 129, 1)", // Emerald
          "rgba(99, 102, 241, 1)", // Indigo lighter
        ],
        borderWidth: 1,
      },
    ],
  }

  // Chart options with improved contrast for tooltips and labels
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          color: "var(--foreground)",
          font: {
            size: 12,
            weight: "bold",
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 1)",
        bodyFont: {
          size: 14,
        },
        titleFont: {
          size: 16,
          weight: "bold",
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 3,
        usePointStyle: true,
      },
    },
    cutout: "65%",
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
          className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all dark:from-purple-600 dark:to-indigo-700 dark:hover:from-purple-700 dark:hover:to-indigo-800"
        >
          View Detailed Analytics
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded mb-6 font-medium">
          <p>Note: Some data may be estimated. {error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books Published</CardTitle>
            <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{analytics.total_books}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Your published content</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readers</CardTitle>
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{analytics.total_readers}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Unique readers of your books</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{analytics.total_views}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total views across all books</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle>Book Performance</CardTitle>
            <CardDescription>View distribution across your top books</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {analytics.view_distribution && analytics.view_distribution.length > 0 ? (
              <div className="w-full max-w-xs">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-2 opacity-50" />
                <p>No view data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest readers of your books</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recent_readers && analytics.recent_readers.length > 0 ? (
              <div className="space-y-4">
                {analytics.recent_readers.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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

