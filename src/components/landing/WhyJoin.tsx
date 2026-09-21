import Link from 'next/link'
import { TrendingUp, Star, Globe, BookOpen } from 'lucide-react'

const BENEFITS = [
  { icon: TrendingUp, title: 'Earn While You Study', description: 'Turn your skills into income. Students earn between ₦5,000 and ₦150,000 per month on SkilVer.' },
  { icon: Star, title: 'Build Your Reputation', description: 'Every job builds your profile. Graduate with a verified portfolio and real work experience.' },
  { icon: Globe, title: 'Work From Anywhere', description: 'Take on remote jobs or local ones. You set your availability, rates, and preferences.' },
  { icon: BookOpen, title: 'Professional Passport', description: 'Your completed jobs, ratings, and reviews become a verified professional record employers trust.' },
]

export default function WhyJoin() {
  return (
    <section className="section-pad bg-white">
      <div className="container-app">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">For Students & Providers</p>
          <h2 className="font-display text-3xl md:text-4xl text-gray-900 mb-4">Your skills are worth more</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Join thousands of students monetizing what they know — design, code, teach, fix, create — while building a professional record that lasts beyond graduation.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {BENEFITS.map(benefit => (
            <div key={benefit.title} className="card-base p-6">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <benefit.icon size={20} className="text-accent-dark" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl text-gray-900 mb-2">Platform fee: just 10%</h3>
            <p className="text-gray-600">We only earn when you earn. Complete a ₦50,000 job, keep ₦45,000. Simple.</p>
          </div>
          <Link href="/register/student" className="btn-primary whitespace-nowrap">
            Join as Provider
          </Link>
        </div>
      </div>
    </section>
  )
}