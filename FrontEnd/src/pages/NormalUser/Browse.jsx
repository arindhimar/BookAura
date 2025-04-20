"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, BookOpen, SlidersHorizontal, Star, Loader2, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet"
import { Slider } from "../../components/ui/slider"
import { Checkbox } from "../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Card, CardContent } from "../../components/ui/card"
import { useToast } from "../../hooks/use-toast"
import BookCard from "../../components/BookCard"
import UserNavbar from "../../components/UserNavbar"
import { useVoiceCommand } from "../../contexts/VoiceCommandContext"
import VoiceCommandListener from "../../components/VoiceCommandListener"
import VoiceCommandHelp from "../../components/VoiceCommandHelp"

export default function BrowsePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isListening, lastCommand } = useVoiceCommand()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState([])
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [pageRange, setPageRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [yearRange, setYearRange] = useState([2010, 2023])
  const [sortBy, setSortBy] = useState("relevance")
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Handle voice commands specific to browse page
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
      } else if (command.includes("filter by")) {
        setIsFilterOpen(true)
        toast({
          title: "Voice Command",
          description: "Opening filters",
        })
      } else if (command.includes("sort by")) {
        if (command.includes("newest")) {
          setSortBy("newest")
          toast({
            title: "Voice Command",
            description: "Sorting by newest first",
          })
        } else if (command.includes("title")) {
          setSortBy("title-asc")
          toast({
            title: "Voice Command",
            description: "Sorting by title",
          })
        } else if (command.includes("popular") || command.includes("views")) {
          setSortBy("views-desc")
          toast({
            title: "Voice Command",
            description: "Sorting by most viewed",
          })
        }
      } else if (command.includes("clear filters") || command.includes("reset filters")) {
        resetFilters()
        toast({
          title: "Voice Command",
          description: "Filters cleared",
        })
      } else if (command.includes("open book") && filteredBooks.length > 0) {
        // Open the first book in the filtered list
        navigate(`/book/${filteredBooks[0].book_id}`)
        toast({
          title: "Voice Command",
          description: "Opening first book in results",
        })
      }
    }
  }, [isListening, lastCommand, filteredBooks, navigate, toast])

  // Fetch books and categories from backend
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch books
        const booksResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/`, {
          headers: { Authorization: token },
        })

        if (!booksResponse.ok) {
          throw new Error("Failed to fetch books")
        }

        const booksData = await booksResponse.json()

        // Fetch categories
        const categoriesResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/`, {
          headers: { Authorization: token },
        })

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories")
        }

        const categoriesData = await categoriesResponse.json()

        setBooks(booksData)
        setFilteredBooks(booksData)
        setCategories(categoriesData.map((category) => category.category_name))

        // Set initial year range based on actual data
        if (booksData.length > 0) {
          const years = booksData
            .filter((book) => book.uploaded_at)
            .map((book) => new Date(book.uploaded_at).getFullYear())
          const minYear = Math.min(...years) || 2010
          const maxYear = Math.max(...years) || 2023
          setYearRange([minYear, maxYear])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load books and categories")
        toast({
          title: "Error",
          description: "Failed to load books. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [navigate, toast])

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault()
    applyFilters()
  }

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...books]

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((book) => {
        if (!book.categories) return false
        const bookCategories =
          typeof book.categories === "string" ? book.categories.split(",").map((c) => c.trim()) : book.categories
        return selectedCategories.some((category) => bookCategories.includes(category))
      })
    }

    // Apply year range filter if book has uploaded_at date
    filtered = filtered.filter((book) => {
      if (!book.uploaded_at) return true
      const year = new Date(book.uploaded_at).getFullYear()
      return year >= yearRange[0] && year <= yearRange[1]
    })

    // Apply sorting
    switch (sortBy) {
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "views-desc":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "newest":
        filtered.sort((a, b) => {
          if (!a.uploaded_at) return 1
          if (!b.uploaded_at) return -1
          return new Date(b.uploaded_at) - new Date(a.uploaded_at)
        })
        break
      default:
        // Default sorting (relevance) - no change
        break
    }

    setFilteredBooks(filtered)

    // Update active filters for display
    const newActiveFilters = []
    if (selectedCategories.length > 0) {
      newActiveFilters.push(...selectedCategories.map((category) => ({ type: "category", value: category })))
    }
    if (yearRange[0] > 2010 || yearRange[1] < 2023) {
      newActiveFilters.push({ type: "year", value: `${yearRange[0]}-${yearRange[1]}` })
    }

    setActiveFilters(newActiveFilters)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setYearRange([2010, 2023])
    setSortBy("relevance")
    setActiveFilters([])
    setFilteredBooks(books)
  }

  // Remove a specific filter
  const removeFilter = (filter) => {
    if (filter.type === "category") {
      setSelectedCategories((prev) => prev.filter((category) => category !== filter.value))
    } else if (filter.type === "year") {
      setYearRange([2010, 2023])
    }

    setActiveFilters((prev) => prev.filter((f) => !(f.type === filter.type && f.value === filter.value)))
  }

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Apply filters when filter settings change
  useEffect(() => {
    applyFilters()
  }, [selectedCategories, yearRange, sortBy])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading books...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Browse Books
          </h1>
          <p className="text-muted-foreground">Discover your next favorite read from our extensive collection</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, author, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    applyFilters()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="views-desc">Most Viewed</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Filter Options</h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset all
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-foreground">Categories</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Publication Year Filter */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-foreground">Publication Year</h4>
                        <span className="text-xs text-foreground">
                          {yearRange[0]} - {yearRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={yearRange}
                        min={2010}
                        max={2023}
                        step={1}
                        onValueChange={setYearRange}
                        className="my-6"
                      />
                      <div className="flex justify-between text-xs text-foreground">
                        <span>Older</span>
                        <span>Newer</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                {filter.value}
                <button onClick={() => removeFilter(filter)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7">
              Clear all
            </Button>
          </div>
        )}

        {/* Results */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} found
            </div>
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
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
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
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.book_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <BookCard book={book} index={index} onClick={() => navigate(`/book/${book.book_id}`)} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No books found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                    <Button onClick={resetFilters}>Reset Filters</Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredBooks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.book_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <div
                          className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/book/${book.book_id}`)}
                        >
                          <div className="flex-shrink-0 w-16 h-24">
                            <img
                              src={
                                book.coverUrl
                                  ? `${import.meta.env.VITE_BASE_API_URL}/books/${book.coverUrl}`
                                  : "/placeholder.svg?height=96&width=64"
                              }
                              alt={book.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{book.title}</h3>
                              <div className="flex items-center gap-1">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{book.rating || "N/A"}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{book.author_name || "Unknown Author"}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {book.categories && (
                                <span>
                                  {typeof book.categories === "string" ? book.categories : book.categories.join(", ")}
                                </span>
                              )}
                              <span>•</span>
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
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No books found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                    <Button onClick={resetFilters}>Reset Filters</Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
      <VoiceCommandListener />
      <VoiceCommandHelp />
    </div>
  )
}
