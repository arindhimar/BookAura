import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "TechCorp Inc.",
    text: "Working with BrandBuzz has been transformative for our business. Their strategic approach and attention to detail are unmatched.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "StartUp Labs",
    text: "The team's creativity and technical expertise helped us achieve our marketing goals faster than expected.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    id: 3,
    name: "Emma Davis",
    company: "Growth Solutions",
    text: "Exceptional service and remarkable results. They truly understand digital marketing.",
    rating: 5,
    image: "/placeholder.svg?height=100&width=100"
  }
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            What{' '}
            <span className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-transparent bg-clip-text">
              Clients
            </span>{' '}
            Say!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See How Our Digital Marketing Agency Helped Create Achieve Their Goals
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white dark:bg-gray-700 p-8 md:p-12 rounded-2xl shadow-lg"
            >
              <Quote className="text-[#FF5722] w-12 h-12 mb-6 opacity-20" />
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={testimonials[currentIndex].image || "/placeholder.svg"}
                    alt={testimonials[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{testimonials[currentIndex].name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{testimonials[currentIndex].company}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 italic">"{testimonials[currentIndex].text}"</p>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-[#FF5722]"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-[#FF5722]"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </section>
  )
}

