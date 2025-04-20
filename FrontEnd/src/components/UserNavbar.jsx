"use client"

import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ModeToggle } from "./ModeToggle"
import { Search, Bell, BookOpen, Menu, LogOut, Library, Home, Compass, Mic, MicOff } from "lucide-react"
import { Input } from "./ui/input"
import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "./ui/badge"
import { useVoiceCommand } from "../contexts/VoiceCommandContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function UserNavbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(3) // Example notification count
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isListening, toggleListening, supportsSpeechRecognition } = useVoiceCommand()

  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/search/${query}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
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

  useEffect(() => {
    // Handle clicks outside search results
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    // Listen for voice search commands
    const handleVoiceSearch = (event) => {
      const { searchTerm } = event.detail
      setSearchQuery(searchTerm)
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        setIsSearchFocused(true)
      }
      // Immediately trigger search
      fetchSearchResults(searchTerm)
    }

    window.addEventListener("voiceSearch", handleVoiceSearch)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("voiceSearch", handleVoiceSearch)
    }
  }, [])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const logOut = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Browse", path: "/browse", icon: Compass },
    { name: "Categories", path: "/categories", icon: BookOpen },
    { name: "My Library", path: "/my-library", icon: Library },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                BookAura
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.path) ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar with Results */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search books..."
                  className="pl-10 pr-4 py-2 w-64 rounded-full border-primary/20 focus:border-primary transition-all duration-300 focus:w-80"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 left-0 w-full bg-background border border-border shadow-lg rounded-lg p-2 z-50 overflow-hidden"
                  >
                    {searchResults.map((book) => (
                      <motion.div
                        key={book.book_id}
                        whileHover={{ backgroundColor: "rgba(var(--primary), 0.1)" }}
                        className="p-2 cursor-pointer rounded-md flex items-center space-x-3"
                        onClick={() => {
                          navigate(`/book/${book.book_id}`)
                          setIsSearchFocused(false)
                          setSearchQuery("")
                        }}
                      >
                        <img
                          src={
                            "http://127.0.0.1:5000/books/" + book.cover_url ||
                            "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={book.title}
                          className="h-12 w-9 rounded-md object-cover shadow-sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium line-clamp-1">{book.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {book.author_name || "Unknown Author"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ModeToggle />

            {/* Voice Command Button */}
            {supportsSpeechRecognition && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isListening ? "default" : "ghost"}
                      size="icon"
                      onClick={toggleListening}
                      className={isListening ? "bg-primary text-primary-foreground" : ""}
                    >
                      {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? "Stop voice commands" : "Start voice commands"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="@johndoe" />
                    <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col h-full py-6">
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search books..."
                        className="pl-10 pr-4 py-2 w-full rounded-full border-primary/20 focus:border-primary"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-2 bg-background border border-border rounded-lg p-2">
                        {searchResults.slice(0, 5).map((book) => (
                          <div
                            key={book.book_id}
                            className="p-2 cursor-pointer hover:bg-muted rounded-md flex items-center space-x-3"
                            onClick={() => {
                              navigate(`/book/${book.book_id}`)
                              setSearchQuery("")
                            }}
                          >
                            <img
                              src={
                                "http://127.0.0.1:5000/books/" + book.cover_url ||
                                "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={book.title}
                              className="h-12 w-9 rounded-md object-cover"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium line-clamp-1">{book.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {book.author_name || "Unknown Author"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          isActive(item.path) ? "bg-primary/10 text-primary" : "hover:bg-primary/5 hover:text-primary"
                        }`}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {supportsSpeechRecognition && (
                    <div className="mt-4">
                      <Button
                        variant={isListening ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={toggleListening}
                      >
                        {isListening ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                        <span>{isListening ? "Stop voice commands" : "Start voice commands"}</span>
                      </Button>
                    </div>
                  )}

                  <div className="mt-auto">
                    <Button variant="outline" className="w-full justify-start" onClick={logOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
