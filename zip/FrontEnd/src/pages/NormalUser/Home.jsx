import Navbar from "../../components/UserNavbar"
import RecentlyRead from "../../components/RecentlyRead"
import Recommendations from "../../components/Recommendations"
import ExploreBooks from "../../components/ExploreBooks"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [userName, setUserName] = useState("User")
  const [recentBooks, setRecentBooks] = useState([])
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      localStorage.clear()
    }

    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      setUserName(user.username)
    }

    // Fetch recently read books
    const fetchRecentlyRead = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/reading_history/user`, {
          headers: { Authorization: token },
        })

        if (!response.ok) throw new Error("Failed to fetch recently read books")

        const data = await response.json()
        
        setRecentBooks(data)
      } catch (error) {
        console.error("Error fetching recently read books:", error)
      } finally {
        setLoadingRecent(false)
      }
    }

    // Fetch recommendations
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/`, {
          headers: { Authorization: token },
        })

        if (!response.ok) throw new Error("Failed to fetch recommendations")

        const data = await response.json()
        setRecommendedBooks(data)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoadingRecommendations(false)
      }
    }

    fetchRecentlyRead()
    fetchRecommendations()
  }, [navigate])

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
          Welcome back to BookAura!!, {userName}
        </motion.h1>
        <ExploreBooks />
        <RecentlyRead books={recentBooks} loading={loadingRecent} />
        <Recommendations books={recommendedBooks} loading={loadingRecommendations} />
      </motion.div>
    </main>
  )
}