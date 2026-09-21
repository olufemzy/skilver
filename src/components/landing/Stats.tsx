const STATS = [
  { label: 'Verified Providers', value: '1,200+' },
  { label: 'Jobs Completed', value: '3,400+' },
  { label: 'Service Categories', value: '50+' },
  { label: 'Universities Represented', value: '80+' },
]

export default function Stats() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container-app py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl text-primary-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}