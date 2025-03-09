"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Bookmark, BookmarkCheck, Headphones } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function BookDetailsComponent({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(undefined)
  const [selectedLanguage, setSelectedLanguage] = useState("english") // Default language
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState(null)

  const handleBookmarks = async () => {
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

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
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
        console.error("Error fetching bookmark status:", error)
      }
    }

    if (book) fetchBookmarkStatus()

    // Cleanup audio when component unmounts
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
      }
    }
  }, [book, audio])

  const addView = () => {
    // Implementation for addView function
    console.log("addView function called")
  }

  const addReadingHistory = () => {
    // Implementation for addReadingHistory function
    console.log("addReadingHistory function called")
  }

  const handleReadNow = async () => {
    try {
      const filePath = book.fileUrl.replace("uploads/", "")

      // Append the selected language as a query parameter
      const language = selectedLanguage
      const url = `${import.meta.env.VITE_BASE_API_URL}/books/${filePath}?language=${language}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      window.open(url, "_blank", "noopener, noreferrer")
      addView()
      addReadingHistory()
    } catch (err) {
      console.error("Error fetching PDF:", err)
    }
  }

  const handleListenNow = async () => {
    try {
      if (isPlaying && audio) {
        audio.pause()
        setIsPlaying(false)
        return
      }

      // Create URL for audio based on selected language
      const audioUrl = `${import.meta.env.VITE_BASE_API_URL}/books/audio/${book.book_id}?language=${selectedLanguage}`

      // Create new audio instance or reuse existing
      const audioInstance = audio || new Audio(audioUrl)

      if (!audio) {
        setAudio(audioInstance)
        audioInstance.addEventListener("ended", () => setIsPlaying(false))
      } else {
        audioInstance.src = audioUrl
      }

      await audioInstance.play()
      setIsPlaying(true)
    } catch (err) {
      console.error("Error playing audio:", err)
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
        <motion.div className="md:col-span-1 flex flex-col items-center">
          <img
            src={
              book.cover ||
              "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"
            }
            alt={book.title}
            className="w-full max-w-xs rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="mt-6 w-full max-w-xs space-y-4">
            {/* Language Selection Dropdown */}
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full hover:bg-primary/90 transition-colors duration-300" onClick={handleReadNow}>
              Continue Reading
            </Button>

            <Button
              variant={isPlaying ? "secondary" : "outline"}
              className="w-full transition-colors duration-300 flex items-center justify-center gap-2"
              onClick={handleListenNow}
            >
              <Headphones className="h-4 w-4" />
              {isPlaying ? "Pause Audio" : "Listen Now"}
            </Button>
          </div>
        </motion.div>

        {/* Book Details */}
        <motion.div className="md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="text-xl text-muted-foreground mt-2">{book.author_name || "Unknown Author"}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleBookmarks} className="ml-4">
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {book.categories ? (
              book.categories.split(",").map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category.trim()}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No Category</Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-8">{book.description}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

