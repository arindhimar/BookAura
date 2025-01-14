import { motion } from 'framer-motion'

export default function GradientButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium transition-all bg-gradient-to-r from-blue-500 to-blue-600 rounded-full hover:bg-white group whitespace-nowrap ${className}`}
      {...props}
    >
      <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
      <span className="relative text-white">{children}</span>
    </motion.button>
  )
}

