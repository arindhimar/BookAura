"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Search, X, BookOpen, RefreshCw, ChevronRight, BookText, Bookmark, Eye, ArrowRight } from "lucide-react"
import UserNavbar from "../../components/UserNavbar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardFooter } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area"
import { Skeleton } from "../../components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useToast } from "../../hooks/use-toast"
import { categoriesApi } from "../../services/api"
import { handleApiError } from "../../utils/errorHandler"
import BookCard from "../../components/BookCard"
import { useVoiceCommand } from "../../contexts/VoiceCommandContext"
import VoiceCommandListener from "../../components/VoiceCommandListener"
import VoiceCommandHelp from "../../components/VoiceCommandHelp"

export default function Categories() {
  const [categories, setCategories] = useState({})
  const [filteredCategories, setFilteredCategories] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(null)
  const [featuredCategory, setFeaturedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isListening, lastCommand } = useVoiceCommand()

  // Handle voice commands specific to categories page
  useEffect(() => {
    if (isListening && lastCommand) {
      const command = lastCommand.toLowerCase()

      if (command.includes("search for")) {
        const searchTerm = command.replace("search for", "").trim()
        if (searchTerm) {
          setSearchQuery(searchTerm)
          toast({
            title: "Voice Command",
            description: `Searching for "${searchTerm}"`,
          })
        }
      } else if (command.includes("clear search")) {
        setSearchQuery("")
        toast({
          title: "Voice Command",
          description: "Search cleared",
        })
      } else if (command.includes("show category") || command.includes("open category")) {
        // Try to find a category that matches the command
        const categoryName = command.replace("show category", "").replace("open category", "").trim()

        if (
          categoryName &&
          Object.keys(categories).some((cat) => cat.toLowerCase().includes(categoryName.toLowerCase()))
        ) {
          const matchedCategory = Object.keys(categories).find((cat) =>
            cat.toLowerCase().includes(categoryName.toLowerCase()),
          )

          setActiveCategory(matchedCategory)
          toast({
            title: "Voice Command",
            description: `Opening ${matchedCategory} category`,
          })
        } else if (featuredCategory) {
          // If no specific category found, open the featured category
          setActiveCategory(featuredCategory.name)
          toast({
            title: "Voice Command",
            description: `Opening featured category: ${featuredCategory.name}`,
          })
        }
      } else if (command.includes("close category")) {
        setActiveCategory(null)
        toast({
          title: "Voice Command",
          description: "Closing category view",
        })
      } else if (command.includes("featured category")) {
        if (featuredCategory) {
          setActiveCategory(featuredCategory.name)
          toast({
            title: "Voice Command",
            description: `Opening featured category: ${featuredCategory.name}`,
          })
        }
      }
    }
  }, [isListening, lastCommand, categories, featuredCategory, toast])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/")
          return
        }

        setLoading(true)
        setError(null)

        const data = await categoriesApi.getCategorizedBooks()

        if (!data || Object.keys(data).length === 0) {
          console.log("No categories data received")
          setCategories({})
          setFilteredCategories({})
        } else {
          console.log("Categories data received:", data)
          setCategories(data)
          setFilteredCategories(data)

          // Set featured category (category with most books)
          const sortedCategories = Object.entries(data).sort((a, b) => b[1].length - a[1].length)
          if (sortedCategories.length > 0) {
            setFeaturedCategory({
              name: sortedCategories[0][0],
              books: sortedCategories[0][1],
            })
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError(error.message || "An error occurred while loading categories")
        handleApiError(error, toast, "Failed to load categories")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [navigate, toast])

  // Filter categories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = {}

    Object.entries(categories).forEach(([categoryName, books]) => {
      // Check if category name matches
      if (categoryName.toLowerCase().includes(query)) {
        filtered[categoryName] = books
        return
      }

      // Check if any book in the category matches
      const matchingBooks = books.filter(
        (book) => book.title?.toLowerCase().includes(query) || book.author_name?.toLowerCase().includes(query),
      )

      if (matchingBooks.length > 0) {
        filtered[categoryName] = matchingBooks
      }
    })

    setFilteredCategories(filtered)
  }, [searchQuery, categories])

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(activeCategory === categoryName ? null : categoryName)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-xl mb-8" />

          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
          </div>
        </div>
        <VoiceCommandListener />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
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
      </div>
    )
  }

  const hasCategories = Object.keys(filteredCategories).length > 0

  if (!hasCategories && !searchQuery) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <BookText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Categories Found</h2>
            <p className="text-muted-foreground mb-6">There are no book categories available at the moment.</p>
            <Button onClick={() => navigate("/browse")}>Browse All Books</Button>
          </div>
        </div>
        <VoiceCommandListener />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Explore Categories
          </h1>
          <p className="text-lg text-muted-foreground">Discover books by category and find your next favorite read</p>
        </motion.div>

        {/* Featured Category Banner */}
        {featuredCategory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="relative overflow-hidden rounded-xl h-64 bg-gradient-to-r from-primary/10 to-purple-600/10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-full absolute">
                  {/* Book Cover Collage - Positioned to the right side only */}
                  <div className="flex justify-end h-full overflow-hidden opacity-40">
                    {featuredCategory.books.slice(0, 5).map((book, index) => (
                      <div
                        key={book.book_id}
                        className="h-full w-40 relative"
                        style={{
                          transform: `translateX(${index * -20}px) rotate(${(index - 2) * 5}deg)`,
                          zIndex: 5 - index,
                          right: 0,
                        }}
                      >
                        <img
                          src={
                            book.cover_url
                              ? `${import.meta.env.VITE_BASE_API_URL}/books/${book.cover_url}`
                              : "/placeholder.svg?height=300&width=200"
                          }
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 p-8 md:p-12 w-full md:w-2/3">
                  <Badge className="mb-3 bg-primary/90 hover:bg-primary text-white">Featured Category</Badge>
                  <h2 className="text-3xl font-bold mb-2">{featuredCategory.name}</h2>
                  <p className="text-muted-foreground mb-4">{featuredCategory.books.length} books available</p>
                  <Button onClick={() => handleCategoryClick(featuredCategory.name)} className="mt-2">
                    Explore Category <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search categories or books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-6 text-base rounded-full border-primary/20 focus-visible:ring-primary/30"
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
        </div>

        {!hasCategories && searchQuery && (
          <div className="text-center py-12">
            <BookText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-6">No categories or books match your search query.</p>
            <Button onClick={clearSearch}>Clear Search</Button>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(filteredCategories).map(([categoryName, books], index) => (
            <motion.div
              key={categoryName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
                {/* Category Header with Name and Badge */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{categoryName}</h3>
                    <Badge variant="outline">{books.length} books</Badge>
                  </div>
                </div>

                {/* Book Cover Display - Fixed height and proper positioning */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-r from-primary/5 to-purple-600/5">
                  <div className="absolute inset-0 flex justify-center">
                    {books.slice(0, 3).map((book, idx) => (
                      <div
                        key={book.book_id}
                        className="h-full w-28 relative"
                        style={{
                          transform: `translateX(${(idx - 1) * 20}px) rotate(${(idx - 1) * 8}deg)`,
                          zIndex: 3 - idx,
                        }}
                      >
                        <img
                          src={
                            book.cover_url
                              ? `${import.meta.env.VITE_BASE_API_URL}/books/${book.cover_url}`
                              : "/placeholder.svg?height=200&width=130"
                          }
                          alt={book.title}
                          className="h-full w-full object-cover shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>
                        {books.length} {books.length === 1 ? "book" : "books"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{books.reduce((sum, book) => sum + (book.views || 0), 0)} views</span>
                    </div>
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-1" />
                      <span>{books.length > 0 ? Math.floor(books.length * 0.7) : 0} saves</span>
                    </div>
                  </div>

                  {/* Popular Books in Category */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Popular in this category:</h4>
                    <ul className="text-sm text-muted-foreground">
                      {books.slice(0, 3).map((book) => (
                        <li key={book.book_id} className="truncate mb-1">
                          • {book.title} <span className="text-xs">by {book.author_name || "Unknown"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" className="w-full" onClick={() => handleCategoryClick(categoryName)}>
                    Explore Category
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Category Modal */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveCategory(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-background rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{activeCategory}</h2>
                    <p className="text-muted-foreground">
                      {filteredCategories[activeCategory]?.length || 0} books in this category
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setActiveCategory(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  <Tabs defaultValue="grid">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium">Books in this category</h3>
                      <TabsList>
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="grid">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredCategories[activeCategory]?.map((book, idx) => (
                          <BookCard
                            key={book.book_id}
                            book={book}
                            index={idx}
                            onClick={() => navigate(`/book/${book.book_id}`)}
                          />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="list">
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {filteredCategories[activeCategory]?.map((book, idx) => (
                            <div
                              key={book.book_id}
                              className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/book/${book.book_id}`)}
                            >
                              <div className="flex-shrink-0 w-16 h-24">
                                <img
                                  src={
                                    book.cover_url
                                      ? `${import.meta.env.VITE_BASE_API_URL}/books/${book.cover_url}`
                                      : "/placeholder.svg?height=96&width=64"
                                  }
                                  alt={book.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium">{book.title}</h3>
                                <p className="text-sm text-muted-foreground">{book.author_name || "Unknown Author"}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span>{book.views || 0} views</span>
                                  {book.uploaded_at && (
                                    <>
                                      <span>•</span>
                                      <span>{new Date(book.uploaded_at).getFullYear()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <ScrollBar orientation="vertical" />
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="p-6 border-t">
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate("/browse")
                      setActiveCategory(null)
                    }}
                  >
                    Browse All Books
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <VoiceCommandListener />
      <VoiceCommandHelp />
    </div>
  )
}
