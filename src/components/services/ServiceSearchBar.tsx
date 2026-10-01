'use client'

import { Search } from 'lucide-react'

interface ServiceSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function ServiceSearchBar({
  value,
  onChange,
}: ServiceSearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for services..."
        className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary-900 focus:ring-2 focus:ring-primary-900/10"
      />
    </div>
  )
}