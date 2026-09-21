'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5, 'Job title required (min 5 characters)'),
  categoryId: z.string().min(1, 'Category required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().min(500, 'Minimum budget is ₦500'),
  serviceType: z.enum(['REMOTE', 'PHYSICAL', 'BOTH']),
  location: z.string().optional(),
  deadline: z.string().optional(),
  providersNeeded: z.number().min(1).max(10),
})
type FormData = z.infer<typeof schema>

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceType: 'BOTH', providersNeeded: 1, budget: 5000 },
  })

  const budget = watch('budget')
  const fee = Math.round((budget || 0) * 0.1)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  const improveWithAI = async () => {
    const title = watch('title')
    const description = watch('description')
    if (!title || description.length < 20) {
      toast.error('Enter a title and description first')
      return
    }
    setAiLoading(true)
    const res = await fetch('/api/ai/improve-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    const data = await res.json()
    if (data.improved) setValue('description', data.improved)
    setAiLoading(false)
    toast.success('Description improved!')
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Job posted successfully!')
      router.push(`/jobs/${json.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">Post a Job</h1>
        <p className="text-gray-500 text-sm">Describe what you need — verified providers will apply.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card-base p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Job Details</h2>
          <Input label="Job Title" placeholder="e.g. Logo Design for My Restaurant" error={errors.title?.message} {...register('title')} />
          <div>
            <label className="label-base">Category</label>
            <select className="input-base" {...register('categoryId')}>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-base mb-0">Description</label>
              <button type="button" onClick={improveWithAI} disabled={aiLoading} className="flex items-center gap-1.5 text-xs font-semibold text-primary-900 hover:underline">
                <Sparkles size={12} />
                {aiLoading ? 'Improving...' : 'Improve with AI'}
              </button>
            </div>
            <textarea
              className="input-base resize-none h-36"
              placeholder="Describe the job in detail — what you need, any specific requirements, style preferences, etc."
              {...register('description')}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>
        </div>

        <div className="card-base p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Budget & Logistics</h2>
          <div>
            <label className="label-base">Budget (₦)</label>
            <input type="number" className="input-base" placeholder="5000" {...register('budget', { valueAsNumber: true })} />
            {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget.message}</p>}
            {budget > 0 && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl text-sm">
                <p className="text-gray-600">Platform fee (10%): <span className="font-semibold">₦{fee.toLocaleString()}</span></p>
                <p className="text-gray-600">Provider receives: <span className="font-semibold text-green-700">₦{(budget - fee).toLocaleString()}</span></p>
              </div>
            )}
          </div>
          <div>
            <label className="label-base">Service Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['REMOTE', 'PHYSICAL', 'BOTH'] as const).map(type => (
                <label key={type} className={`text-center p-3 border-2 rounded-xl cursor-pointer transition-colors text-sm font-medium ${watch('serviceType') === type ? 'border-primary-900 bg-primary-50 text-primary-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" value={type} {...register('serviceType')} className="sr-only" />
                  {type === 'REMOTE' ? 'Remote' : type === 'PHYSICAL' ? 'Physical' : 'Either'}
                </label>
              ))}
            </div>
          </div>
          {watch('serviceType') !== 'REMOTE' && (
            <Input label="Location" placeholder="e.g. Victoria Island, Lagos" leftIcon={<MapPin size={16} />} {...register('location')} />
          )}
          <Input label="Deadline (optional)" type="date" leftIcon={<Calendar size={16} />} {...register('deadline')} />
          <div>
            <label className="label-base">Number of Providers Needed</label>
            <input type="number" min={1} max={10} className="input-base" {...register('providersNeeded', { valueAsNumber: true })} />
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Post Job
        </Button>
      </form>
    </div>
  )
}