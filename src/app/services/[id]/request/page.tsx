'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  Send,
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
}

export default function RequestServicePage() {
  const params = useParams()
  const router = useRouter()

  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [location, setLocation] = useState('')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
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

        if (data.service?.serviceType !== 'BOTH') {
          setServiceType(data.service.serviceType)
        }
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

    if (serviceId) {
      loadService()
    }
  }, [serviceId])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!description.trim()) {
      setError(
        'Please describe what you need from the provider.'
      )
      return
    }

    if (description.trim().length < 10) {
      setError(
        'Please provide a little more detail about what you need.'
      )
      return
    }

    const numericBudget = Number(budget)

    if (
      !budget ||
      !Number.isFinite(numericBudget) ||
      numericBudget <= 0
    ) {
      setError('Please enter a valid budget.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch(
        `/api/services/${serviceId}/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: description.trim(),
            budget: numericBudget,
            serviceType:
              serviceType || undefined,
            location: location.trim() || undefined,
            deadline: deadline || undefined,
            attachments: [],
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to submit service request'
        )
      }

      router.push(
        `/services/${serviceId}?requested=true`
      )
    } catch (err) {
      console.error(
        'Failed to submit service request:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit service request'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2
            size={32}
            className="animate-spin text-primary-900"
          />
        </div>
      </div>
    )
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="container-app py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <Link
              href="/services"
              className="mt-5 inline-flex rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return null
  }

  const currencySymbol =
    service.currency === 'NGN'
      ? '₦'
      : service.currency

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-gray-100 bg-white">
        <div className="container-app py-4">
          <Link
            href={`/services/${service.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-primary-900"
          >
            <ArrowLeft size={17} />
            Back to Service
          </Link>
        </div>
      </div>

      <main className="container-app py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary-900">
              Request Service
            </p>

            <h1 className="mt-1 font-display text-3xl text-gray-900">
              Tell the provider what you need
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Provide the details below so the provider can
              understand your requirements and respond to your
              request.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card md:p-8"
            >
              {error && (
                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  What do you need?
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={7}
                  placeholder="Describe exactly what you want the provider to do. Include important requirements, expected outcome, preferred style, quantity, or any other useful details."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Minimum 10 characters
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Your budget
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                    {currencySymbol}
                  </span>

                  <input
                    id="budget"
                    type="number"
                    min="1"
                    step="0.01"
                    value={budget}
                    onChange={(event) =>
                      setBudget(event.target.value)
                    }
                    placeholder="Enter your budget"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Provider's listed starting price:{' '}
                  {currencySymbol}
                  {service.startPrice.toLocaleString()}
                  {service.maxPrice !== null &&
                    ` – ${currencySymbol}${service.maxPrice.toLocaleString()}`}
                </p>
              </div>

              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Service type
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      value: 'REMOTE',
                      label: 'Remote',
                    },
                    {
                      value: 'PHYSICAL',
                      label: 'Physical',
                    },
                    {
                      value: 'BOTH',
                      label: 'Remote & Physical',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        serviceType === option.value
                          ? 'border-primary-900 bg-primary-900/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value={option.value}
                        checked={
                          serviceType === option.value
                        }
                        onChange={(event) =>
                          setServiceType(
                            event.target.value
                          )
                        }
                        className="sr-only"
                      />

                      <span className="text-sm font-medium text-gray-800">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Location
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="e.g. Ibadan, Oyo State"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="deadline"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Preferred deadline
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="deadline"
                    type="date"
                    min={
                      new Date()
                        .toISOString()
                        .split('T')[0]
                    }
                    value={deadline}
                    onChange={(event) =>
                      setDeadline(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Service Request
                  </>
                )}
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-card lg:sticky lg:top-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                You're requesting
              </p>

              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {service.title}
              </h2>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400">
                  Provider
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {service.provider.user.name}
                </p>

                {service.provider.user.location && (
                  <p className="mt-1 text-xs text-gray-500">
                    {service.provider.user.location}
                  </p>
                )}
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {service.category.name}
                </p>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400">
                  Starting price
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {currencySymbol}
                  {service.startPrice.toLocaleString()}
                </p>
              </div>

              {service.deliveryDays && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="text-xs text-gray-400">
                    Typical delivery
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {service.deliveryDays}{' '}
                    {service.deliveryDays === 1
                      ? 'day'
                      : 'days'}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}