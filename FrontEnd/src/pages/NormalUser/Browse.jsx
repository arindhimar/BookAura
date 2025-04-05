"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Search, X, BookOpen, SlidersHorizontal, Star, Loader2 } from "lucide-react"
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
import { useToast } from "../../hooks/use-toast"
import EnhancedBookCard from "../../components/BookCard"
import { booksApi, categoriesApi } from "../../services/api"

const BrowsePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState([])
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [pageRange, setPageRange] = useState([0, 1000])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [yearRange, setYearRange] = useState([2010, 2023])
  const [sortBy, setSortBy] = useState("relevance")
  const [genres, setGenres] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch books and genres from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch books
        const booksData = await booksApi.getBooks()

        // Fetch genres
        const genresData = await categoriesApi.getCategories()

        setBooks(booksData)
        setFilteredBooks(booksData)
        setGenres(genresData.map((genre) => genre.name))

        // Set initial year range based on actual data
        if (booksData.length > 0) {
          const years = booksData.map((book) => book.publishedYear)
          const minYear = Math.min(...years)
          const maxYear = Math.max(...years)
          setYearRange([minYear, maxYear])
        }

        // Set initial page range based on actual data
        if (booksData.length > 0) {
          const pages = booksData.map((book) => book.pageCount)
          const minPages = Math.min(...pages)
          const maxPages = Math.max(...pages)
          setPageRange([minPages, maxPages])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
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
  }, [toast])

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      applyFilters()
    }
  }

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...books]

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((book) => selectedGenres.includes(book.genre))
    }

    // Apply page range filter
    filtered = filtered.filter((book) => book.pageCount >= pageRange[0] && book.pageCount <= pageRange[1])

    // Apply year range filter
    filtered = filtered.filter((book) => book.publishedYear >= yearRange[0] && book.publishedYear <= yearRange[1])

    // Apply sorting
    switch (sortBy) {
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "rating-desc":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => b.publishedYear - a.publishedYear)
        break
      default:
        // Default sorting (relevance) - no change
        break
    }

    setFilteredBooks(filtered)

    // Update active filters for display
    const newActiveFilters = []
    if (selectedGenres.length > 0) {
      newActiveFilters.push(...selectedGenres.map((genre) => ({ type: "genre", value: genre })))
    }
    if (pageRange[0] > 0 || pageRange[1] < 1000) {
      newActiveFilters.push({ type: "pages", value: `${pageRange[0]}-${pageRange[1]} pages` })
    }
    if (yearRange[0] > 2010 || yearRange[1] < 2023) {
      newActiveFilters.push({ type: "year", value: `${yearRange[0]}-${yearRange[1]}` })
    }

    setActiveFilters(newActiveFilters)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedGenres([])
    setPageRange([0, 1000])
    setYearRange([2010, 2023])
    setSortBy("relevance")
    setActiveFilters([])
    setFilteredBooks(books)
  }

  // Remove a specific filter
  const removeFilter = (filter) => {
    if (filter.type === "genre") {
      setSelectedGenres((prev) => prev.filter((genre) => genre !== filter.value))
    } else if (filter.type === "pages") {
      setPageRange([0, 1000])
    } else if (filter.type === "year") {
      setYearRange([2010, 2023])
    }

    setActiveFilters((prev) => prev.filter((f) => !(f.type === filter.type && f.value === filter.value)))
  }

  // Toggle genre selection
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  // Apply filters when filter settings change
  useEffect(() => {
    applyFilters()
  }, [selectedGenres, pageRange, yearRange, sortBy])

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading books...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load books</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
        <p className="text-muted-foreground">Discover your next favorite read from our extensive collection</p>
      </div>

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
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
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
                  {/* Genre Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Genres</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map((genre) => (
                        <div key={genre} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genre-${genre}`}
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={() => toggleGenre(genre)}
                          />
                          <label
                            htmlFor={`genre-${genre}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {genre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Page Count Filter */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">Page Count</h4>
                      <span className="text-xs text-muted-foreground">
                        {pageRange[0]} - {pageRange[1]} pages
                      </span>
                    </div>
                    <Slider
                      defaultValue={pageRange}
                      min={0}
                      max={1000}
                      step={50}
                      onValueChange={setPageRange}
                      className="my-6"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Short</span>
                      <span>Long</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Publication Year Filter */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">Publication Year</h4>
                      <span className="text-xs text-muted-foreground">
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
                    <div className="flex justify-between text-xs text-muted-foreground">
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
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EnhancedBookCard book={book} />
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
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/book/${book.id}`)}
                      >
                        <div className="flex-shrink-0 w-16">
                          <img
                            src={book.coverImage || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-auto object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{book.title}</h3>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{book.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{book.genre}</span>
                            <span>•</span>
                            <span>{book.pageCount} pages</span>
                            <span>•</span>
                            <span>{book.publishedYear}</span>
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
  )
}

export default BrowsePage

