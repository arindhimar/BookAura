import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft } from "lucide-react"
import BookDetailsComponent from "../../components/BookDetailsComponent"
import RelatedBooks from "../../components/RelatedBooks"
import { useEffect, useState } from "react"
import Navbar from "../../components/UserNavbar" // Import the UserNavbar component

export default function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [userName, setUserName] = useState("User") // State for username

  useEffect(() => {
    const fetchCurrentBook = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/books/full/${id}`,
          {
            headers: { Authorization: `${localStorage.getItem("token")}` },
            method: "GET",
          }
        )

        if (!response.ok) throw new Error("Failed to fetch book data")
        
        const data = await response.json()
        setBook(data.book)
      } catch (error) {
        console.error(error)
        setBook(null)
      }
    }

    fetchCurrentBook()

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      localStorage.clear()
    }

    // Fetch username from localStorage
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      setUserName(user.username)
    }
  }, [id, navigate])

  return (
    <main className="min-h-screen flex flex-col">
      {/* Add the UserNavbar component */}
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


        {/* Book Details and Related Books */}
        <BookDetailsComponent book={book} />
        <RelatedBooks book={book} />
      </motion.div>
    </main>
  )
}