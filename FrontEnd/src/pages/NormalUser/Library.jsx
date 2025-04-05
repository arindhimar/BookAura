"use client"

import { Skeleton } from "../../components/ui/skeleton"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Clock, Bookmark, Search, BookOpen, Loader2, RefreshCw, X, ArrowUpDown } from "lucide-react"
import UserNavbar from "../../components/UserNavbar"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import BookCard from "../../components/BookCard"
import { useToast } from "../../hooks/use-toast"
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { readingHistoryApi, bookmarksApi } from "../../services/api"
import { handleApiError } from "../../utils/errorHandler"

const tabs = [
  { id: "history", label: "Reading History", icon: Clock },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
]

const sortOptions = [
  { id: "recent", label: "Most Recent" },
  { id: "title-asc", label: "Title (A-Z)" },
  { id: "title-desc", label: "Title (Z-A)" },
  { id: "author", label: "Author" },
]

export default function Library() {
  const [activeTab, setActiveTab] = useState("history")
  const [bookmarks, setBookmarks] = useState([])
  const [history, setHistory] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState("grid") // grid or scroll
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchLibraryData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch reading history
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

        setHistory(formattedHistory)

        // Fetch bookmarks
        const bookmarksData = await bookmarksApi.getUserBookmarks()

        // Format bookmarks data
        const formattedBookmarks = bookmarksData.map((bookmark) => ({
          ...bookmark.book_details,
          book_id: bookmark.book_id,
          bookmark_id: bookmark.bookmark_id,
          created_at: bookmark.created_at,
          categories: Array.isArray(bookmark.book_details.categories)
            ? bookmark.book_details.categories
            : typeof bookmark.book_details.categories === "string"
              ? bookmark.book_details.categories.split(",").map((c) => c.trim())
              : [],
        }))

        setBookmarks(formattedBookmarks)

        // Set initial filtered books based on active tab
        setFilteredBooks(activeTab === "history" ? formattedHistory : formattedBookmarks)
      } catch (err) {
        console.error("Error fetching library data:", err)
        setError(err.message || "Failed to load your library")
        handleApiError(err, toast, "Failed to load your library. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [navigate, toast])

  // Apply sorting and filtering
  useEffect(() => {
    const booksToFilter = activeTab === "history" ? history : bookmarks
    let filtered = [...booksToFilter]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(query) ||
          book.author_name?.toLowerCase().includes(query) ||
          (book.categories &&
            book.categories.some((cat) => typeof cat === "string" && cat.toLowerCase().includes(query))),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "title-asc":
        filtered.sort((a, b) => a.title?.localeCompare(b.title || ""))
        break
      case "title-desc":
        filtered.sort((a, b) => b.title?.localeCompare(a.title || ""))
        break
      case "author":
        filtered.sort((a, b) => a.author_name?.localeCompare(b.author_name || "Unknown"))
        break
      case "recent":
      default:
        // Sort by last_read_at for history or created_at for bookmarks
        if (activeTab === "history") {
          filtered.sort((a, b) => new Date(b.last_read_at || 0) - new Date(a.last_read_at || 0))
        } else {
          filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        }
        break
    }

    setFilteredBooks(filtered)
  }, [activeTab, history, bookmarks, searchQuery, sortBy])

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value)
    setSearchQuery("")
    setSortBy("recent")
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    // The filtering is handled in the useEffect
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Handle book removal
  const handleRemoveBook = async (bookId) => {
    try {
      if (activeTab === "history") {
        // Remove from reading history
        await readingHistoryApi.deleteHistory(bookId)
        setHistory(history.filter((book) => book.book_id !== bookId))
        toast({
          title: "Book removed",
          description: "Book has been removed from your reading history",
        })
      } else {
        // Remove from bookmarks
        await bookmarksApi.removeBookmark(bookId)
        setBookmarks(bookmarks.filter((book) => book.book_id !== bookId))
        toast({
          title: "Bookmark removed",
          description: "Book has been removed from your bookmarks",
        })
      }
    } catch (err) {
      console.error("Error removing book:", err)
      handleApiError(err, toast, "Failed to remove book. Please try again.")
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
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
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            My Library
          </h1>
          <p className="text-lg text-muted-foreground">Track your reading journey and manage your books</p>
        </motion.div>

        <Tabs defaultValue="history" value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList className="flex-wrap justify-start h-auto p-2 bg-background">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  <Badge variant="secondary" className="ml-1">
                    {tab.id === "history" ? history.length : bookmarks.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              <div className="flex gap-2">
                <Tabs defaultValue="grid" value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="grid" className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                      </svg>
                    </TabsTrigger>
                    <TabsTrigger value="scroll" className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="3" x2="21" y1="6" y2="6" />
                        <line x1="3" x2="21" y1="12" y2="12" />
                        <line x1="3" x2="21" y1="18" y2="18" />
                      </svg>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="hidden sm:inline">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={sortBy === option.id ? "bg-muted" : ""}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="history" className="mt-6">
              {viewMode === "grid" ? (
                <BookGrid
                  books={filteredBooks}
                  loading={loading}
                  emptyMessage="You haven't read any books yet."
                  emptyAction={() => navigate("/browse")}
                  onRemove={handleRemoveBook}
                  showProgress={true}
                  searchQuery={searchQuery}
                />
              ) : (
                <BookScroll
                  books={filteredBooks}
                  loading={loading}
                  emptyMessage="You haven't read any books yet."
                  emptyAction={() => navigate("/browse")}
                  onRemove={handleRemoveBook}
                  showProgress={true}
                  searchQuery={searchQuery}
                />
              )}
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-6">
              {viewMode === "grid" ? (
                <BookGrid
                  books={filteredBooks}
                  loading={loading}
                  emptyMessage="You haven't bookmarked any books yet."
                  emptyAction={() => navigate("/browse")}
                  onRemove={handleRemoveBook}
                  searchQuery={searchQuery}
                />
              ) : (
                <BookScroll
                  books={filteredBooks}
                  loading={loading}
                  emptyMessage="You haven't bookmarked any books yet."
                  emptyAction={() => navigate("/browse")}
                  onRemove={handleRemoveBook}
                  searchQuery={searchQuery}
                />
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  )
}

function BookGrid({ books, loading, emptyMessage, emptyAction, onRemove, showProgress = false, searchQuery = "" }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-4">{searchQuery ? "No books match your search" : emptyMessage}</h3>
        <Button onClick={emptyAction}>Browse Books</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book.book_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <BookCard
            book={book}
            index={index}
            onClick={() => navigate(`/book/${book.book_id}`)}
            onRemove={() => onRemove(book.book_id)}
            showProgress={showProgress}
          />
        </motion.div>
      ))}
    </div>
  )
}

function BookScroll({ books, loading, emptyMessage, emptyAction, onRemove, showProgress = false, searchQuery = "" }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-4">{searchQuery ? "No books match your search" : emptyMessage}</h3>
        <Button onClick={emptyAction}>Browse Books</Button>
      </div>
    )
  }

  // Group books by first letter of title for better organization
  const groupedBooks = books.reduce((acc, book) => {
    const firstLetter = (book.title || "").charAt(0).toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(book)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(groupedBooks).map(([letter, letterBooks]) => (
        <div key={letter} className="space-y-4">
          <h3 className="text-lg font-semibold">{letter}</h3>
          <ScrollArea className="pb-4">
            <div className="flex space-x-4">
              {letterBooks.map((book, index) => (
                <motion.div
                  key={book.book_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="min-w-[180px] max-w-[180px]"
                >
                  <BookCard
                    book={book}
                    index={index}
                    onClick={() => navigate(`/book/${book.book_id}`)}
                    onRemove={() => onRemove(book.book_id)}
                    showProgress={showProgress}
                  />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}

