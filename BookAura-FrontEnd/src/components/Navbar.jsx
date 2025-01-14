import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className="h-8 w-8 text-[#FF5722]" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-transparent bg-clip-text">
              BrandBuzz
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'About us', 'Services', 'Contact us', 'Blog'].map((item) => (
              <motion.div
                key={item}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link 
                  to={`/${item.toLowerCase().replace(' ', '-')}`} 
                  className="text-gray-700 hover:text-[#FF5722] font-medium transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:block">
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
              >
                Sign Up
              </motion.button>
            </Link>
          </div>

          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {['Home', 'About us', 'Services', 'Contact us', 'Blog'].map((item) => (
                  <Link 
                    key={item}
                    to={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-700 hover:text-[#FF5722] font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <Link 
                  to="/contact"
                  className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-white px-6 py-2 rounded-full text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

