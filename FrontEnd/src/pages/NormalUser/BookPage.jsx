import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Share2,
  Star,
  Clock,
  BookMarked,
  Users,
  ChevronDown,
  Headphones,
  Globe,
  Building,
} from "lucide-react"
import { Link } from "react-router-dom"

const getBook = async (id) => {
  // In a real application, you would fetch the book data from an API
  // For this example, we'll return enhanced mock data matching the provided format
  const mockBook = {
    book_id: id,
    author_id: 2,
    title: "The Great Gatsby",
    description:
      "Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
    author: "F. Scott Fitzgerald",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
    publishedDate: "April 10, 1925",
    pages: 218,
    genre: "Classic Literature",
    language: "English",
    publisher: "Charles Scribner's Sons",
    isbn: "9780743273565",
    rating: 4.5,
    readTime: "6 hours",
    totalReads: 1000000,
    reviews: [
      { user: "John Doe", comment: "A timeless classic that never fails to captivate.", rating: 5 },
      { user: "Jane Smith", comment: "Fitzgerald's prose is simply mesmerizing.", rating: 4 },
      { user: "Bob Johnson", comment: "A must-read for any literature enthusiast.", rating: 5 },
    ],
    similarBooks: [
      {
        book_id: "2",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        coverUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19",
      },
      {
        book_id: "3",
        title: "1984",
        author: "George Orwell",
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      },
      {
        book_id: "4",
        title: "1984",
        author: "George Orwell",
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      },
    ],
  }

  return mockBook
}

const BookPage = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        console.log("Extracted Book ID from URL:", id)
        const bookData = await getBook(id)
        console.log("Received Book Data:", bookData)
        setBook(bookData)
      } catch (err) {
        setError("Failed to fetch book details")
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </div>
    )
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!book) return <div className="min-h-screen flex items-center justify-center">Book not found</div>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Link>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6 bg-[#f0e7db]">
              <motion.div
                className="relative aspect-[2/3] w-[200px] mx-auto md:w-[300px]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "translateZ(0)",
                }}
                whileHover={{
                  rotateY: -15,
                  rotateX: 5,
                  translateY: -8,
                  transition: { duration: 0.2 },
                }}
              >
                <img
                  className="w-full h-full object-cover rounded-lg shadow-md"
                  src={book.coverUrl || "/placeholder.svg"}
                  alt={book.title}
                />
                <div className="absolute inset-y-0 left-0 w-[4px] bg-gray-300 rounded-l-lg transform -translate-x-[2px]" />
                <div
                  className="absolute -bottom-[4px] left-1 right-1 h-[8px] bg-black/20 blur-[2px]"
                  style={{ transform: "rotateX(80deg)" }}
                />
              </motion.div>
            </div>
            <div className="p-8 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="uppercase tracking-wide text-sm text-indigo-500 font-semibold"
                  >
                    {book.genre}
                  </motion.div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-2 text-3xl font-bold text-gray-900"
                  >
                    {book.title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-2 text-xl text-gray-600"
                  >
                    by {book.author}
                  </motion.p>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center"
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(book.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">{book.rating}</span>
                </motion.div>
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500"
              >
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {book.readTime}
                </div>
                <div className="flex items-center">
                  <BookMarked className="h-4 w-4 mr-1" />
                  {book.pages} pages
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {book.totalReads.toLocaleString()} reads
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {book.language}
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {book.publisher}
                </div>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-4"
              >
                <p className={`text-gray-500 leading-relaxed ${showFullDescription ? "" : "line-clamp-3"}`}>
                  {book.description}
                </p>
                <AnimatePresence>
                  {!showFullDescription && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"
                    />
                  )}
                </AnimatePresence>
                <motion.button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showFullDescription ? "Show less" : "Show more"}
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transform transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                  />
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    Published: <span className="font-medium">{book.publishedDate}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    ISBN: <span className="font-medium">{book.isbn}</span>
                  </p>
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Start Reading
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"
                  >
                    <Headphones className="h-5 w-5 mr-2" />
                    Listen
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full ${isLiked ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-600"}`}
                  >
                    <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="px-8 py-6 bg-gray-50"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            <div className="space-y-4">
              {book.reviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{review.user}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="px-8 py-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Books</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {book.similarBooks.map((similarBook, index) => (
                <motion.div
                  key={similarBook.book_id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                >
                  <Link to={`/book/${similarBook.book_id}`} className="group">
                    <div className="aspect-w-2 aspect-h-3 rounded-lg overflow-hidden">
                      <img
                        src={similarBook.coverUrl || "/placeholder.svg"}
                        alt={similarBook.title}
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">{similarBook.title}</p>
                    <p className="text-sm text-gray-500">{similarBook.author}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default BookPage

