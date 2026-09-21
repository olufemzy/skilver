'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Search, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const POPULAR_SEARCHES = ['Graphic Designer', 'Web Developer', 'Tutor', 'Photographer', 'Electrician', 'Tailor']

export default function Hero() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/browse?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="relative bg-primary-900 overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      {/* Accent blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="container-app relative z-10 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <CheckCircle size={14} className="text-accent" />
              Verified Talent. Real Results.
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              Find skilled people.
              <span className="block text-accent italic">Get work done.</span>
            </h1>

            <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              Connect with verified university students and professionals offering graphic design, tutoring, programming, electrical work, photography, and more.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="What service do you need?"
                  className="w-full pl-11 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
              <button type="submit" className="btn-accent px-6 whitespace-nowrap">
                Search
              </button>
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap gap-2">
              <span className="text-white/50 text-sm">Popular:</span>
              {POPULAR_SEARCHES.map(s => (
                <button
                  key={s}
                  onClick={() => router.push(`/browse?q=${encodeURIComponent(s)}`)}
                  className="text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-4 mt-8">
              <Link href="/browse" className="btn-accent flex items-center gap-2">
                Find a Service <ArrowRight size={16} />
              </Link>
              <Link href="/register/student" className="flex items-center gap-2 text-white font-semibold border-2 border-white/30 hover:border-white/60 px-6 py-3 rounded-xl transition-all">
                Become a Provider
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden md:block relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop&auto=format"
                alt="University students collaborating on a project"
                width={600}
                height={500}
                className="w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
            </div>
            {/* Floating cards */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card-hover p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 text-lg">✓</div>
              <div>
                <p className="text-xs text-gray-500">Verified Provider</p>
                <p className="text-sm font-semibold text-gray-900">Amaka O. — UI/UX Design</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card-hover p-4">
              <p className="text-xs text-gray-500 mb-1">Platform Stats</p>
              <p className="text-2xl font-display text-primary-900">1,200+</p>
              <p className="text-xs text-gray-600">verified students</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}