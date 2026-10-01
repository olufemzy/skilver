'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle,
  Loader2,
  MapPin,
  Star,
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
  }
  provider: {
    id: string
    user: {
      id: string
      name: string
      avatarUrl: string | null
      location: string | null
    }
  }
  images: {
    id: string
    url: string
  }[]
}

interface ServiceResultsProps {
  search: string
  category: string
  serviceType: string
  minPrice: string
  maxPrice: string
}

export default function ServiceResults({
  search,
  category,
  serviceType,
  minPrice,
  maxPrice,
}: ServiceResultsProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()

      if (search.trim()) {
        params.set('q', search.trim())
      }

      if (category) {
        params.set('category', category)
      }

      if (serviceType) {
        params.set('serviceType', serviceType)
      }

      if (minPrice) {
        params.set('minPrice', minPrice)
      }

      if (maxPrice) {
        params.set('maxPrice', maxPrice)
      }

      params.set('page', '1')
      params.set('limit', '12')

      const response = await fetch(
        `/api/services?${params.toString()}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to fetch services'
        )
      }

      setServices(data.services || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      console.error('Failed to load services:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load services'
      )
    } finally {
      setLoading(false)
    }
  }, [
    search,
    category,
    serviceType,
    minPrice,
    maxPrice,
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices()
    }, 300)

    return () => clearTimeout(timer)
  }, [fetchServices])

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

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchServices}
          className="mt-3 text-sm font-semibold text-primary-900 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!services.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center">
        <p className="font-display text-2xl text-gray-900 mb-2">
          No services found
        </p>

        <p className="text-sm text-gray-500">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">
        {total} service{total !== 1 ? 's' : ''} found
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {services.map((service) => {
          const provider = service.provider.user

          const imageUrl =
            service.images.length > 0
              ? service.images[0].url
              : provider.avatarUrl

          return (
            <div
              key={service.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              {/* Service Image */}
              <div className="relative h-48 bg-gray-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary-900 text-white">
                    <span className="text-4xl font-bold">
                      {service.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  {service.category.name}
                </div>
              </div>

              {/* Service Content */}
              <div className="p-5">
                <h2 className="line-clamp-2 text-base font-semibold text-gray-900">
                  {service.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                  {service.description}
                </p>

                {/* Provider */}
                <div className="mt-4 flex items-center gap-3">
                  {provider.avatarUrl ? (
                    <Image
                      src={provider.avatarUrl}
                      alt={provider.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-900 text-sm font-semibold text-white">
                      {provider.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {provider.name}
                      </p>

                      <CheckCircle
                        size={13}
                        className="flex-shrink-0 text-emerald-500"
                      />
                    </div>

                    {provider.location && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />

                        <span className="truncate">
                          {provider.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {service.serviceType === 'REMOTE'
                      ? 'Remote'
                      : service.serviceType === 'PHYSICAL'
                        ? 'Physical'
                        : 'Remote & Physical'}
                  </span>

                  {service.deliveryDays && (
                    <span>
                      {service.deliveryDays}{' '}
                      {service.deliveryDays === 1
                        ? 'day'
                        : 'days'}
                    </span>
                  )}
                </div>

                {/* Price + View */}
                <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-400">
                      Starting from
                    </p>

                    <p className="text-base font-bold text-gray-900">
                      {service.currency === 'NGN'
                        ? '₦'
                        : service.currency}{' '}
                      {service.startPrice.toLocaleString()}
                    </p>

                    {service.maxPrice !== null && (
                      <p className="text-xs text-gray-400">
                        up to{' '}
                        {service.currency === 'NGN'
                          ? '₦'
                          : service.currency}{' '}
                        {service.maxPrice.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/services/${service.id}`}
                    className="rounded-xl bg-primary-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-800"
                  >
                    View Service
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}