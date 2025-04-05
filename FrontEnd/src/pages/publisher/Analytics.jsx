"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"
import { Loader, Book, Users, Eye, ArrowUpRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function Analytics() {
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
      toast.error("Failed to load analytics data. Please try again later.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button
            onClick={fetchPublisherAnalytics}
            className="mt-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 font-semibold py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Calculate growth percentages (for demonstration)
  const calculateGrowth = (value) => {
    const growth = Math.floor(Math.random() * 30) + 5 // Random growth between 5-35%
    return `+${growth}%`
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Detailed insights into your content performance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{analytics.total_books}</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {calculateGrowth(analytics.total_books)}
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Your published content</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readers</CardTitle>
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">{analytics.total_readers}</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {calculateGrowth(analytics.total_readers)}
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Unique readers of your books</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{analytics.total_views}</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {calculateGrowth(analytics.total_views)}
              </div>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total views across all books</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6">
        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle>Monthly Views</CardTitle>
            <CardDescription>View trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analytics.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Views"]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Views"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle>Book Performance</CardTitle>
            <CardDescription>Views by book title</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.view_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`${value}`, "Views"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="views" name="Views" fill="#adfa1d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                  <div
                    key={index}
                    className="flex items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center text-white font-bold">
                      {activity.reader.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">{activity.reader}</p>
                      <p className="text-xs text-muted-foreground">Read "{activity.book}"</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
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

