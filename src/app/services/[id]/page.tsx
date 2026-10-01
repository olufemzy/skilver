'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Tag,
} from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  startPrice: number
  maxPrice: number | null
  currency: string
  serviceType: 'REMOTE' | 'PHYSICAL' | 'BOTH'
  deliveryDays: number | null
  category: {
    id: string
    name: string
    slug: string
    description: string | null
  }
  provider: {
    id: string
    user: {
      id: string
      name: string
      email: string
      avatarUrl: string | null
      location: string | null
    }
  }
  images: {
    id: string
    url: string
  }[]
}

export default function ServiceDetailPage() {
   const searchParams = useSearchParams()
   const [requestSubmitted, setRequestSubmitted] = useState(false)

   useEffect(() => {
   if (searchParams.get('requested') === 'true') {
      setRequestSubmitted(true)

      const timer = setTimeout(() => {
         setRequestSubmitted(false)
      }, 6000)

      return () => clearTimeout(timer)
   }
   }, [searchParams])
  const params = useParams()
  const router = useRouter()

  const serviceId = params.id as string

  const [service, setService] =
    useState<Service | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!serviceId) return

    async function loadService() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `/api/services/${serviceId}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load service'
          )
        }

        setService(data.service)
      } catch (err) {
        console.error(
          'Failed to load service:',
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load service'
        )
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [serviceId])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-900" />

            <p className="text-sm text-gray-500">
              Loading service...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="container-app py-20">
          <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
            <h1 className="font-display text-2xl text-gray-900">
              Service not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                'This service may have been removed or is no longer available.'}
            </p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const provider = service.provider.user

  const mainImage =
    service.images.length > 0
      ? service.images[0].url
      : null

  const priceLabel =
    service.currency === 'NGN'
      ? '₦'
      : service.currency

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-app">
          <div className="flex h-16 items-center">
            <Link
              href="/services"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-primary-900"
            >
              <ArrowLeft size={17} />
              Back to Services
            </Link>
          </div>
        </div>
      </div>
      {requestSubmitted && (
         <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle
               size={22}
               className="mt-0.5 flex-shrink-0 text-emerald-600"
            />

            <div>
               <p className="font-semibold text-emerald-800">
               Service request submitted successfully
               </p>

               <p className="mt-1 text-sm text-emerald-700">
               Your request has been sent to the provider. They can
               now review your requirements and respond.
               </p>
            </div>
         </div>
      )}

      <main className="container-app py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div>
            {/* Image */}
            <div className="relative h-72 overflow-hidden rounded-3xl bg-gray-100 md:h-96">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={service.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary-900 text-white">
                  <span className="text-7xl font-bold">
                    {service.title
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-900/10 px-3 py-1.5 text-xs font-semibold text-primary-900">
                <Tag size={13} />
                {service.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 font-display text-3xl leading-tight text-gray-900 md:text-4xl">
              {service.title}
            </h1>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                About this service
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                {service.description}
              </p>
            </div>

            {/* Service information */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Service details
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-card">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag size={16} />

                    <span className="text-xs">
                      Service Type
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {service.serviceType === 'REMOTE'
                      ? 'Remote'
                      : service.serviceType === 'PHYSICAL'
                        ? 'Physical'
                        : 'Remote & Physical'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-card">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />

                    <span className="text-xs">
                      Delivery
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {service.deliveryDays
                      ? `${service.deliveryDays} ${
                          service.deliveryDays === 1
                            ? 'day'
                            : 'days'
                        }`
                      : 'To be discussed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Provider */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Service provider
              </h2>

              <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
                <div className="flex items-start gap-4">
                  {provider.avatarUrl ? (
                    <Image
                      src={provider.avatarUrl}
                      alt={provider.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-900 text-xl font-bold text-white">
                      {provider.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-semibold text-gray-900">
                        {provider.name}
                      </h3>

                      <CheckCircle
                        size={16}
                        className="text-emerald-500"
                      />
                    </div>

                    {provider.location && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin size={13} />
                        {provider.location}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/providers/${service.provider.id}`}
                  className="mt-4 inline-flex text-sm font-semibold text-primary-900 hover:underline"
                >
                  View provider profile
                </Link>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <aside>
            <div className="sticky top-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-card">
              <p className="text-xs text-gray-400">
                Starting from
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {priceLabel}
                {service.startPrice.toLocaleString()}
              </p>

              {service.maxPrice !== null && (
                <p className="mt-1 text-xs text-gray-400">
                  Up to {priceLabel}
                  {service.maxPrice.toLocaleString()}
                </p>
              )}

              <div className="my-6 border-t border-gray-100" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Service type
                  </span>

                  <span className="font-medium text-gray-900">
                    {service.serviceType === 'REMOTE'
                      ? 'Remote'
                      : service.serviceType === 'PHYSICAL'
                        ? 'Physical'
                        : 'Both'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span className="font-medium text-gray-900">
                    {service.deliveryDays
                      ? `${service.deliveryDays} days`
                      : 'Flexible'}
                  </span>
                </div>
              </div>

              <Link
                  href={`/services/${service.id}/request`}
                  className="flex w-full items-center justify-center rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
                  >
                  Request This Service
               </Link>

              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <MessageCircle size={17} />
                Contact Provider
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                You can discuss the requirements and
                final price with the provider before
                starting the service.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}