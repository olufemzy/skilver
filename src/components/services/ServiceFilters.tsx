'use client'

import { RotateCcw } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface ServiceFiltersProps {
  categories: Category[]
  category: string
  serviceType: string
  minPrice: string
  maxPrice: string
  onCategoryChange: (value: string) => void
  onServiceTypeChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onReset: () => void
}

export default function ServiceFilters({
  categories,
  category,
  serviceType,
  minPrice,
  maxPrice,
  onCategoryChange,
  onServiceTypeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: ServiceFiltersProps) {
  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">
          Filters
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-900 hover:text-primary-700"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label
          htmlFor="service-category"
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          Category
        </label>

        <select
          id="service-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
        >
          <option value="">All categories</option>

          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Service Type */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Service Type
        </p>

        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="serviceType"
              value=""
              checked={serviceType === ''}
              onChange={(e) =>
                onServiceTypeChange(e.target.value)
              }
              className="accent-primary-900"
            />

            <span className="text-sm text-gray-600">
              All types
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="serviceType"
              value="REMOTE"
              checked={serviceType === 'REMOTE'}
              onChange={(e) =>
                onServiceTypeChange(e.target.value)
              }
              className="accent-primary-900"
            />

            <span className="text-sm text-gray-600">
              Remote
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="serviceType"
              value="PHYSICAL"
              checked={serviceType === 'PHYSICAL'}
              onChange={(e) =>
                onServiceTypeChange(e.target.value)
              }
              className="accent-primary-900"
            />

            <span className="text-sm text-gray-600">
              Physical
            </span>
          </label>
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Price Range
        </p>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) =>
              onMinPriceChange(e.target.value)
            }
            placeholder="Min ₦"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
          />

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) =>
              onMaxPriceChange(e.target.value)
            }
            placeholder="Max ₦"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
          />
        </div>
      </div>
    </aside>
  )
}