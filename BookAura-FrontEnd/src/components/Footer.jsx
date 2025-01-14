import { motion } from 'framer-motion'
import { Heart, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  const footerSections = [
    {
      title: 'Company',
      links: ['About', 'Services', 'Careers', 'Team']
    },
    {
      title: 'Designs',
      links: ['Design systems', 'UI/UX Design', 'Free resources', 'Designer inspiration']
    },
    {
      title: 'Resources',
      links: ['Become a designer', 'Blog', 'Support without borders', 'Affiliates']
    }
  ]

  return (
    <footer className="bg-orange-50 pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-6"
            >
              <Heart className="h-8 w-8 text-[#FF5722]" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-transparent bg-clip-text">
                BrandBuzz
              </span>
            </motion.div>
            <p className="text-gray-600 mb-6">
              Empowering businesses with innovative digital marketing solutions.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -3 }}
                  className="bg-white p-2 rounded-full text-gray-600 hover:text-[#FF5722] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-bold mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <motion.li key={link} whileHover={{ x: 3 }}>
                    <a href="#" className="text-gray-600 hover:text-[#FF5722] transition-colors">
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-8"
        >
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} BrandBuzz. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

