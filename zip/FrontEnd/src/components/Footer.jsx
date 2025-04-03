import { motion, AnimatePresence } from 'framer-motion';
import { Book, Facebook, Instagram, Twitter, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  const footerSections = [
    {
      title: 'Company',
      links: ['About', 'Services', 'Careers', 'Team']
    },
    {
      title: 'Resources',
      links: ['Blog', 'Support', 'Terms of Service', 'Privacy Policy']
    },
    {
      title: 'Contact',
      links: ['Contact Us', 'FAQ', 'Feedback']
    }
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-6"
            >
              <Book className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                BookAura
              </span>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Empowering readers with a world of digital books at their fingertips.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -3 }}
                  className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
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
              <h3 className="font-bold mb-6 text-gray-900 dark:text-white">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <motion.li key={link} whileHover={{ x: 3 }}>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
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
          className="border-t border-gray-200 dark:border-gray-700 pt-8 flex justify-between items-center"
        >
          <p className="text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} BookAura. All rights reserved.
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
}

