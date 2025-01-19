import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, User } from 'lucide-react';
import { GradientButton } from './ui/GradientButton';
import DialogHeader from './DialogHeader';
import TermsAndConditionsDialog from './TermsAndConditionsDialog';
import Toast from '../components/Toast';


export default function PublisherRegisterDialog({ isOpen, onClose, openLogin }) {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('error', "Passwords don't match");
      return;
    }
    if (!acceptedTerms) {
      showToast('error', 'Please accept the terms and conditions');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role_id: 2 }),
      });
      const data = await response.json();
      if (response.ok) {
        showToast('success', 'Registration successful!');
        localStorage.setItem('user', JSON.stringify(data));
        onClose();
        window.location.href = '/dashboard';
      } else {
        showToast('error', data.error || 'Registration failed');
      }
    } catch (error) {
      showToast('error', 'An error occurred. Please try again.');
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <DialogHeader title="Publisher Registration" onClose={onClose} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Building2 className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    required
                    className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    terms and conditions
                  </button>
                </label>
              </div>
              <GradientButton type="submit" className="w-full">
                Register as Publisher
              </GradientButton>
              <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                Already registered? {' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openLogin();
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Login here
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
      <TermsAndConditionsDialog isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </AnimatePresence>
  );
}

