import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { GradientButton } from "./ui/GradientButton"

export default function TermsAndConditionsDialog({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-2xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terms and Conditions</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto mb-6">
              <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing and using BookAura, you agree to be bound by these Terms and Conditions, all applicable
                laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
              </p>
              <h3 className="text-lg font-semibold mb-2">2. Use License</h3>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on
                BookAura's website for personal, non-commercial transitory viewing only.
              </p>
              <h3 className="text-lg font-semibold mb-2">3. Disclaimer</h3>
              <p className="mb-4">
                The materials on BookAura's website are provided on an 'as is' basis. BookAura makes no warranties,
                expressed or implied, and hereby disclaims and negates all other warranties including, without
                limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of rights.
              </p>
              <h3 className="text-lg font-semibold mb-2">4. Limitations</h3>
              <p className="mb-4">
                In no event shall BookAura or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use the materials on BookAura's website, even if BookAura or a BookAura authorized representative has
                been notified orally or in writing of the possibility of such damage.
              </p>
              <h3 className="text-lg font-semibold mb-2">5. Revisions and Errata</h3>
              <p className="mb-4">
                The materials appearing on BookAura's website could include technical, typographical, or photographic
                errors. BookAura does not warrant that any of the materials on its website are accurate, complete or
                current. BookAura may make changes to the materials contained on its website at any time without notice.
              </p>
            </div>
            <GradientButton onClick={onClose} className="w-full">
              I Understand and Accept
            </GradientButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

