"use client"

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
import { Search, Bell, BookOpen, User, Menu } from "lucide-react"
import { Input } from "./ui/input"
import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

export default function UserNavbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

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
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const logOut = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Categories", path: "/categories" },
    { name: "My Library", path: "/my-library" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">BookAura</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-white"
                >
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
                  type="text"
                  placeholder="Search books..."
                  className="pl-10 pr-4 py-2 w-64 rounded-full border-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-background border border-border shadow-lg rounded-lg p-2 z-50">
                  {searchResults.map((book) => (
                    <div
                      key={book.book_id}
                      className="p-2 cursor-pointer hover:bg-muted rounded-md flex items-center space-x-3"
                      onClick={() => {
                        navigate(`/book/${book.book_id}`)
                        setIsSearchFocused(false)
                      }}
                    >
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span className="text-sm font-medium">{book.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ModeToggle />

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="@johndoe" />
                  <AvatarFallback className="bg-primary/10">JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Author</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logOut} className="cursor-pointer">
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
                            }}
                          >
                            <img
                              src={book.cover || "/placeholder.svg"}
                              alt={book.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <span className="text-sm font-medium">{book.title}</span>
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
                        className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-white"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Button variant="outline" className="w-full justify-start" onClick={logOut}>
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

