import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ModeToggle } from "./ModeToggle"
import { Search, Bell, BookOpen, Bookmark, User, Menu } from "lucide-react"
import { Input } from "./ui/input"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function UserNavbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  
  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/search/${query}`, {
        headers: {
          "Authorization": `${localStorage.getItem("token")}`
        },
        method: "GET",
      })

      const books = await response.json()
      setSearchResults(books)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchQuery)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const logOut = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full filter blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <motion.span
                  className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  BookAura
                </motion.span>
              </Link>

              <div className="hidden md:flex md:space-x-1 ml-10">
                {["Home", "Categories", "My Library"].map((item) => (
                  <Link
                    key={item}
                    to={item === "Home" ? "/home" : `/${item.toLowerCase().replace(" ", "-")}`}
                    className="relative group px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <span className="relative z-10 text-foreground group-hover:text-primary-foreground transition-colors">
                      {item}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-primary opacity-0 rounded-full"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar with Results */}
              <motion.div
                className={`hidden md:block relative ${isSearchFocused ? "w-72" : "w-48"}`}
                animate={{ width: isSearchFocused ? 288 : 192 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="text"
                  placeholder="Search books..."
                  className="pl-10 pr-4 py-2 rounded-full transition-all duration-300 border-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

                {/* Search Results Dropdown */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-12 left-0 w-full bg-background border border-primary/20 shadow-lg rounded-lg p-2">
                    {searchResults.map((book) => (
                      <div
                        key={book.book_id}
                        className="p-2 cursor-pointer hover:bg-primary/10 rounded-md flex items-center space-x-3"
                        onClick={() => navigate(`/book/${book.book_id}`)}
                      >
                        <img src={book.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"} alt={book.title} className="h-10 w-10 rounded-md object-cover" />
                        <span className="text-sm font-medium">{book.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <ModeToggle />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors duration-300">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
                </Button>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Avatar className="cursor-pointer ring-2 ring-primary/20 hover:ring-primary transition-all duration-300">
                      <AvatarImage src="/placeholder-user.jpg" alt="@johndoe" />
                      <AvatarFallback className="bg-primary/10">JD</AvatarFallback>
                    </Avatar>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="group cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-primary group-hover:text-primary-foreground" />
                    <span className="group-hover:text-primary-foreground">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logOut} className="group cursor-pointer">
                    <span className="group-hover:text-primary-foreground">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
