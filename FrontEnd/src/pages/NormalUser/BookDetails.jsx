"use client"

import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft, Loader2, BookOpen, RefreshCw } from "lucide-react"
import BookDetailsComponent from "../../components/BookDetailsComponent"
import RelatedBooks from "../../components/RelatedBooks"
import { useEffect, useState } from "react"
import UserNavbar from "../../components/UserNavbar"
import { Card, CardContent } from "../../components/ui/card"
import { useVoiceCommand } from "../../contexts/VoiceCommandContext"
import VoiceCommandListener from "../../components/VoiceCommandListener"
import VoiceCommandHelp from "../../components/VoiceCommandHelp"

export default function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [relatedByAuthor, setRelatedByAuthor] = useState([])
  const [relatedByCategory, setRelatedByCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isListening, lastCommand } = useVoiceCommand()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchCurrentBook = async () => {
      try {
        setLoading(true)
        setError(null)

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
        setRelatedByAuthor(data.related_by_author || [])
        setRelatedByCategory(data.related_by_category || [])
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
      <main className="min-h-screen flex flex-col bg-background">
        <UserNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading book details...</p>
          </div>
        </div>
        <VoiceCommandListener />
        <VoiceCommandHelp />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <UserNavbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-8 hover:bg-primary/10 transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/home")} variant="outline">
                  Return to Home
                </Button>
                <Button onClick={() => window.location.reload()} className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <VoiceCommandListener />
        <VoiceCommandHelp />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <UserNavbar />

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
          className="mb-8 hover:bg-primary/10 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Book Details */}
        <BookDetailsComponent book={book} />

        {/* Related Books */}
        <RelatedBooks relatedByAuthor={relatedByAuthor} relatedByCategory={relatedByCategory} />
      </motion.div>
      <VoiceCommandListener />
      <VoiceCommandHelp />
    </main>
  )
}
