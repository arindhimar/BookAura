import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Solutions from '../components/Solutions'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      <Services />
      <Solutions />
      <Testimonials />
      <Footer />
    </main>
  )
}

