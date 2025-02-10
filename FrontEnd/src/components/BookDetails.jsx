"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Heart, Share2 } from "lucide-react"
import { Link } from "react-router-dom"

const BookDetails = ({ book }) => {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                className="h-48 w-full object-cover md:h-full md:w-48"
                src={book.coverUrl || "/placeholder.svg"}
                alt={book.title}
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{book.genre}</div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{book.title}</h1>
              <p className="mt-2 text-gray-600">by {book.author}</p>
              <p className="mt-4 text-gray-500">{book.description}</p>
              <div className="mt-6 flex items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{book.pages}</span> pages
                </div>
                <div className="ml-6 text-sm text-gray-600">
                  Published: <span className="font-medium">{book.publishedDate}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 py-4 bg-gray-50 flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Start Reading
            </motion.button>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full ${isLiked ? "bg-pink-100 text-pink-500" : "bg-gray-200 text-gray-600"}`}
              >
                <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-gray-200 text-gray-600 rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetails

