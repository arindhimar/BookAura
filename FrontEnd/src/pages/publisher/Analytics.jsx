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

      toast.error("Failed to load analytics data. Using sample data instead.")
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

  // Calculate growth percentages (for demonstration)
  const calculateGrowth = (value) => {
    const growth = Math.floor(Math.random() * 30) + 5 // Random growth between 5-35%
    return `+${growth}%`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-foreground">Loading analytics data...</span>
      </div>
    )
  }

  // Custom tooltip for charts with better contrast
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border shadow-lg rounded-md p-3">
          <p className="font-bold text-foreground">{`Month: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-foreground">
              <span style={{ color: entry.color }}>{entry.name}</span>: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Detailed insights into your content performance</p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded mb-6 font-medium">
          <p>Note: Some data may be estimated. {error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Books</CardTitle>
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
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total Readers</CardTitle>
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
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Views</CardTitle>
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
            <CardTitle className="text-foreground">Monthly Views</CardTitle>
            <CardDescription className="text-muted-foreground">View trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analytics.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--foreground)" }}
                />
                <YAxis
                  stroke="var(--foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: "var(--foreground)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: "10px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "var(--foreground)",
                  }}
                />
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
            <CardTitle className="text-foreground">Book Performance</CardTitle>
            <CardDescription className="text-muted-foreground">Views by book title</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.view_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--foreground)" }}
                />
                <YAxis
                  stroke="var(--foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--foreground)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name="Views" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">Latest readers of your books</CardDescription>
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
                      <p className="text-sm font-medium text-foreground">{activity.reader}</p>
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

