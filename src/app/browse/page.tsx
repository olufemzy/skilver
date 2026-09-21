import { Suspense } from 'react'
import SearchBar from '@/components/search/SearchBar'
import SearchResults from '@/components/search/SearchResults'
import FilterSidebar from '@/components/search/FilterSidebar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="bg-primary-900 py-10">
        <div className="container-app">
          <h1 className="font-display text-3xl text-white mb-4">Find Verified Talent</h1>
          <SearchBar />
        </div>
      </div>
      <div className="container-app py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <Suspense>
              <FilterSidebar />
            </Suspense>
          </aside>
          <main className="flex-1 min-w-0">
            <Suspense fallback={<div className="text-gray-400 text-sm">Loading providers...</div>}>
              <SearchResults />
            </Suspense>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}