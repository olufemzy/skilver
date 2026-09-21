import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Star,
  Briefcase,
  MessageCircle,
} from 'lucide-react'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

import AllProviders from '../../../providers.json'

export default async function ProviderProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const provider = AllProviders.find(
    (provider) => provider.id === params.id
  )

  if (!provider) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-surface">

      <Navbar />

      <div className="container-app py-10">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* =========================
              SIDEBAR
          ========================= */}

          <div className="space-y-5">

            <div className="card-base p-6 text-center">

              {/* Profile Image */}

              {provider.avatar ? (
                <Image
                  src={provider.avatar}
                  alt={provider.name}
                  width={120}
                  height={120}
                  className="w-28 h-28 rounded-3xl mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-28 h-28 bg-primary-900 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {provider.name[0]}
                </div>
              )}

              {/* Name */}

              <h1 className="font-display text-2xl text-gray-900 mb-1">
                {provider.name}
              </h1>

              {/* Title */}

              <p className="text-sm text-gray-500 mb-3">
                {provider.title}
              </p>

              {/* Verification */}

              {provider.verified && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium mb-4">
                  <span>✓</span>
                  Verified Provider
                </div>
              )}

              {/* Location */}

              {provider.location && (
                <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-4">
                  <MapPin size={14} />
                  {provider.location}
                </div>
              )}

              {/* University */}

              <div className="text-sm text-gray-600 mb-4">

                <p className="font-medium">
                  {provider.university}
                </p>

                <p className="text-gray-400">
                  {provider.department}
                  {provider.level
                    ? ` — ${provider.level}`
                    : ''}
                </p>

              </div>


              {/* Statistics */}

              <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">

                <div className="text-center">

                  <p className="font-display text-xl text-gray-900">
                    {Number(provider.jobs)}
                  </p>

                  <p className="text-xs text-gray-400">
                    Jobs
                  </p>

                </div>


                <div className="text-center border-x border-gray-100">

                  <p className="font-display text-xl text-gray-900">
                    {Number(provider.rating).toFixed(1)}
                  </p>

                  <p className="text-xs text-gray-400">
                    Rating
                  </p>

                </div>


                <div className="text-center">

                  <p className="font-display text-xl text-gray-900">
                    {Number(provider.reviews)}
                  </p>

                  <p className="text-xs text-gray-400">
                    Reviews
                  </p>

                </div>

              </div>


              {/* Availability */}

              <div
                className={`w-full py-2 px-4 rounded-xl text-sm font-medium ${
                  provider.available
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {provider.available
                  ? '● Available for work'
                  : '○ Not available'}
              </div>


              {/* Actions */}

              <div className="mt-4 space-y-2">

                <Link
                  href={`/messages?with=${provider.id}`}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  <MessageCircle size={15} />
                  Message
                </Link>

                <Link
                  href={`/hire/${provider.id}`}
                  className="btn-primary w-full block text-center text-sm py-2.5"
                >
                  Hire {provider.name.split(' ')[0]}
                </Link>

              </div>

            </div>


            {/* =========================
                SKILLS
            ========================= */}

            <div className="card-base p-5">

              <h2 className="font-semibold text-gray-900 text-sm mb-3">
                Skills
              </h2>

              <div className="flex flex-wrap gap-2">

                {provider.skills.map((skill) => (

                  <span
                    key={skill}
                    className="text-xs bg-primary-50 text-primary-900 px-3 py-1.5 rounded-full font-medium"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            </div>

          </div>


          {/* =========================
              MAIN CONTENT
          ========================= */}

          <div className="lg:col-span-2 space-y-6">


            {/* About */}

            <div className="card-base p-6">

              <h2 className="font-semibold text-gray-900 mb-3">
                About
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed">
                {provider.name} is a {provider.title.toLowerCase()}
                {' '}offering professional services in{' '}
                {provider.category.toLowerCase()}.
                {' '}With experience completing{' '}
                {Number(provider.jobs)} jobs, this provider is
                available to work with customers in{' '}
                {provider.location}.
              </p>

            </div>


            {/* Service Information */}

            <div className="card-base p-6">

              <h2 className="font-semibold text-gray-900 mb-4">
                Service Information
              </h2>

              <div className="space-y-3">

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">

                  <div>

                    <p className="font-medium text-sm text-gray-900">
                      {provider.title}
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {provider.category}
                      {' • '}
                      {provider.remote
                        ? 'Remote service'
                        : 'Physical service'}
                    </p>

                  </div>

                  <p className="text-sm font-semibold text-primary-900">
                    From ₦
                    {Number(provider.price).toLocaleString()}
                  </p>

                </div>

              </div>

            </div>


            {/* Skills / Expertise */}

            <div className="card-base p-6">

              <h2 className="font-semibold text-gray-900 mb-4">
                Expertise
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">

                {provider.skills.map((skill) => (

                  <div
                    key={skill}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >

                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-900 flex items-center justify-center">
                      <Briefcase size={15} />
                    </div>

                    <span className="text-sm text-gray-700">
                      {skill}
                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* Reviews */}

            <div className="card-base p-6">

              <div className="flex items-center gap-3 mb-5">

                <h2 className="font-semibold text-gray-900">
                  Reviews
                </h2>

                <div className="flex items-center gap-1.5">

                  <Star
                    size={14}
                    fill="#F59E0B"
                    className="text-amber-400"
                  />

                  <span className="font-semibold text-sm">
                    {Number(provider.rating).toFixed(1)}
                  </span>

                  <span className="text-gray-400 text-sm">
                    ({Number(provider.reviews)} reviews)
                  </span>

                </div>

              </div>


              {/* Temporary review message */}

              <div className="text-center py-8">

                <Star
                  size={28}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="text-sm text-gray-500">
                  Reviews will appear here when customer reviews
                  are connected to the database.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      <Footer />

    </div>
  )
}



// import { notFound } from 'next/navigation'
// import Image from 'next/image'
// import Link from 'next/link'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import prisma from '@/lib/prisma'
// import { CheckCircle, MapPin, Star, Briefcase, Clock } from 'lucide-react'
// import Navbar from '@/components/layout/Navbar'
// import Footer from '@/components/layout/Footer'
// import { VerificationBadge } from '@/components/ui/Badge'
// import Button from '@/components/ui/Button'
// import { formatCurrency, formatDate } from '@/lib/utils'

// export default async function ProviderProfilePage({ params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions)

//   const user = await prisma.user.findUnique({
//     where: { id: params.id },
//     include: {
//       providerProfile: {
//         include: {
//           skills: { include: { skill: { include: { category: true } } } },
//           services: { include: { category: true } },
//           portfolioItems: { orderBy: { createdAt: 'desc' }, take: 6 },
//           reviewsReceived: {
//             include: { customer: { include: { user: true } } },
//             orderBy: { createdAt: 'desc' },
//             take: 5,
//           },
//         },
//       },
//     },
//   })

//   if (!user?.providerProfile) notFound()
//   const profile = user.providerProfile

//   return (
//     <div className="min-h-screen bg-surface">
//       <Navbar />
//       <div className="container-app py-10">
//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Sidebar */}
//           <div className="space-y-5">
//             <div className="card-base p-6 text-center">
//               {user.avatarUrl ? (
//                 <Image src={user.avatarUrl} alt={user.name} width={96} height={96} className="w-24 h-24 rounded-3xl mx-auto mb-4 object-cover" />
//               ) : (
//                 <div className="w-24 h-24 bg-primary-900 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
//                   {user.name[0]}
//                 </div>
//               )}
//               <h1 className="font-display text-2xl text-gray-900 mb-1">{user.name}</h1>
//               <div className="flex justify-center mb-3">
//                 <VerificationBadge status={profile.verificationStatus} />
//               </div>
//               {user.location && (
//                 <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-4">
//                   <MapPin size={14} />
//                   {user.location}
//                 </div>
//               )}
//               {profile.university && (
//                 <div className="text-sm text-gray-600 mb-4">
//                   <p className="font-medium">{profile.university}</p>
//                   {profile.department && <p className="text-gray-400">{profile.department}{profile.level ? ` — ${profile.level}` : ''}</p>}
//                 </div>
//               )}
//               <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
//                 <div className="text-center">
//                   <p className="font-display text-xl text-gray-900">{profile.jobsCompleted}</p>
//                   <p className="text-xs text-gray-400">Jobs</p>
//                 </div>
//                 <div className="text-center border-x border-gray-100">
//                   <p className="font-display text-xl text-gray-900">{profile.averageRating.toFixed(1)}</p>
//                   <p className="text-xs text-gray-400">Rating</p>
//                 </div>
//                 <div className="text-center">
//                   <p className="font-display text-xl text-gray-900">{Math.round(profile.responseRate)}%</p>
//                   <p className="text-xs text-gray-400">Response</p>
//                 </div>
//               </div>

//               <div className={`w-full py-2 px-4 rounded-xl text-sm font-medium ${profile.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
//                 {profile.isAvailable ? '● Available for work' : '○ Not available'}
//               </div>

//               {session && session.user.id !== user.id && (
//                 <div className="mt-4 space-y-2">
//                   <Link href={`/messages?with=${user.id}`} className="btn-secondary w-full block text-center text-sm py-2.5">Message</Link>
//                   <Link href={`/hire/${user.id}`} className="btn-primary w-full block text-center text-sm py-2.5">Hire {user.name.split(' ')[0]}</Link>
//                 </div>
//               )}
//             </div>

//             {/* Skills */}
//             <div className="card-base p-5">
//               <h2 className="font-semibold text-gray-900 text-sm mb-3">Skills</h2>
//               <div className="flex flex-wrap gap-2">
//                 {profile.skills.map(ps => (
//                   <span key={ps.id} className="text-xs bg-primary-50 text-primary-900 px-3 py-1.5 rounded-full font-medium">{ps.skill.name}</span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Main content */}
//           <div className="lg:col-span-2 space-y-6">
//             {profile.bio && (
//               <div className="card-base p-6">
//                 <h2 className="font-semibold text-gray-900 mb-3">About</h2>
//                 <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
//               </div>
//             )}

//             {/* Services */}
//             {profile.services.length > 0 && (
//               <div className="card-base p-6">
//                 <h2 className="font-semibold text-gray-900 mb-4">Services</h2>
//                 <div className="space-y-3">
//                   {profile.services.map(service => (
//                     <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
//                       <div>
//                         <p className="font-medium text-sm text-gray-900">{service.title}</p>
//                         <p className="text-xs text-gray-500 mt-0.5">{service.category.name} • {service.serviceType.toLowerCase()}</p>
//                       </div>
//                       <p className="text-sm font-semibold text-primary-900">{formatCurrency(service.startPrice)}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Portfolio */}
//             {profile.portfolioItems.length > 0 && (
//               <div className="card-base p-6">
//                 <h2 className="font-semibold text-gray-900 mb-4">Portfolio</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                   {profile.portfolioItems.map(item => (
//                     <div key={item.id} className="rounded-xl overflow-hidden bg-gray-100 aspect-square relative group">
//                       {item.mediaUrls[0] ? (
//                         <Image src={item.mediaUrls[0]} alt={item.title} fill className="object-cover" />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-gray-400">
//                           <Briefcase size={24} />
//                         </div>
//                       )}
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                         <p className="text-white text-xs font-semibold text-center px-3">{item.title}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Reviews */}
//             {profile.reviewsReceived.length > 0 && (
//               <div className="card-base p-6">
//                 <div className="flex items-center gap-3 mb-5">
//                   <h2 className="font-semibold text-gray-900">Reviews</h2>
//                   <div className="flex items-center gap-1.5">
//                     <Star size={14} fill="#F59E0B" className="text-amber-400" />
//                     <span className="font-semibold text-sm">{profile.averageRating.toFixed(1)}</span>
//                     <span className="text-gray-400 text-sm">({profile.totalReviews} reviews)</span>
//                   </div>
//                 </div>
//                 <div className="space-y-5">
//                   {profile.reviewsReceived.map(review => (
//                     <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0">
//                       <div className="flex items-center gap-3 mb-2">
//                         <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
//                           {review.customer?.user.name[0]}
//                         </div>
//                         <div>
//                           <p className="text-sm font-semibold text-gray-900">{review.customer?.user.name}</p>
//                           <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
//                         </div>
//                         <div className="ml-auto flex items-center gap-0.5">
//                           {Array.from({ length: 5 }).map((_, i) => (
//                             <Star key={i} size={12} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
//                           ))}
//                         </div>
//                       </div>
//                       {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   )
// }