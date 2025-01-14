import { motion } from 'framer-motion'
import GradientButton from './ui/GradientButton'

const steps = [
  {
    number: 1,
    title: 'Contact us',
    description: 'Get in touch to boost your brand visibility'
  },
  {
    number: 2,
    title: 'Consult',
    description: 'We will understand your business goals'
  },
  {
    number: 3,
    title: 'Place order',
    description: 'Choose your strategy to proceed'
  },
  {
    number: 4,
    title: 'Payment',
    description: 'Flexible payment in all types of banking'
  }
]

export default function Solutions() {
  return (
    <section className="py-20 bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-transparent rounded-full blur-3xl opacity-30" />
            <div className="relative h-[500px]">
              <img
                src="/placeholder.svg?height=500&width=500"
                alt="Simple solutions illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block bg-orange-100 text-[#FF5722] rounded-lg px-4 py-2 mb-4 font-semibold"
            >
              Our Process
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Simple{' '}
              <span className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-transparent bg-clip-text">
                Solutions!
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-600 mb-8"
            >
              We understand that no two businesses are alike. That's why we take the
              time to understand yours and provide tailored solutions.
            </motion.p>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 group"
                >
                  <div className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-[#FF5722] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 space-x-4"
            >
              <GradientButton>
                Get Started
              </GradientButton>
              <button className="text-[#FF5722] hover:text-[#F4511E] transition-colors underline-offset-4 hover:underline">
                Read more
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

