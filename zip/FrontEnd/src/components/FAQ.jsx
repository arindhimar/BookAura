import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "What formats are the eBooks available in?",
    answer: "Our eBooks are available in multiple formats including PDF, EPUB, and MOBI to ensure compatibility with a wide range of devices and e-readers."
  },
  {
    question: "Can I read the eBooks offline?",
    answer: "Yes, once you've downloaded an eBook, you can read it offline on your device without needing an internet connection."
  },
  {
    question: "Is there a limit to how many eBooks I can purchase?",
    answer: "No, there's no limit to the number of eBooks you can purchase from our platform. Buy as many as you'd like!"
  },
  {
    question: "Do you offer refunds if I'm not satisfied with an eBook?",
    answer: "We offer a 7-day money-back guarantee if you're not satisfied with your purchase. Please contact our customer support for assistance."
  },
  {
    question: "Can I share my eBooks with friends or family?",
    answer: "Our eBooks are for personal use only and cannot be shared. Each purchase is for a single user license."
  }
]

export default function FAQ() {
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
            Frequently Asked{' '}
            <span className="text-blue-500">
              Questions
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our eBook platform
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-blue-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="bg-white dark:bg-gray-700 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="p-4"
            >
              <p className="text-gray-600 dark:text-gray-300">{answer}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

