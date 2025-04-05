/**
 * Error handling utility for BookAura application
 */

// Format error message from API response
export const formatErrorMessage = (error) => {
    if (!error) {
        return "An unknown error occurred"
    }

    // Handle axios error objects
    if (error.response) {
        // Server responded with error status
        const { data, status } = error.response

        // Handle specific status codes
        if (status === 401) {
            return "Authentication required. Please log in again."
        }

        if (status === 403) {
            return "You do not have permission to perform this action."
        }

        if (status === 404) {
            return "The requested resource was not found."
        }

        if (status === 500) {
            return "Server error. Please try again later."
        }

        // Try to extract error message from response
        if (data) {
            if (typeof data === "string") {
                return data
            }

            if (data.error) {
                return data.error
            }

            if (data.message) {
                return data.message
            }

            if (data.details) {
                return data.details
            }
        }

        return `Error ${status}: ${data || "Unknown error"}`
    }

    // Network error
    if (error.request) {
        return "Network error. Please check your internet connection."
    }

    // Other errors
    return error.message || "An unexpected error occurred"
}

// Log error to console with additional context
export const logError = (error, context = "") => {
    console.error(`[${context}] Error:`, error)

    if (error.response) {
        console.error(`Status: ${error.response.status}`)
        console.error("Response data:", error.response.data)
    }
}

// Handle API errors with toast notifications
export const handleApiError = (error, toast, customMessage = null) => {
    const errorMessage = customMessage || formatErrorMessage(error)

    toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
    })

    logError(error, "API Error")
}

export default {
    formatErrorMessage,
    logError,
    handleApiError,
}

