import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import HowItWorks from '@/components/landing/HowItWorks'
import Categories from '@/components/landing/Categories'
import FeaturedProviders from '@/components/landing/FeaturedProviders'
import WhyTrust from '@/components/landing/WhyTrust'
import WhyJoin from '@/components/landing/WhyJoin'
import CTA from '@/components/landing/CTA'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Categories />
        <FeaturedProviders />
        <WhyTrust />
        <WhyJoin />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
