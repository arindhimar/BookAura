import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Mail, Lock, User, Book } from "lucide-react"
import { GradientButton } from "./ui/GradientButton"
import DialogHeader from "./DialogHeader"
import TermsAndConditionsDialog from "./TermsAndConditionsDialog"

export default function PublisherRegisterDialog({ isOpen, onClose, openLogin }) {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions")
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role_id: 2 }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data))
        onClose()
        window.location.href = "/dashboard"
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-3xl shadow-xl flex flex-col md:flex-row"
          >
            {/* Left Side - Illustration */}
            <div className="hidden md:block w-full md:w-1/2 relative bg-gradient-to-br from-purple-600 to-blue-500 p-6">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <Book className="w-12 h-12 text-white mb-4" />
                <h2 className="text-3xl font-bold text-white mb-6">Join BookAura as a Publisher</h2>
                <p className="text-white/90 text-lg">Share your stories with readers worldwide.</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full md:w-1/2 p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <img src="/bookaura-logo.png" alt="BookAura Logo" className="h-8 w-auto mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Publisher Registration</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Building2 className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(true)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      terms and conditions
                    </button>
                  </label>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <GradientButton type="submit" className="w-full">
                  Register as Publisher
                </GradientButton>
                <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      openLogin()
                    }}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Login here
                  </button>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
      <TermsAndConditionsDialog isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </AnimatePresence>
  )
}

