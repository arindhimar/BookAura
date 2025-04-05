"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../../components/UserNavbar"
import RecentlyRead from "../../components/RecentlyRead"
import Recommendations from "../../components/Recommendations"
import ExploreBooks from "../../components/ExploreBooks"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [userName, setUserName] = useState("User")
  const [recentBooks, setRecentBooks] = useState([])
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/me`, {
          headers: { Authorization: token },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUserName(data.user.username || "User")
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load user data. Please try again.")
      }
    }

    // Fetch recently read books
    const fetchRecentlyRead = async () => {
      try {
        setLoadingRecent(true)
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/reading_history/user`, {
          headers: { Authorization: token },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recently read books")
        }

        const data = await response.json()
        setRecentBooks(data)
      } catch (error) {
        console.error("Error fetching recently read books:", error)
        setError("Failed to load reading history. Please try again.")
      } finally {
        setLoadingRecent(false)
      }
    }

    // Fetch recommendations
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true)
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/`, {
          headers: { Authorization: token },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await response.json()
        setRecommendedBooks(data)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        setError("Failed to load recommendations. Please try again.")
      } finally {
        setLoadingRecommendations(false)
      }
    }

    fetchUserData()
    fetchRecentlyRead()
    fetchRecommendations()
  }, [navigate])

  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-md">
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (loadingRecent && loadingRecommendations) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        <motion.h1
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome back to BookAura, {userName}!
        </motion.h1>
        <ExploreBooks />
        <RecentlyRead books={recentBooks} loading={loadingRecent} />
        <Recommendations books={recommendedBooks} loading={loadingRecommendations} />
      </motion.div>
    </main>
  )
}

