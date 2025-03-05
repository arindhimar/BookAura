"use client"

import { useState } from "react"

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchTerm)
  }

  return (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search PDF"
        className="border rounded-l px-2 py-1"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded-r">
        Search
      </button>
    </form>
  )
}

export default SearchBar

