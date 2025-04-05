"use client"

import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import BookDetailsComponent from "../../components/BookDetailsComponent"
import RelatedBooks from "../../components/RelatedBooks"
import { useEffect, useState } from "react"
import Navbar from "../../components/UserNavbar"

export default function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [relatedByAuthor, setRelatedByAuthor] = useState([])
  const [relatedByCategory, setRelatedByCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchCurrentBook = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/full/${id}`, {
          headers: { Authorization: token },
          method: "GET",
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Book not found")
          }
          throw new Error("Failed to fetch book data")
        }

        const data = await response.json()
        setBook(data.book)
        setRelatedByAuthor(data.related_books_by_author || [])
        setRelatedByCategory(data.related_books_by_category || [])
      } catch (error) {
        console.error(error)
        setError(error.message || "An error occurred while loading the book")
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentBook()
  }, [id, navigate])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 hover:bg-primary/10 transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
            <p className="text-muted-foreground mb-6">The book you're looking for could not be loaded.</p>
            <Button onClick={() => navigate("/home")}>Return to Home</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4 hover:bg-primary/10 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Book Details */}
        <BookDetailsComponent book={book} />

        {/* Pass related books to RelatedBooks component */}
        <RelatedBooks relatedByAuthor={relatedByAuthor} relatedByCategory={relatedByCategory} />
      </motion.div>
    </main>
  )
}

