'use client'

import Link from 'next/link'
import Image from 'next/image'
import AllProviders from '../../providers.json'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { useState } from 'react'

// const PROVIDERS = [
//   {
//     id: '1',
//     name: 'Amaka Okonkwo',
//     university: 'University of Lagos',
//     department: 'Computer Science',
//     level: '400L',
//     skills: ['UI/UX Design', 'Figma', 'React'],
//     rating: 4.9,
//     reviews: 34,
//     jobs: 28,
//     location: 'Lagos',
//     price: 15000,
//     avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&auto=format',
//   },
//   {
//     id: '2',
//     name: 'Emeka Nwosu',
//     university: 'Obafemi Awolowo University',
//     department: 'Electrical Engineering',
//     level: '300L',
//     skills: ['Electrical Installation', 'Wiring', 'Maintenance'],
//     rating: 4.8,
//     reviews: 19,
//     jobs: 15,
//     location: 'Osun',
//     price: 20000,
//     avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format',
//   },
//   {
//     id: '3',
//     name: 'Fatima Bello',
//     university: 'Ahmadu Bello University',
//     department: 'Mass Communication',
//     level: '200L',
//     skills: ['Photography', 'Video Editing', 'Social Media'],
//     rating: 4.7,
//     reviews: 22,
//     jobs: 18,
//     location: 'Kaduna',
//     price: 25000,
//     avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b9a1?w=200&h=200&fit=crop&auto=format',
//   },
// ]


export default function FeaturedProviders() {

  const [providers, setProviders] = useState(AllProviders)
  const PROVIDERS_TO_DISPLAY = providers.slice(0, 3)


  return (
    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Top Rated</p>
            <h2 className="font-display text-3xl md:text-4xl text-gray-900">Featured providers</h2>
          </div>
          <Link href="/browse?verified=true" className="hidden md:block btn-secondary text-sm py-2 px-4">
            View All
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PROVIDERS_TO_DISPLAY.map(provider => (
            <div key={provider.id} className="card-base p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <Image
                    src={provider.avatar}
                    alt={provider.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{provider.name}</h3>
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{provider.university}</p>
                  <p className="text-xs text-gray-400">{provider.department} — {provider.level}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {provider.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs bg-primary-50 text-primary-900 px-2.5 py-1 rounded-full font-medium">{skill}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="font-semibold text-gray-800">{provider.rating}</span>
                  <span className="text-gray-400">({provider.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin size={12} />
                  <span className="text-xs">{provider.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">{provider.jobs} jobs completed</p>
                  <p className="text-sm font-semibold text-gray-900">
                    From ₦{provider.price.toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/providers/${provider.id}`}
                  className="bg-primary-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-800 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}