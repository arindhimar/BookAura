import Navbar from "../../components/UserNavbar"
import RecentlyRead from "../../components/RecentlyRead"
import Recommendations from "../../components/Recommendations"
// import Footer from "../../components/Footer"
import ExploreBooks from "../../components/ExploreBooks"
import { motion } from "framer-motion"
import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Home() {
  const [userName , setUserName] = useState("User");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      localStorage.clear();
    }
    
    const user = JSON.parse(localStorage.getItem("user"));

    if(user){
      setUserName(user.username);
    }
  }
  , [])


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
        <RecentlyRead />
        <Recommendations />
      </motion.div>
      {/* <Footer /> */}
    </main>
  )
}

