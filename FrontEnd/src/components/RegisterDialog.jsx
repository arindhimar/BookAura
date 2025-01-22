import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Book } from "lucide-react"
import { GradientButton } from "./ui/GradientButton"
import TermsAndConditionsDialog from "./TermsAndConditionsDialog"

export default function RegisterDialog({ isOpen, onClose, openLogin, isPublisher = false }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState("")
  const [isTermsOpen, setIsTermsOpen] = useState(false)

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
        body: JSON.stringify({
          ...formData,
          role_id: isPublisher ? 2 : 4,
        }),
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-2xl shadow-xl flex flex-col md:flex-row"
          >
            {/* Left Side - Illustration */}
            <div className="hidden md:block w-full md:w-1/2 relative bg-gradient-to-br from-purple-600 to-blue-500 p-6">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <Book className="w-10 h-10 text-white mb-4" />
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isPublisher ? "Join BookAura as a Publisher" : "Start Your Reading Journey"}
                </h2>
                <p className="text-white/90 text-lg">
                  {isPublisher
                    ? "Share your stories with readers worldwide."
                    : "Discover endless stories at your fingertips."}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full md:w-1/2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isPublisher ? "Publisher Registration" : "Create Account"}
                </h2>
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

              <div className="space-y-3 mb-6">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                >
                  <img src="/google.svg" alt="Google" className="w-5 h-5 opacity-50" />
                  Continue with Google (Coming Soon)
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isPublisher ? "Company Name" : "Full Name"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={isPublisher ? "Enter company name" : "Enter your name"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(true)}
                      className="text-purple-600 hover:text-purple-500"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(true)}
                      className="text-purple-600 hover:text-purple-500"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}

                <GradientButton type="submit" className="w-full py-2">
                  Create Account
                </GradientButton>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      openLogin()
                    }}
                    className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Sign in
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

