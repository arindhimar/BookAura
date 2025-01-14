import { motion } from 'framer-motion'
import { Search, CreditCard, BookOpen } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Browse',
    description: 'Explore our vast collection of eBooks across various genres and topics.',
  },
  {
    icon: CreditCard,
    title: 'Purchase',
    description: 'Buy your favorite eBooks securely with multiple payment options.',
  },
  {
    icon: BookOpen,
    title: 'Read',
    description: 'Start reading instantly on any device, anytime, anywhere.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            How It{' '}
            <span className="text-blue-500">
              Works
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with EBookHub in just a few simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-6">
                <step.icon className="text-blue-500 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

