"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import UserNavbar from "../../components/UserNavbar"
import RecentlyRead from "../../components/RecentlyRead"
import Recommendations from "../../components/Recommendations"
import ExploreBooks from "../../components/ExploreBooks"
import CategorySection from "../../components/CategorySection"
import ReadingProgressSection from "../../components/ReadingProgressSection"
import { Loader2, BookOpen, RefreshCw, BookText, TrendingUp, History } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { useToast } from "../../hooks/use-toast"
import { readingHistoryApi, booksApi, categoriesApi, authApi } from "../../services/api"
import { handleApiError } from "../../utils/errorHandler"
import { useVoiceCommand } from "../../contexts/VoiceCommandContext"
import VoiceCommandListener from "../../components/VoiceCommandListener"
import VoiceCommandHelp from "../../components/VoiceCommandHelp"

export default function Home() {
  const [userName, setUserName] = useState("User")
  const [recentBooks, setRecentBooks] = useState([])
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [categories, setCategories] = useState({})
  const [inProgressBook, setInProgressBook] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isListening, lastCommand } = useVoiceCommand()

  // Handle voice commands specific to home page
  useEffect(() => {
    if (isListening && lastCommand) {
      const command = lastCommand.toLowerCase()

      if (command.includes("continue reading") && inProgressBook) {
        navigate(`/book/${inProgressBook.book_id}`)
        toast({
          title: "Voice Command",
          description: "Continuing your book",
        })
      } else if (command.includes("show recommendations") || command.includes("show recommended books")) {
        // Scroll to recommendations section
        document.getElementById("recommendations-section")?.scrollIntoView({ behavior: "smooth" })
        toast({
          title: "Voice Command",
          description: "Showing recommendations",
        })
      } else if (command.includes("explore categories") || command.includes("show categories")) {
        // Scroll to categories section
        document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" })
        toast({
          title: "Voice Command",
          description: "Showing categories",
        })
      } else if (command.includes("recently read") || command.includes("show history")) {
        // Scroll to recently read section
        document.getElementById("recently-read-section")?.scrollIntoView({ behavior: "smooth" })
        toast({
          title: "Voice Command",
          description: "Showing recently read books",
        })
      }
    }
  }, [isListening, lastCommand, inProgressBook, navigate, toast])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchUserData = async () => {
      try {
        setLoadingUser(true)
        const data = await authApi.getCurrentUser()
        setUserName(data.user.username || "User")
      } catch (error) {
        console.error("Error fetching user data:", error)
        handleApiError(error, toast, "Failed to load user data")
      } finally {
        setLoadingUser(false)
      }
    }

    // Fetch recently read books
    const fetchRecentlyRead = async () => {
      try {
        setLoadingRecent(true)
        const historyData = await readingHistoryApi.getUserHistory()

        // Format history data
        const formattedHistory = historyData.map((item) => ({
          ...item.book_details,
          book_id: item.book_id,
          history_id: item.history_id,
          last_read_at: item.last_read_at,
          progress: item.progress || 0,
          categories: Array.isArray(item.book_details.categories)
            ? item.book_details.categories
            : typeof item.book_details.categories === "string"
              ? item.book_details.categories.split(",").map((c) => c.trim())
              : [],
        }))

        // Sort by last read date
        formattedHistory.sort((a, b) => new Date(b.last_read_at) - new Date(a.last_read_at))

        setRecentBooks(formattedHistory)
      } catch (error) {
        console.error("Error fetching recently read books:", error)
        handleApiError(error, toast, "Failed to load reading history")
      } finally {
        setLoadingRecent(false)
      }
    }

    // Fetch recommendations
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true)
        const books = await booksApi.getBooks()

        // Sort by views or other criteria for recommendations
        const sortedBooks = books.sort((a, b) => (b.views || 0) - (a.views || 0))

        setRecommendedBooks(sortedBooks)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        handleApiError(error, toast, "Failed to load recommendations")
      } finally {
        setLoadingRecommendations(false)
      }
    }

    // Fetch categories with books
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const categorizedBooks = await categoriesApi.getCategorizedBooks()
        setCategories(categorizedBooks)
      } catch (error) {
        console.error("Error fetching categories:", error)
        handleApiError(error, toast, "Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }

    // Fetch in-progress book
    const fetchInProgressBook = async () => {
      try {
        setLoadingProgress(true)
        // Get the most recently read book with progress < 100%
        const historyData = await readingHistoryApi.getUserHistory()

        if (historyData && historyData.length > 0) {
          // Sort by last read date
          historyData.sort((a, b) => new Date(b.last_read_at) - new Date(a.last_read_at))

          // Find the first book with progress < 100%
          const inProgress = historyData.find((item) => (item.progress || 0) < 100)

          if (inProgress) {
            setInProgressBook({
              ...inProgress.book_details,
              book_id: inProgress.book_id,
              progress: inProgress.progress || 0,
              last_read_at: inProgress.last_read_at,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching in-progress book:", error)
        // Don't show toast for this as it's not critical
      } finally {
        setLoadingProgress(false)
      }
    }

    // Fetch all data in parallel
    Promise.all([
      fetchUserData(),
      fetchRecentlyRead(),
      fetchRecommendations(),
      fetchCategories(),
      fetchInProgressBook(),
    ]).catch((error) => {
      console.error("Error fetching data:", error)
      setError("Failed to load data. Please try again.")
    })
  }, [navigate, toast])

  const isLoading = loadingUser && loadingRecent && loadingRecommendations && loadingCategories && loadingProgress

  if (error) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <UserNavbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
        <VoiceCommandListener />
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <UserNavbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your personalized experience...</p>
        </div>
        <VoiceCommandListener />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <UserNavbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg text-muted-foreground">Continue your reading journey with BookAura</p>
            </motion.div>

            {/* Reading Progress Section */}
            {inProgressBook && <ReadingProgressSection book={inProgressBook} loading={loadingProgress} />}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card
                className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate("/browse")}
              >
                <CardContent className="p-6 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <BookText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Browse Books</h3>
                    <p className="text-sm text-muted-foreground">Discover new titles</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate("/categories")}
              >
                <CardContent className="p-6 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Categories</h3>
                    <p className="text-sm text-muted-foreground">Browse by genre</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate("/my-library")}
              >
                <CardContent className="p-6 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">My Library</h3>
                    <p className="text-sm text-muted-foreground">Your reading history</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Explore Books Section */}
            <ExploreBooks categories={categories} loading={loadingCategories} />

            {/* Recently Read Section */}
            <div id="recently-read-section">
              <RecentlyRead books={recentBooks} loading={loadingRecent} />
            </div>

            {/* Recommendations Section */}
            <div id="recommendations-section">
              <Recommendations books={recommendedBooks} loading={loadingRecommendations} />
            </div>

            {/* Categories Section */}
            <div id="categories-section">
              <CategorySection categories={categories} loading={loadingCategories} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <VoiceCommandListener />
      <VoiceCommandHelp />
    </main>
  )
}
