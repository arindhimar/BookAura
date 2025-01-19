import { motion } from 'framer-motion';
import { Book, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DialogHeader({ title, onClose }) {
  return (
    <div className="flex flex-col items-center mb-6">
      <Link to="/" className="flex items-center space-x-2 mb-4">
        <motion.div
          whileHover={{ rotate: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Book className="h-12 w-12 text-blue-500" />
        </motion.div>
        <span className="text-3xl font-bold text-gray-800 dark:text-white">
          BookAura
        </span>
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
      >
        <X size={24} />
      </button>
    </div>
  );
}

