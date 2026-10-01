'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ServiceSearchBar from '@/components/services/ServiceSearchBar'
import ServiceFilters from '@/components/services/ServiceFilters'
import ServiceResults from '@/components/services/ServiceResults'

interface Category {
  id: string
  name: string
  slug: string
}

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] =
    useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true)

        const response = await fetch('/api/categories')

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()

        setCategories(data.categories || [])
      } catch (error) {
        console.error(
          'Failed to load categories:',
          error
        )
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  function resetFilters() {
    setCategory('')
    setServiceType('')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary-900 py-12">
        <div className="container-app">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-accent">
              SkilVer Marketplace
            </p>

            <h1 className="font-display text-3xl text-white md:text-4xl">
              Browse Services
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/75 md:text-base">
              Find skilled professionals and students offering
              services you can hire for your next project.
            </p>

            <div className="mt-6">
              <ServiceSearchBar
                value={search}
                onChange={setSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-app py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters */}
          <aside className="w-full flex-shrink-0 lg:w-64">
            {categoriesLoading ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />

                <div className="mt-5 h-10 animate-pulse rounded-xl bg-gray-100" />

                <div className="mt-6 h-20 animate-pulse rounded bg-gray-100" />
              </div>
            ) : (
              <ServiceFilters
                categories={categories}
                category={category}
                serviceType={serviceType}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={setCategory}
                onServiceTypeChange={setServiceType}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onReset={resetFilters}
              />
            )}
          </aside>

          {/* Results */}
          <section className="min-w-0 flex-1">
            <ServiceResults
              search={search}
              category={category}
              serviceType={serviceType}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}