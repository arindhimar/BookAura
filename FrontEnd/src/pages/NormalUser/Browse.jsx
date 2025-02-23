import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Search, Filter, BookOpen, Star, TrendingUp, Clock } from "lucide-react"
import UserNavbar from "../../components/UserNavbar"

const categories = [
  "All Books",
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Science Fiction",
  "Romance",
  "Biography",
  "Self-Help",
  "Business",
]

const filters = [
  { name: "Rating: 4+ Stars", icon: Star },
  { name: "Recently Added", icon: Clock },
  { name: "Trending Now", icon: TrendingUp },
  { name: "Quick Reads", icon: BookOpen },
]

const books = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "/placeholder.svg?height=400&width=300",
    rating: 4.8,
    category: "Fiction",
    readers: "2.3M readers",
    description: "Between life and death there is a library...",
  },
  // Add more dummy books...
]

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState("All Books")
  const [activeFilters, setActiveFilters] = useState([])

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Browse Our Collection</h1>
          <p className="text-lg text-muted-foreground">Discover thousands of books across various genres</p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input type="text" placeholder="Search by title, author, or ISBN..." className="w-full pl-10 pr-4 h-12" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
          <Button className="bg-gradient">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Categories Tabs */}
        <Tabs defaultValue="All Books" className="mb-8">
          <TabsList className="w-full overflow-x-auto flex-wrap justify-start h-auto p-2 bg-background">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-4 py-2 rounded-full data-[state=active]:bg-gradient data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => (
            <Button
              key={filter.name}
              variant="outline"
              className="rounded-full hover:bg-gradient hover:text-white transition-all duration-300"
            >
              <filter.icon className="mr-2 h-4 w-4" />
              {filter.name}
            </Button>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="modern-card group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm line-clamp-3">{book.description}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{book.readers}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <Button className="bg-gradient px-8">Load More Books</Button>
        </div>
      </main>
    </div>
  )
}

