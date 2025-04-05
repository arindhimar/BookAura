// API service for handling all backend requests

// Base API URL - can be configured based on environment
const API_BASE_URL = "http://127.0.0.1:5000/"

// Error handler helper
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error: ${response.status}`)
    } catch (e) {
      throw new Error(`Error: ${response.status}`)
    }
  }
  return response.json()
}

// Books API
export const booksApi = {
  // Get all books with optional filters
  getBooks: async (filters = {}) => {
    const queryParams = new URLSearchParams()

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value)
      }
    })

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    const response = await fetch(`${API_BASE_URL}/books${query}`)
    return handleResponse(response)
  },

  // Get a single book by ID
  getBookById: async (bookId) => {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`)
    return handleResponse(response)
  },

  // Get book reviews
  getBookReviews: async (bookId) => {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/reviews`)
    return handleResponse(response)
  },

  // Add a review to a book
  addBookReview: async (bookId, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    })
    return handleResponse(response)
  },
}

// Categories/Genres API
export const categoriesApi = {
  // Get all categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`)
    return handleResponse(response)
  },
}

// User Library API
export const libraryApi = {
  // Get user's library
  getUserLibrary: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/library`)
    return handleResponse(response)
  },

  // Add book to user's library
  addToLibrary: async (userId, bookId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookId }),
    })
    return handleResponse(response)
  },

  // Remove book from user's library
  removeFromLibrary: async (userId, bookId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/library/${bookId}`, {
      method: "DELETE",
    })
    return handleResponse(response)
  },

  // Update reading progress
  updateReadingProgress: async (userId, bookId, progress) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/library/${bookId}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ progress }),
    })
    return handleResponse(response)
  },

  // Toggle favorite status
  toggleFavorite: async (userId, bookId, isFavorite) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/library/${bookId}/favorite`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isFavorite }),
    })
    return handleResponse(response)
  },
}

// User API
export const userApi = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    return handleResponse(response)
  },

  // Update user profile
  updateUserProfile: async (userId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })
    return handleResponse(response)
  },
}

// Authentication API
export const authApi = {
  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
    return handleResponse(response)
  },

  // Register
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    return handleResponse(response)
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    })
    return handleResponse(response)
  },
}

// Export all APIs
export default {
  books: booksApi,
  categories: categoriesApi,
  library: libraryApi,
  user: userApi,
  auth: authApi,
}

