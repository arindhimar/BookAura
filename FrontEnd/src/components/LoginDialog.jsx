import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Book } from "lucide-react";
import { GradientButton } from "./ui/GradientButton";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function LoginDialog({ isOpen, onClose, openRegister }) {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      const userResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: data.token,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details.");
      }

      const userData = await userResponse.json();
      login(userData.user);
      localStorage.setItem("token", data.token);

      onClose();
      redirectToDashboard(userData.user.role_id);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToDashboard = (roleId) => {
    switch (roleId) {
      case 1:
        navigate("/admin");
        break;
      case 2:
        navigate("/publisher");
        break;
      case 3:
        navigate("/author");
        break;
      default:
        navigate("/");
        break;
    }
  };

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
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-3xl shadow-xl flex"
          >
            {/* Left Side - Illustration */}
            <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-purple-600 to-blue-500 p-8">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <Book className="w-12 h-12 text-white mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Welcome back to BookAura</h2>
                <p className="text-white/90 text-lg">Your journey through infinite stories continues here.</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
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

              <div className="space-y-4 mb-4">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                >
                  <img src="/google.svg" alt="Google" className="w-5 h-5 opacity-50" />
                  Sign in with Google (Coming Soon)
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      name="password"
                      type="password"
                      value={formState.password}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}
                {isLoading && <p className="text-sm text-gray-600 dark:text-gray-400">Logging in...</p>}

                <GradientButton type="submit" className="w-full py-2" disabled={isLoading}>
                  Sign in
                </GradientButton>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openRegister();
                    }}
                    className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
