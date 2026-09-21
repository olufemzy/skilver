'use client'

import Link from 'next/link'
import { Monitor, BookOpen, Briefcase, Wrench, Camera, Scissors } from 'lucide-react'

const CATEGORIES = [
  { name: 'Digital & Tech', icon: Monitor, color: 'bg-blue-50 text-blue-700', count: 240, slug: 'digital-tech' },
  { name: 'Education', icon: BookOpen, color: 'bg-purple-50 text-purple-700', count: 180, slug: 'education' },
  { name: 'Professional', icon: Briefcase, color: 'bg-emerald-50 text-emerald-700', count: 120, slug: 'professional' },
  { name: 'Skilled Trades', icon: Wrench, color: 'bg-orange-50 text-orange-700', count: 95, slug: 'skilled-trades' },
  { name: 'Events & Media', icon: Camera, color: 'bg-pink-50 text-pink-700', count: 75, slug: 'events-media' },
  { name: 'Fashion & Beauty', icon: Scissors, color: 'bg-rose-50 text-rose-700', count: 88, slug: 'fashion-beauty' },
]

export default function Categories() {
  return (
    <section className="section-pad bg-white">
      <div className="container-app">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">All Skills Welcome</p>
          <h2 className="font-display text-3xl md:text-4xl text-gray-900 mb-4">Browse by category</h2>
          <p className="text-gray-500 max-w-xl mx-auto">From coding to carpentry, graphic design to grooming — find skilled people for any task.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="card-base p-5 text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <cat.icon size={22} />
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</p>
              <p className="text-xs text-gray-400">{cat.count} providers</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/browse" className="btn-secondary inline-block">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  )
}