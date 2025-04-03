import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Left from './2.jpeg';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Avid Reader',
    content: 'BookAura has transformed my reading experience. The variety of books and the seamless interface make it a joy to use every day.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Self-published Author',
    content: 'As an author, BookAura has given me a platform to reach readers I never thought possible. The support for indie authors is unparalleled.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Book Club Organizer',
    content: 'Our book club loves using BookAura. The discussion features and reading progress tracking have made our meetings more engaging and insightful.',
    rating: 4,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

function ImageAnimation({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full lg:w-1/4 aspect-square ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full blur-3xl opacity-30" />
      <motion.div
        className="relative z-10 w-full h-full"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <img
          src={Left || "/placeholder.svg"}
          alt="BookAura illustration showing headphones with books and people reading"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          {...fadeInUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover how BookAura is changing the way people read and share stories
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <ImageAnimation className="hidden lg:block" />
          
          <div className="w-full lg:w-1/2 space-y-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>

          <ImageAnimation className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

