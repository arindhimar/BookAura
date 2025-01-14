import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import GradientButton from './ui/GradientButton'

export default function CTA() {
  return (
    <section className="py-20 bg-blue-500 dark:bg-blue-600">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white dark:text-gray-100">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-blue-100 dark:text-blue-200 max-w-2xl mx-auto mb-8">
            Join thousands of readers who have already discovered the joy of digital reading with EBookHub. Sign up now and get access to our vast library of eBooks!
          </p>
          <GradientButton className="bg-white text-blue-500 hover:bg-blue-50">
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </GradientButton>
        </motion.div>
      </div>
    </section>
  )
}

