import { motion } from 'framer-motion'
import GradientButton from './ui/GradientButton'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function Hero() {
  return (
    <section className="pt-32 pb-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <motion.div 
              className="inline-block bg-orange-100 rounded-lg px-4 py-2 mb-6"
              {...fadeInUp}
            >
              <span className="text-[#FF5722] font-semibold">
                #1 Marketing Solution
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              {...fadeInUp}
            >
              We create{' '}
              <span className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-transparent bg-clip-text">
                solutions
              </span>{' '}
              for your business
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 text-lg mb-8 max-w-lg"
              {...fadeInUp}
            >
              Our team keeps a keen eye on emerging trends and technologies to ensure your marketing campaigns remain cutting-edge and deliver exceptional results.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              {...fadeInUp}
            >
              <GradientButton>
                Get Started
              </GradientButton>
              
              <motion.button
                whileHover={{ x: 5 }}
                className="text-gray-700 flex items-center space-x-2 group px-4"
              >
                <span>Explore more</span>
                <svg 
                  className="w-4 h-4 transform transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-[500px] md:h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-3xl opacity-30" />
            <img
              src="/placeholder.svg?height=600&width=600"
              alt="Marketing solutions illustration"
              className="w-full h-full object-contain z-10"
            />
            
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute inset-0 z-20"
            >
              <img
                src="/placeholder.svg?height=600&width=600"
                alt="Floating elements"
                className="w-full h-full object-contain z-10"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

