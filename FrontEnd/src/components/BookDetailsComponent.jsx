import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Bookmark, Share2, BookmarkCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import BookReviews from "./BookReviews"
import BookComments from "./BookComments"

export default function BookDetailsComponent({ book }) {
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("reviews")
  const [isBookmarked, setIsBookmarked] = useState(undefined)

  useEffect(() => {
    
  }, [])

  const handleBookmarks = async () => {
    if (isBookmarked === false||isBookmarked===undefined) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book.book_id}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Failed to update bookmark: ${errorData}`)
        }

        const data = await response.json()
        console.log("Updated bookmark status:", data)
        
        setIsBookmarked(true)
      } catch (error) {
        console.error("Error updating bookmark:", error)
      }
    }
    else {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book.book_id}/user`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Failed to update bookmark: ${errorData}`)
        }

        const data = await response.json()
        console.log("Updated bookmark status:", data)
        setIsBookmarked(false)
      } catch (error) {
        console.error("Error updating bookmark:", error)
      }
    }
  }

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!book || !book.book_id) return

      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${book.book_id}/author`, {
          headers: { Authorization: `${localStorage.getItem("token")}` },
          method: "GET",
        })

        if (!response.ok) throw new Error("Failed to fetch author data")

        const data = await response.json()
        setAuthor(data)
      } catch (error) {
        console.error(error)
        setAuthor(null)
      } finally {
        setLoading(false)
      }
    }
    const fetchBookmarkStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/book/${book.book_id}/user`, {
          headers: { Authorization: `${localStorage.getItem("token")}` },
          method: "GET",
        })
        if (!response.ok) throw new Error("Failed to fetch bookmark status")

        const data = await response.json()
        console.log("Fetched bookmark status:", data.is_bookmarked)
        setIsBookmarked(data.is_bookmarked)
      } catch (error) {
        console.error("Error fetching bookmark status:", error)
      }
    }

    fetchBookmarkStatus()

    fetchAuthor()
  }, [book])

  const handleReadNow = async () => {
    try {
      const filePath = book.file_url.replace("uploads/", "")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${filePath}`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      window.open(`${import.meta.env.VITE_BASE_API_URL}/books/${filePath}`, "_blank", "noopener, noreferrer")
      addView();
      addReadingHistory();
    } catch (err) {
      console.error("Error fetching PDF:", err)
    }
  }

  const addView = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books_views/${book.book_id}/add-view`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ book_id: book.book_id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
    } catch (err) {
      console.error("Error adding view:", err)
    }
  }

  const addReadingHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/reading_history/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ book_id: book.book_id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
    } catch (err) {
      console.error("Error adding history:", err)
    }
  }

  if (!book) {
    return <p className="text-center text-red-500">Book not found.</p>
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Book Cover & Actions */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img
            src={
              book.cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"
            }
            alt={book.title}
            className="w-3/4 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="mt-4 space-y-4">
            
            <Button className="w-3/4 hover:bg-primary/90 transition-colors duration-300" onClick={handleReadNow}>
              Continue Reading
            </Button>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10 transition-colors duration-300"
                onClick={handleBookmarks}
              >
                {isBookmarked === undefined ? (
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                ) : isBookmarked === true ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Book Details */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 hover:text-primary transition-colors duration-300">{book.title}</h1>

          {/* Author Name with Loading State */}
          <p className="text-xl text-muted-foreground mb-4">
            {loading ? "Fetching author..." : author?.author_name || "Unknown Author"}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {book.categories?.length > 0 ? (
              book.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="hover:bg-primary/20 transition-colors duration-300">
                  {category}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                No Category
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{book.description}</p>

          {/* Tabs for Reviews and Comments */}
          <div className="border-b mb-6">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className={activeTab === "reviews" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </Button>
              <Button
                variant="ghost"
                className={
                  activeTab === "comments" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                }
                onClick={() => setActiveTab("comments")}
              >
                Comments
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "reviews" && <BookReviews reviews={book.reviews} loading={loading} />}
            {activeTab === "comments" && <BookComments bookId={book.book_id} />}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

