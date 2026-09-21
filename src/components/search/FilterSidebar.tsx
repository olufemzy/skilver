'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Digital & Tech', value: 'digital-tech' },
  { label: 'Education', value: 'education' },
  { label: 'Professional', value: 'professional' },
  { label: 'Skilled Trades', value: 'skilled-trades' },
  { label: 'Events & Media', value: 'events-media' },
  { label: 'Fashion & Beauty', value: 'fashion-beauty' },
]

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Filters</h3>

        <div className="space-y-5">
          <div>
            <label className="label-base text-xs">Category</label>
            {CATEGORIES.map(cat => (
              <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer py-1.5">
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={searchParams.get('category') === cat.value || (!searchParams.get('category') && !cat.value)}
                  onChange={() => updateFilter('category', cat.value)}
                  className="text-primary-900"
                />
                <span className="text-sm text-gray-700">{cat.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="label-base text-xs">Verification</label>
            <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={searchParams.get('verified') === 'true'}
                onChange={e => updateFilter('verified', e.target.checked ? 'true' : '')}
                className="text-primary-900"
              />
              <span className="text-sm text-gray-700">Verified only</span>
            </label>
          </div>

          <div>
            <label className="label-base text-xs">Minimum Rating</label>
            {[4, 3, 2].map(r => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer py-1.5">
                <input
                  type="radio"
                  name="rating"
                  value={r}
                  checked={searchParams.get('minRating') === String(r)}
                  onChange={() => updateFilter('minRating', String(r))}
                  className="text-primary-900"
                />
                <span className="text-sm text-gray-700">{'⭐'.repeat(r)} & above</span>
              </label>
            ))}
          </div>

          <div>
            <label className="label-base text-xs">Service Type</label>
            {[{ label: 'Any', value: '' }, { label: 'Remote', value: 'REMOTE' }, { label: 'Physical', value: 'PHYSICAL' }].map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1.5">
                <input
                  type="radio"
                  name="serviceType"
                  value={opt.value}
                  checked={(searchParams.get('serviceType') || '') === opt.value}
                  onChange={() => updateFilter('serviceType', opt.value)}
                  className="text-primary-900"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="label-base text-xs">Availability</label>
            <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={searchParams.get('available') === 'true'}
                onChange={e => updateFilter('available', e.target.checked ? 'true' : '')}
                className="text-primary-900"
              />
              <span className="text-sm text-gray-700">Available now</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}