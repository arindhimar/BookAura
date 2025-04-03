import { motion } from 'framer-motion';
import { GradientButton } from './ui/GradientButton';

export default function CTA({ openRegister }) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-center shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join BookAura today and discover a world of knowledge at your fingertips.
          </p>
          <GradientButton onClick={openRegister} className="bg-white hover:bg-gray-100 text-blue-600">
            Get Started Now
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}

