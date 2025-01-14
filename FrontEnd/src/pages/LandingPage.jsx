import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import PopularBooks from '../components/PopularBooks'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <main className="bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Hero />
      <Features />
      <PopularBooks />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}

