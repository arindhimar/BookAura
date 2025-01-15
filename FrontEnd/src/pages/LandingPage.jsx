import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import PopularBooks from '../components/PopularBooks';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import LoginDialog from '../components/LoginDialog';
import RegisterDialog from '../components/RegisterDialog';

export default function LandingPage() {
  const { isDarkMode } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <main className={`bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      <Navbar />
      <Hero openLogin={() => setIsLoginOpen(true)} openRegister={() => setIsRegisterOpen(true)} />
      <Features />
      <PopularBooks />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA openRegister={() => setIsRegisterOpen(true)} />
      <Footer />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterDialog isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </main>
  );
}

