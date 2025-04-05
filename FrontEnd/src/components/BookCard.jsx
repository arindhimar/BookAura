"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, MoreVertical, Bookmark, BookmarkCheck, Share, Heart, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

// Reusable BookCard component that can be used across the application
export default function BookCard({ book, index = 0, showButton = false, onClick, className = "" }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  // Handle different book data structures
  const bookId = book.book_id
  const title = book.title || (book.book_details && book.book_details.title)
  const authorName = book.author_name || (book.book_details && book.book_details.author_name) || "Unknown Author"
  const cover = book.cover || (book.book_details && book.book_details.cover)
  const coverUrl = book.cover_url || (book.book_details && book.book_details.cover_url)
  const views = book.views || (book.book_details && book.book_details.views) || 0
  const progress = book.progress || (book.book_details && book.book_details.progress)
  const lastRead = book.last_read_at || book.lastRead || (book.book_details && book.book_details.last_read_at)
  const categories = book.categories ? book.categories.split(",").map((c) => c.trim()) : []
  const rating = book.rating || (book.book_details && book.book_details.rating) || 4.5

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!bookId) return

      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${bookId}/user`, {
          headers: { Authorization: `${localStorage.getItem("token")}` },
          method: "GET",
        })

        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.is_bookmarked)
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error)
      }
    }

    checkBookmarkStatus()
  }, [bookId])

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const method = isBookmarked ? "DELETE" : "POST"
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${bookId}/user`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) throw new Error("Bookmark update failed")
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error("Error updating bookmark:", error)
    }
  }

  const shareBook = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/book/${bookId}`
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(book)
    } else {
      navigate(`/book/${bookId}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="cursor-pointer relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-border/40 hover:border-primary/20"
        onClick={handleCardClick}
      >
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleBookmark}>
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                    <span>Remove Bookmark</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    <span>Add to Bookmarks</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareBook}>
                <Share className="h-4 w-4 mr-2" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="h-4 w-4 mr-2" />
                <span>Add to Favorites</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={
              (coverUrl ? "http://127.0.0.1:5000/books/" + coverUrl : null) ||
              cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg" ||
              "/placeholder.svg"
            }
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick action buttons on hover */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookmark(e)
                    }}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isBookmarked ? "Remove Bookmark" : "Add Bookmark"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      shareBook(e)
                    }}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to Favorites</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {progress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <div className="flex items-center ml-2 flex-shrink-0">
              <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{authorName}</p>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.slice(0, 2).map((category, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {category}
                </Badge>
              ))}
              {categories.length > 2 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  +{categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center text-muted-foreground">
            <Eye className="h-3 w-3 mr-1" />
            <span className="text-xs">{views} views</span>
          </div>

          {progress && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progress}% complete</span>
              {lastRead && (
                <span className="text-muted-foreground text-xs">{new Date(lastRead).toLocaleDateString()}</span>
              )}
            </div>
          )}

          {showButton && (
            <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-8">
              View Details
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

