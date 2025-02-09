"use client"

import { useState } from "react"
import Navbar from "./components/Navbar"
import SearchModal from "./components/SearchModal"
import ProfileLayout from "./components/ProfileLayout"
import Profile from "./pages/Profile"
import LikedBooks from "./pages/LikedBooks"
import Favorites from "./pages/Favorites"
import Following from "./pages/Following"
import Notifications from "./pages/Notifications"
import ChangePassword from "./pages/ChangePassword"

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("profile")

  const renderPage = () => {
    switch (currentPage) {
      case "profile":
        return <Profile />
      case "liked":
        return <LikedBooks />
      case "favorites":
        return <Favorites />
      case "following":
        return <Following />
      case "notifications":
        return <Notifications />
      case "password":
        return <ChangePassword />
      default:
        return <Profile />
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ProfileLayout>{renderPage()}</ProfileLayout>
    </div>
  )
}

export default App

