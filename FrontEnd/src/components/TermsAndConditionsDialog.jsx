import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton } from './ui/GradientButton';
import DialogHeader from './DialogHeader';

export default function TermsAndConditionsDialog({ isOpen, onClose }) {
  const [terms, setTerms] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTerms();
    }
  }, [isOpen]);

  const fetchTerms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/terms`);
      const data = await response.text();
      setTerms(data);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      setTerms('Failed to load terms and conditions. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            <DialogHeader title="Terms and Conditions" onClose={onClose} />
            <div className="flex-grow overflow-y-auto mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {terms}
              </pre>
            </div>
            <GradientButton onClick={onClose} className="w-full">
              Close
            </GradientButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

