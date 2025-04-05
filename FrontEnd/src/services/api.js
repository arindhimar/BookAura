// API service for BookAura application
import axios from "axios"

// Get base URL from environment variables
const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000"

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Check if the error is not from the login endpoint
      if (!error.config.url.includes("/auth/login")) {
        localStorage.removeItem("token")
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  },
)

// Books API
export const booksApi = {
  // Get all books
  getBooks: async () => {
    try {
      const response = await api.get("/books/")
      return response.data
    } catch (error) {
      console.error("Error fetching books:", error)
      throw error
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error)
      throw error
    }
  },

  // Get full book details including related books
  getFullBookDetails: async (id) => {
    try {
      const response = await api.get(`/books/full/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching full book details ${id}:`, error)
      throw error
    }
  },

  // Search books
  searchBooks: async (query) => {
    try {
      const response = await api.get(`/books/search/${query}`)
      return response.data
    } catch (error) {
      console.error(`Error searching books with query "${query}":`, error)
      throw error
    }
  },

  // Get books by category
  getBooksByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/books/category/${categoryId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching books for category ${categoryId}:`, error)
      throw error
    }
  },

  // Create a new book
  createBook: async (bookData) => {
    try {
      const formData = new FormData()

      // Add book data to form
      Object.keys(bookData).forEach((key) => {
        if (key === "file" || key === "cover") {
          if (bookData[key]) {
            formData.append(key, bookData[key])
          }
        } else if (key === "category_ids") {
          formData.append(key, JSON.stringify(bookData[key]))
        } else {
          formData.append(key, bookData[key])
        }
      })

      const response = await api.post("/books/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Error creating book:", error)
      throw error
    }
  },

  // Update a book
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData)
      return response.data
    } catch (error) {
      console.error(`Error updating book ${id}:`, error)
      throw error
    }
  },

  // Delete a book
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error)
      throw error
    }
  },

  // Get unread books for current user
  getUnreadBooks: async () => {
    try {
      const response = await api.get("/books/unread")
      return response.data
    } catch (error) {
      console.error("Error fetching unread books:", error)
      throw error
    }
  },

  // Get books by publisher (for publisher dashboard)
  getPublisherBooks: async () => {
    try {
      const response = await api.get("/books/publisher/")
      return response.data
    } catch (error) {
      console.error("Error fetching publisher books:", error)
      throw error
    }
  },
}

// Categories API
export const categoriesApi = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get("/categories/")
      return response.data
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error)
      throw error
    }
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/categories/", categoryData)
      return response.data
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  },

  // Update a category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData)
      return response.data
    } catch (error) {
      console.error(`Error updating category ${id}:`, error)
      throw error
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error)
      throw error
    }
  },

  // Get books organized by category
  getCategorizedBooks: async () => {
    try {
      const response = await api.get("/categories/books")
      return response.data
    } catch (error) {
      console.error("Error fetching categorized books:", error)
      throw error
    }
  },
}

// Reading History API
export const readingHistoryApi = {
  // Get user's reading history
  getUserHistory: async () => {
    try {
      const response = await api.get("/reading_history/user")
      return response.data
    } catch (error) {
      console.error("Error fetching reading history:", error)
      throw error
    }
  },

  // Update reading progress
  updateProgress: async (bookId, progress) => {
    try {
      const response = await api.post("/reading_history/", {
        book_id: bookId,
        progress: progress,
      })
      return response.data
    } catch (error) {
      console.error(`Error updating reading progress for book ${bookId}:`, error)
      throw error
    }
  },

  // Delete reading history for a book
  deleteHistory: async (bookId) => {
    try {
      const response = await api.delete(`/reading_history/book/${bookId}/user`)
      return response.data
    } catch (error) {
      console.error(`Error deleting reading history for book ${bookId}:`, error)
      throw error
    }
  },

  // Get in-progress book
  getInProgressBook: async () => {
    try {
      const response = await api.get("/reading_history/in-progress")
      return response.data
    } catch (error) {
      console.error("Error fetching in-progress book:", error)
      throw error
    }
  },
}

// Bookmarks API
export const bookmarksApi = {
  // Get user's bookmarks
  getUserBookmarks: async () => {
    try {
      const response = await api.get("/bookmarks/user")
      return response.data
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      throw error
    }
  },

  // Check if a book is bookmarked
  isBookmarked: async (bookId) => {
    try {
      const response = await api.get(`/bookmarks/book/${bookId}/user`)
      return response.data.is_bookmarked === "true"
    } catch (error) {
      console.error(`Error checking bookmark status for book ${bookId}:`, error)
      return false
    }
  },

  // Add bookmark
  addBookmark: async (bookId) => {
    try {
      const response = await api.post(`/bookmarks/book/${bookId}/user`)
      return response.data
    } catch (error) {
      console.error(`Error adding bookmark for book ${bookId}:`, error)
      throw error
    }
  },

  // Remove bookmark
  removeBookmark: async (bookId) => {
    try {
      const response = await api.delete(`/bookmarks/book/${bookId}/user`)
      return response.data
    } catch (error) {
      console.error(`Error removing bookmark for book ${bookId}:`, error)
      throw error
    }
  },
}

// Authentication API
export const authApi = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
      }
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      return response.data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error) {
      console.error("Error fetching current user:", error)
      throw error
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token")
  },
}

export default api

