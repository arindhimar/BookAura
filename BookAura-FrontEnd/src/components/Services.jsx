import { motion } from 'framer-motion'
import { Search, BarChart2, Users, Settings } from 'lucide-react'

const services = [
  {
    icon: Search,
    title: 'SEO/SEM',
    description: 'Boost your online visibility and drive targeted traffic to your website with our expert SEO strategies.',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    icon: BarChart2,
    title: 'Marketing',
    description: 'Strategic marketing solutions tailored to your business goals and target audience.',
    color: 'from-green-400 to-green-600'
  },
  {
    icon: Users,
    title: 'Viral Campaign',
    description: 'Create engaging content that spreads across social networks and drives organic growth.',
    color: 'from-purple-400 to-purple-600'
  },
  {
    icon: Settings,
    title: 'Others',
    description: 'Custom solutions designed to meet your unique requirements and business challenges.',
    color: 'from-[#FF5722] to-[#F4511E]'
  }
]

export default function Services() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            We Provide The Best{' '}
            <span className="bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-transparent bg-clip-text">
              Services
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Let us help you achieve your business goals with our data-driven strategies
            and innovative solutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#FF5722] transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
              <motion.button
                whileHover={{ x: 5 }}
                className="mt-4 text-[#FF5722] flex items-center space-x-2 group/button"
              >
                <span>Learn more</span>
                <svg 
                  className="w-4 h-4 transform transition-transform group-hover/button:translate-x-1" 
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
          ))}
        </div>
      </div>
    </section>
  )
}

