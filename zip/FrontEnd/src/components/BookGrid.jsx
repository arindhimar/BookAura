"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Eye, MoreVertical, Bookmark, BookmarkCheck, Share, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export default function BookGrid({ books, loading, title }) {
  const navigate = useNavigate()

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading {title}...</p>
  }

  if (!books.length) {
    return <p className="text-center text-muted-foreground">No books in {title}.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <BookCard key={book.book_id} book={book} index={index} navigate={navigate} />
      ))}
    </div>
  )
}

function BookCard({ book, index, navigate }) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book?.book_id}/user`, {
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
  }, [book])

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const method = isBookmarked ? "DELETE" : "POST"
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book?.book_id}/user`, {
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

    const url = `${window.location.origin}/book/${book.book_id}`
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  return (
    <motion.div
      key={book.book_id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div
        className="modern-card group cursor-pointer relative h-full"
        onClick={() => navigate(`/book/${book.book_id}`)}
      >
        <div className="absolute top-2 right-2 z-10">
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

        <div className="relative aspect-[2/3] overflow-hidden rounded-t-md">
          <img
            src={
              book.cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"
            }
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {book.progress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-primary" style={{ width: `${book.progress}%` }} />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{book.author_name || "Unknown Author"}</p>
          <div className="flex items-center text-muted-foreground mt-1">
            <Eye className="h-3 w-3 mr-1" />
            <span className="text-xs">{book.views || 0} views</span>
          </div>
          {book.progress && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{book.progress}%</span>
              {book.lastRead && (
                <span className="text-muted-foreground text-xs">{new Date(book.lastRead).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

