"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Book, Users, BookOpen, Flag, TrendingUp, Loader, ArrowUpRight, BookMarked, Clock } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../hooks/use-toast"

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d")
  const [userData, setUserData] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    chartData: [],
    publisherGrowthData: [],
    categoryDistributionData: [],
    topContent: { top_publishers: [], top_books: [] },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("No token found. Please log in.")
          return
        }

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUserData(data)
      } catch (error) {
        setError(error.message || "An error occurred while fetching user data.")
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchUserData()
  }, [toast])

  // Fetch all dashboard data in a single request from the optimized endpoint
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return

        // Use the new optimized endpoint
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/optimized-dashboard/all-data?timeRange=${timeRange}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const data = await response.json()
        console.log("Dashboard data:", data)
        setDashboardData(data)
      } catch (error) {
        console.error("Dashboard data error:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })

        // Set fallback data for charts if API fails
        setDashboardData((prev) => ({
          ...prev,
          publisherGrowthData: prev.publisherGrowthData.length
            ? prev.publisherGrowthData
            : [
                { name: "Jan", publishers: 12 },
                { name: "Feb", publishers: 19 },
                { name: "Mar", publishers: 25 },
                { name: "Apr", publishers: 32 },
                { name: "May", publishers: 40 },
                { name: "Jun", publishers: 48 },
              ],
          categoryDistributionData: prev.categoryDistributionData.length
            ? prev.categoryDistributionData
            : [
                { name: "Fiction", books: 45 },
                { name: "Science", books: 28 },
                { name: "History", books: 22 },
                { name: "Biography", books: 18 },
                { name: "Self-Help", books: 15 },
              ],
          topContent: {
            top_publishers: prev.topContent?.top_publishers?.length
              ? prev.topContent.top_publishers
              : [{ name: "PrajaktaPublications", books: 5, views: 22 }],
            top_books: prev.topContent?.top_books?.length
              ? prev.topContent.top_books
              : [{ title: "The Art of Reading", publisher: "PrajaktaPublications", views: 22 }],
          },
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchAllDashboardData()
  }, [timeRange, toast])

  // Map icon names to components
  const iconMap = {
    Users: Users,
    Book: Book,
    BookOpen: BookOpen,
    Flag: Flag,
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  const { stats, chartData, categoryDistributionData, topContent } = dashboardData

  // Custom tooltip for charts with better contrast
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md p-3">
          <p className="font-bold text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-800 dark:text-gray-200">
              <span style={{ color: entry.color }}>{entry.name}</span>: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Publisher activity data for pie chart
  const publisherActivityData = [
    { name: "Books", value: topContent?.top_publishers?.[0]?.books || 5 },
    { name: "Views", value: topContent?.top_publishers?.[0]?.views || 22 },
  ]

  const COLORS = ["#4ade80", "#8884d8"]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome, {userData?.user?.username || "Administrator"}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your platform today.</p>
          <p className="text-green-500 text-sm mt-1">Using optimized dashboard endpoint for better performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange} className="mt-4 md:mt-0">
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-foreground">Loading dashboard data...</span>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Users
            return (
              <Card key={index} className="bg-card border-border shadow-md hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                  <div
                    className={`p-2 rounded-full ${
                      stat.icon === "Book"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : stat.icon === "Users"
                          ? "bg-green-100 dark:bg-green-900"
                          : stat.icon === "BookOpen"
                            ? "bg-amber-100 dark:bg-amber-900"
                            : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 ${
                        stat.icon === "Book"
                          ? "text-blue-600 dark:text-blue-400"
                          : stat.icon === "Users"
                            ? "text-green-600 dark:text-green-400"
                            : stat.icon === "BookOpen"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p
                      className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"} flex items-center`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                      )}
                      {stat.change}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Compared to last month</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Main Chart Section */}
      <Card className="col-span-4 shadow-md bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Book Views Over Time</CardTitle>
          <CardDescription className="text-muted-foreground">
            Track how your platform's content is performing
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  tick={{ fill: "currentColor" }}
                  tickLine={{ stroke: "currentColor" }}
                  style={{ fontSize: "12px", fill: "var(--foreground)" }}
                />
                <YAxis
                  stroke="currentColor"
                  tick={{ fill: "currentColor" }}
                  tickLine={{ stroke: "currentColor" }}
                  style={{ fontSize: "12px", fill: "var(--foreground)" }}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="Views"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">No chart data available for the selected time range</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Most Active Publisher</CardTitle>
            <CardDescription className="text-muted-foreground">
              {topContent?.top_publishers?.[0]?.name || "PrajaktaPublications"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={publisherActivityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {publisherActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value, entry) => (
                        <span style={{ color: "var(--foreground)" }}>
                          {value}: {entry.payload.value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-foreground font-medium">
                  {topContent?.top_publishers?.[0]?.books || 5} books, {topContent?.top_publishers?.[0]?.views || 22}{" "}
                  views
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Book Categories</CardTitle>
            <CardDescription className="text-muted-foreground">Distribution of books by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryDistributionData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  stroke="currentColor"
                  tick={{ fill: "currentColor" }}
                  tickLine={{ stroke: "currentColor" }}
                  style={{ fontSize: "12px", fill: "var(--foreground)" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  stroke="currentColor"
                  tick={{ fill: "currentColor" }}
                  tickLine={{ stroke: "currentColor" }}
                  style={{ fontSize: "12px", fill: "var(--foreground)" }}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>} />
                <Bar dataKey="books" fill="#f472b6" name="Books" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Most Active Publisher</CardTitle>
            <BookMarked className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {topContent?.top_publishers?.[0]?.name || "PrajaktaPublications"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topContent?.top_publishers?.[0]?.books || 5} books, {topContent?.top_publishers?.[0]?.views || 22} views
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Most Popular Book</CardTitle>
            <Book className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {topContent?.top_books?.[0]?.title || "The Art of Reading"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topContent?.top_books?.[0]?.views || 22} views by{" "}
              {topContent?.top_books?.[0]?.publisher || "PrajaktaPublications"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Recent Activity</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">5 New Books</div>
            <p className="text-xs text-muted-foreground mt-1">Added in the last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
