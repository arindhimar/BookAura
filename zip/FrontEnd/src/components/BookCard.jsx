"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, MoreVertical, Bookmark, BookmarkCheck, Share, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

// Reusable BookCard component that can be used across the application
export default function BookCard({ book, index = 0, showButton = false, onClick, className = "" }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const navigate = useNavigate()

  // Handle different book data structures
  const bookId = book.book_id
  const title = book.title || (book.book_details && book.book_details.title)
  const authorName = book.author_name || (book.book_details && book.book_details.author_name) || "Unknown Author"
  const cover = book.cover || (book.book_details && book.book_details.cover)
  const views = book.views || (book.book_details && book.book_details.views) || 0
  const progress = book.progress || (book.book_details && book.book_details.progress)
  const lastRead = book.last_read_at || book.lastRead || (book.book_details && book.book_details.last_read_at)

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
      transition={{ delay: index * 0.1 }}
      className={`group ${className}`}
    >
      <Card className="cursor-pointer relative h-full" onClick={handleCardClick}>
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white"
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
              cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg" ||
              "/placeholder.svg"
            }
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {progress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-semibold mb-1 line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{authorName}</p>
          <div className="flex items-center text-muted-foreground mb-1">
            <Eye className="h-3 w-3 mr-1" />
            <span className="text-xs">{views} views</span>
          </div>
          {progress && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progress}%</span>
              {lastRead && (
                <span className="text-muted-foreground text-xs">{new Date(lastRead).toLocaleDateString()}</span>
              )}
            </div>
          )}
          {showButton && (
            <Button asChild variant="outline" size="sm" className="w-full mt-2 text-xs h-8">
              <Link to={`/book/${bookId}`}>View Details</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

