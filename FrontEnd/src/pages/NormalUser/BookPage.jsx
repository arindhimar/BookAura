import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
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
import RecommendationList from "../../components/RecommendationList"
import FullPageReader from "../../components/FullPageReader"

export default function BookPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    console.log(id)
    const fetchBookAndAuthor = async () => {
      try {
        const bookResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${id}`)
        if (!bookResponse.ok) {
          throw new Error("Failed to fetch book details")
        }
        const bookData = await bookResponse.json()
        setBook(bookData)

        if (bookData.author_id) {
          const authorResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/${bookData.author_id}`)
          if (!authorResponse.ok) {
            throw new Error("Failed to fetch author details")
          }
          const authorData = await authorResponse.json()
          setAuthor(authorData)
        }
          
        // // Fetching recommendations
        // const recommendationsResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/recommendations`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ user_id: bookData.author_id, categories: bookData.categories }),
        // })

        // if (!recommendationsResponse.ok) {
        //   throw new Error("Failed to fetch recommendations")
        // }
        // const recommendationsData = await recommendationsResponse.json()
        // setRecommendations(recommendationsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBookAndAuthor()
  }, [id])

  const handleReadNow = async () => {
    try {
      console.log(book.file_url.replace("uploads/", ""))
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${book.file_url.replace("uploads/", "")}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }




      window.open(`${import.meta.env.VITE_BASE_API_URL}/books/${book.file_url.replace("uploads/", "")}`, '_blank', 'noopener, noreferrer');

      const pdfBlob = await response.blob() 
      const pdfUrl = URL.createObjectURL(pdfBlob)
      console.log(pdfUrl)
      addView();
      setPdfUrl(pdfUrl)
      setIsReaderOpen(true)
    } catch (err) {
      console.error("Error fetching PDF:", err)
    }
  }
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </div>
    )
  }

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!book) return <div className="min-h-screen flex items-center justify-center">Book not found</div>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <Link
          to="/home"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Link>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6 bg-gradient-to-br from-indigo-100 to-purple-100">
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
                  src={book.coverPageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e"}
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
                    className="uppercase tracking-wide text-sm text-indigo-600 font-semibold"
                  >
                    {book.categories &&
                      book.categories.map((category, index) => (
                        <span key={index} className="mr-2">
                          {category}
                        </span>
                      ))}
                  </motion.div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-2 text-4xl font-bold text-gray-900"
                  >
                    {book.title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-2 text-xl text-gray-600"
                  >
                    by {author ? author.username : "Unknown Author"}
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
                      className={`h-5 w-5 ${i < Math.floor(book.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">{book.rating || "Not rated"}</span>
                </motion.div>
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500"
              >
                {book.readTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {book.readTime}
                  </div>
                )}
                {book.pages && (
                  <div className="flex items-center">
                    <BookMarked className="h-4 w-4 mr-1" />
                    {book.pages} pages
                  </div>
                )}
                {book.totalReads && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {book.totalReads.toLocaleString()} reads
                  </div>
                )}
                {book.language && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    {book.language}
                  </div>
                )}
                {book.publisher && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {book.publisher}
                  </div>
                )}
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-4 relative"
              >
                <p className={`text-gray-600 leading-relaxed ${showFullDescription ? "" : "line-clamp-3"}`}>
                  {book.description || "No description available."}
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
                  {book.publishedDate && (
                    <p className="text-sm text-gray-600">
                      Published: <span className="font-medium">{book.publishedDate}</span>
                    </p>
                  )}
                  {book.isbn && (
                    <p className="text-sm text-gray-600">
                      ISBN: <span className="font-medium">{book.isbn}</span>
                    </p>
                  )}
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center shadow-lg"
                    onClick={handleReadNow}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Start Reading
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full flex items-center shadow-lg"
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
          {book.reviews && book.reviews.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-4">
                {book.reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="bg-white p-4 rounded-xl shadow-md"
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
          )}
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
          <RecommendationList recommendations={recommendations} />
        </motion.div>

        {/* Full Page Reader */}
        <AnimatePresence>
          {isReaderOpen && (
            <FullPageReader
              bookUrl={pdfUrl}
              onClose={() => setIsReaderOpen(false)}
              title={book.title}
              author={author ? author.username : "Unknown Author"}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

