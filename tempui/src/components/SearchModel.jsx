"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-[#FAF7F4] p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search in My Library"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-neutral-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button onClick={onClose} className="rounded-full p-1 hover:bg-neutral-200">
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>

          {searchQuery && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-neutral-500">Search results will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal

