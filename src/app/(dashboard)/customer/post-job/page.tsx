
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { MapPin, Calendar, Sparkles, User, Users, Check } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5, 'Job title required (min 5 characters)'),
  categoryId: z.string().min(1, 'Category required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().min(500, 'Minimum budget is ₦500'),
  serviceType: z.enum(['REMOTE', 'PHYSICAL', 'BOTH']),
  location: z.string().optional(),
  deadline: z.string().optional(),
  providersNeeded: z.number().int().min(1).max(10),
})

type FormData = z.infer<typeof schema>

export default function PostJobPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([])
  const [aiLoading, setAiLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceType: 'BOTH',
      providersNeeded: 1,
      budget: 5000,
    },
  })

  const budget = watch('budget')
  const providersNeeded = watch('providersNeeded')
  const serviceType = watch('serviceType')
  const isMultipleProviders = providersNeeded > 1

  const fee = Math.round((budget || 0) * 0.1)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')

        if (!response.ok) {
          throw new Error('Failed to load categories')
        }

        const data = await response.json()
        setCategories(data.categories || [])
      } catch {
        toast.error('Failed to load categories')
      }
    }

    loadCategories()
  }, [])

  const improveWithAI = async () => {
    const title = watch('title')
    const description = watch('description') || ''

    if (!title || description.length < 20) {
      toast.error('Enter a title and description first')
      return
    }

    setAiLoading(true)

    try {
      const response = await fetch('/api/ai/improve-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve description')
      }

      if (!data.improved) {
        throw new Error('No improved description was returned')
      }

      setValue('description', data.improved, {
        shouldValidate: true,
      })

      toast.success('Description improved!')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to improve description'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Failed to post job')
      }

      toast.success('Job posted successfully!')
      router.push(`/jobs/${json.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to post job'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="mb-1 font-display text-2xl text-gray-900">
          Post a Job
        </h1>

        <p className="text-sm text-gray-500">
          Describe what you need — verified providers will apply.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Job Details */}
        <div className="card-base space-y-5 p-6">
          <h2 className="font-semibold text-gray-900">
            Job Details
          </h2>

          <Input
            label="Job Title"
            placeholder="e.g. Logo Design for My Restaurant"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="label-base">Category</label>

            <select
              className="input-base"
              {...register('categoryId')}
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label-base mb-0">
                Description
              </label>

              <button
                type="button"
                onClick={improveWithAI}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-900 hover:underline disabled:opacity-50"
              >
                <Sparkles size={12} />
                {aiLoading ? 'Improving...' : 'Improve with AI'}
              </button>
            </div>

            <textarea
              className="input-base h-36 resize-none"
              placeholder="Describe the job in detail — what you need, any specific requirements, style preferences, etc."
              {...register('description')}
            />

            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Budget and Logistics */}
        <div className="card-base space-y-5 p-6">
          <h2 className="font-semibold text-gray-900">
            Budget & Logistics
          </h2>

          <div>
            <label className="label-base">Budget (₦)</label>

            <input
              type="number"
              min={500}
              className="input-base"
              placeholder="5000"
              {...register('budget', { valueAsNumber: true })}
            />

            {errors.budget && (
              <p className="mt-1 text-xs text-red-600">
                {errors.budget.message}
              </p>
            )}

            {budget > 0 && (
              <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm">
                <p className="text-gray-600">
                  Platform fee (10%):{' '}
                  <span className="font-semibold">
                    ₦{fee.toLocaleString()}
                  </span>
                </p>

                <p className="text-gray-600">
                  Provider receives:{' '}
                  <span className="font-semibold text-green-700">
                    ₦{(budget - fee).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className="label-base">Service Type</label>

            <div className="grid grid-cols-3 gap-3">
              {(['REMOTE', 'PHYSICAL', 'BOTH'] as const).map(
                (type) => (
                  <label
                    key={type}
                    className={`cursor-pointer rounded-xl border-2 p-3 text-center text-sm font-medium transition-colors ${
                      serviceType === type
                        ? 'border-primary-900 bg-primary-50 text-primary-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register('serviceType')}
                      className="sr-only"
                    />

                    {type === 'REMOTE'
                      ? 'Remote'
                      : type === 'PHYSICAL'
                        ? 'Physical'
                        : 'Either'}
                  </label>
                )
              )}
            </div>

            {errors.serviceType && (
              <p className="mt-1 text-xs text-red-600">
                {errors.serviceType.message}
              </p>
            )}
          </div>

          {serviceType !== 'REMOTE' && (
            <Input
              label="Location"
              placeholder="e.g. Victoria Island, Lagos"
              leftIcon={<MapPin size={16} />}
              {...register('location')}
            />
          )}

          <Input
            label="Deadline (optional)"
            type="date"
            leftIcon={<Calendar size={16} />}
            {...register('deadline')}
          />

          {/* Provider Selection */}
          <div className="border-t border-gray-100 pt-5">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900">
                How many providers do you need?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Choose one provider for an individual job, or multiple
                providers when you need a team.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Single Provider */}
              <button
                type="button"
                onClick={() =>
                  setValue('providersNeeded', 1, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                aria-pressed={!isMultipleProviders}
                className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                  !isMultipleProviders
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {!isMultipleProviders && (
                  <span className="absolute right-3 top-3 text-primary-900">
                    <Check size={18} />
                  </span>
                )}

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary-900">
                  <User size={22} />
                </div>

                <p className="font-semibold text-gray-900">
                  One provider
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Hire one person to handle the job.
                </p>
              </button>

              {/* Multiple Providers */}
              <button
                type="button"
                onClick={() => {
                  if (!isMultipleProviders) {
                    setValue('providersNeeded', 2, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                }}
                aria-pressed={isMultipleProviders}
                className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                  isMultipleProviders
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isMultipleProviders && (
                  <span className="absolute right-3 top-3 text-primary-900">
                    <Check size={18} />
                  </span>
                )}

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary-900">
                  <Users size={22} />
                </div>

                <p className="font-semibold text-gray-900">
                  Multiple providers
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Hire a team of people for the job.
                </p>
              </button>
            </div>

            {isMultipleProviders && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <label
                  htmlFor="providersNeeded"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Number of providers required
                </label>

                <select
                  id="providersNeeded"
                  className="input-base"
                  {...register('providersNeeded', {
                    valueAsNumber: true,
                  })}
                >
                  {Array.from({ length: 9 }, (_, index) => index + 2).map(
                    (number) => (
                      <option key={number} value={number}>
                        {number} providers
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  You can request between 2 and 10 providers.
                  The job will remain open for hiring until all
                  required positions are filled.
                </p>
              </div>
            )}

            {errors.providersNeeded && (
              <p className="mt-2 text-xs text-red-600">
                {errors.providersNeeded.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Post Job
        </Button>
      </form>
    </div>
  )
}
