'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, CheckCircle, Loader2,} from 'lucide-react'

import type { ProviderSearchResult, ServiceSearchFilters,} from '@/types'

import AllProviders from '../../providers.json'

export default function SearchResults() {
  const searchParams = useSearchParams()

  const [providers, setProviders] = useState<ProviderSearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const filters = {
      q: searchParams.get('q') || undefined,

      category:
        searchParams.get('category') || undefined,

      location:
        searchParams.get('location') || undefined,

      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,

      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,

      minRating: searchParams.get('minRating')
        ? Number(searchParams.get('minRating'))
        : undefined,

      verified:
        searchParams.get('verified') === 'true',

      available:
        searchParams.get('available') === 'true',

      serviceType:
        searchParams.get('serviceType') || undefined,
    }

    const filteredProviders = AllProviders.filter(provider => {
      // Search
      const matchesSearch =
        !filters.q ||
        provider.name
          .toLowerCase()
          .includes(filters.q.toLowerCase()) ||
        provider.title
          .toLowerCase()
          .includes(filters.q.toLowerCase()) ||
        provider.category
          .toLowerCase()
          .includes(filters.q.toLowerCase()) ||
        provider.skills.some(skill =>
          skill
            .toLowerCase()
            .includes(filters.q!.toLowerCase())
        )

      // Category
      const categoryMap: Record<string, string[]> = {
      'digital-tech': [
        'web & app dev',
        'design',
      ],

      education: [
        'tutoring',
      ],

      professional: [
        'professional',
      ],

      'skilled-trades': [
        'electrical services',
      ],

      'events-media': [
        'photography',
      ],

      'fashion-beauty': [
        'fashion',
        'beauty',
      ],
    }

    const matchesCategory =
      !filters.category ||
      categoryMap[filters.category]?.includes(
        provider.category.toLowerCase()
      ) === true

      // Location
      const matchesLocation =
        !filters.location ||
        provider.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())

      // Price
      const price = Number(provider.price)

      const matchesMinPrice =
        filters.minPrice === undefined ||
        price >= filters.minPrice

      const matchesMaxPrice =
        filters.maxPrice === undefined ||
        price <= filters.maxPrice

      // Rating
      const rating = Number(provider.rating)

      const matchesMinRating =
        filters.minRating === undefined ||
        rating >= filters.minRating

      // Verified
     const matchesVerified =
      !filters.verified ||
      provider.verified === true

      // Available
     const matchesAvailable =
      !filters.available ||
      provider.available === true

      // Remote / Physical
      const matchesLocationType =
        !filters.serviceType ||
        filters.serviceType === 'REMOTE' && provider.remote === true ||
        filters.serviceType === 'PHYSICAL' && provider.remote === false

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesMinRating &&
        matchesVerified &&
        matchesAvailable &&
        matchesLocationType
      )
    })

    // Convert providers.json to ProviderSearchResult
    const formattedProviders: ProviderSearchResult[] =
      filteredProviders.map(provider => ({
        id: provider.id,

        fullName: provider.name,

        profilePhotoUrl: provider.avatar || null,

        // Temporary value.
        // We will replace this after checking your Prisma enum.
        providerType: 'STUDENT',

        verificationStatus: provider.verified
          ? 'VERIFIED'
          : 'UNVERIFIED',

        university: provider.university || null,

        department: provider.department || null,

        location: provider.location || null,

        headlineSkills: provider.skills,

        ratingAvg: Number(provider.rating),

        ratingCount: Number(provider.reviews),

        jobsCompletedCount: Number(provider.jobs),

        startingPrice: Number(provider.price),

        isAvailable: provider.available,
      }))

    setProviders(formattedProviders)
    setTotal(formattedProviders.length)

    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={32}
          className="animate-spin text-primary-900"
        />
      </div>
    )
  }

  if (!providers.length) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-2xl text-gray-900 mb-2">
          No providers found
        </p>

        <p className="text-gray-500 text-sm">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">
        {total} provider{total !== 1 ? 's' : ''} found
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {providers.map(provider => (
          <div
            key={provider.id}
            className="card-base p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Provider Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="relative flex-shrink-0">

                {provider.profilePhotoUrl ? (
                  <Image
                    src={provider.profilePhotoUrl}
                    alt={provider.fullName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-900 rounded-2xl flex items-center justify-center text-white font-bold">
                    {provider.fullName[0]}
                  </div>
                )}

                {provider.isAvailable && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {provider.fullName}
                  </p>

                  {provider.verificationStatus === 'VERIFIED' && (
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 flex-shrink-0"
                    />
                  )}
                </div>

                {provider.university && (
                  <p className="text-xs text-gray-500 truncate">
                    {provider.university}
                  </p>
                )}

                {provider.department && (
                  <p className="text-xs text-gray-400">
                    {provider.department}
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {provider.headlineSkills
                .slice(0, 3)
                .map(skill => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
            </div>

            {/* Rating & Location */}
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-1 text-amber-500">

                <Star
                  size={13}
                  fill="currentColor"
                />

                <span className="font-semibold text-gray-800 text-xs">
                  {provider.ratingAvg.toFixed(1)}
                </span>

                <span className="text-gray-400 text-xs">
                  ({provider.ratingCount})
                </span>

              </div>

              {provider.location && (
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin size={11} />

                  <span className="text-xs">
                    {provider.location}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">

              <div>
                <p className="text-xs text-gray-400">
                  {provider.jobsCompletedCount} jobs done
                </p>

                {provider.startingPrice !== null && (
                  <p className="text-sm font-semibold text-gray-900">
                    From ₦
                    {provider.startingPrice.toLocaleString()}
                  </p>
                )}
              </div>

              <Link
                href={`/providers/${provider.id}`}
                className="text-xs font-semibold text-white bg-primary-900 hover:bg-primary-800 px-4 py-2 rounded-xl transition-colors"
              >
                View Profile
              </Link>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



// 'use client'

// import { useEffect, useState } from 'react'
// import { useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import Image from 'next/image'
// import { MapPin, Star, CheckCircle, Loader2 } from 'lucide-react'
// // import type { ProviderCard } from '@/types'
// import type { ProviderSearchResult, ServiceSearchFilters} from '@/types'
// import AllProviders from '../../providers.json'



// export default function SearchResults() {
//   const searchParams = useSearchParams()
//   // const [providers, setProviders] = useState<ProviderCard[]>([])
//   const [providers, setProviders] = useState(AllProviders )
//   const [total, setTotal] = useState(0)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     setLoading(true)
//     fetch(`/api/providers?${searchParams.toString()}`)
//       .then(r => r.json())
//       .then(data => { setProviders(data.data || []); setTotal(data.total || 0) })
//       .finally(() => setLoading(false))
//   }, [searchParams.toString()])

//   if (loading) return (
//     <div className="flex items-center justify-center py-20">
//       <Loader2 size={32} className="animate-spin text-primary-900" />
//     </div>
//   )

//   if (!providers.length) return (
//     <div className="text-center py-20">
//       <p className="font-display text-2xl text-gray-900 mb-2">No providers found</p>
//       <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
//     </div>
//   )

//   return (
//     <div>
//       <p className="text-sm text-gray-500 mb-5">{total} provider{total !== 1 ? 's' : ''} found</p>
//       <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
//         {providers.map(provider => (
//           <div key={provider.id} className="card-base p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
//             <div className="flex items-start gap-3 mb-4">
//               <div className="relative flex-shrink-0">
//                 {provider.avatarUrl ? (
//                   <Image src={provider.avatarUrl} alt={provider.name} width={48} height={48} className="w-12 h-12 rounded-2xl object-cover" />
//                 ) : (
//                   <div className="w-12 h-12 bg-primary-900 rounded-2xl flex items-center justify-center text-white font-bold">
//                     {provider.name[0]}
//                   </div>
//                 )}
//                 {provider.isAvailable && (
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
//                 )}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-1.5 mb-0.5">
//                   <p className="font-semibold text-gray-900 text-sm truncate">{provider.name}</p>
//                   {provider.verificationStatus === 'VERIFIED' && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
//                 </div>
//                 {provider.university && <p className="text-xs text-gray-500 truncate">{provider.university}</p>}
//                 {provider.department && <p className="text-xs text-gray-400">{provider.department}{provider.level ? ` — ${provider.level}` : ''}</p>}
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-1.5 mb-4">
//               {provider.skills.slice(0, 3).map(skill => (
//                 <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">{skill}</span>
//               ))}
//             </div>

//             <div className="flex items-center justify-between text-sm mb-4">
//               <div className="flex items-center gap-1 text-amber-500">
//                 <Star size={13} fill="currentColor" />
//                 <span className="font-semibold text-gray-800 text-xs">{provider.averageRating.toFixed(1)}</span>
//                 <span className="text-gray-400 text-xs">({provider.totalReviews})</span>
//               </div>
//               {provider.location && (
//                 <div className="flex items-center gap-1 text-gray-400">
//                   <MapPin size={11} />
//                   <span className="text-xs">{provider.location}</span>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//               <div>
//                 <p className="text-xs text-gray-400">{provider.jobsCompleted} jobs done</p>
//                 {provider.startingPrice && (
//                   <p className="text-sm font-semibold text-gray-900">From ₦{provider.startingPrice.toLocaleString()}</p>
//                 )}
//               </div>
//               <Link href={`/providers/${provider.userId}`} className="text-xs font-semibold text-white bg-primary-900 hover:bg-primary-800 px-4 py-2 rounded-xl transition-colors">
//                 View Profile
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }