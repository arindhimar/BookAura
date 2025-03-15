import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, MoreVertical, Bookmark, BookmarkCheck, Share, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useState, useEffect } from "react"

export default function Recommendations({ books, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <p className="text-muted-foreground">Loading recommendations...</p>
      </section>
    )
  }

  if (books.length === 0) {
    return (
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <p className="text-muted-foreground">No recommendations available yet. Try exploring more books!</p>
      </section>
    )
  }

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map((book, index) => (
          <BookCard key={book.book_id} book={book} index={index} />
        ))}
      </div>
    </section>
  )
}

function BookCard({ book, index }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const navigate = useNavigate()

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

    // checkBookmarkStatus()
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="cursor-pointer relative" onClick={() => navigate(`/book/${book.book_id}`)}>
        {/* <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
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
        </div> */}

        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={
              book.cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"
            }
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1">{book.title}</h3>
          <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{book.author_name || "Unknown Author"}</p>
          <div className="flex items-center text-muted-foreground mb-2">
            <Eye className="h-3 w-3 mr-1" />
            <span className="text-xs">{book.views || 0} views</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}