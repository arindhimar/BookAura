import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Hero({ openLogin, openRegister }) {
  return (
    <section className="pt-32 pb-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <motion.div 
              className="inline-block bg-blue-100 dark:bg-blue-900 rounded-lg px-4 py-2 mb-6"
              {...fadeInUp}
            >
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                Discover Your Next Favorite Book
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white"
              {...fadeInUp}
            >
              Unlock a World of{' '}
              <span className="text-blue-500">
                Knowledge
              </span>{' '}
              with BookAura
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-lg"
              {...fadeInUp}
            >
              Dive into a vast library of eBooks across all genres. Read, learn, and grow with our curated collection of digital books.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              {...fadeInUp}
            >
              <button
                onClick={openRegister}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
              >
                Get Started
              </button>
              
              <button
                onClick={openLogin}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-bold py-3 px-8 rounded-full border border-gray-300 dark:border-gray-700 transition-colors duration-300"
              >
                Login
              </button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-[500px] md:h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full blur-3xl opacity-30" />
            <img
              src="/placeholder.svg?height=600&width=600"
              alt="EBook reader illustration"
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
              <BookOpen className="absolute top-1/4 left-1/4 text-blue-500 w-16 h-16 opacity-50" />
              <BookOpen className="absolute bottom-1/4 right-1/4 text-purple-500 w-16 h-16 opacity-50" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

