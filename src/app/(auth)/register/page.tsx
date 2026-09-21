import Link from 'next/link'
import { Users, Briefcase } from 'lucide-react'

const ACCOUNT_TYPES = [
  {
    href: '/register/student',
    icon: Users,
    title: 'Student / Provider',
    description: 'I want to offer my skills and services to earn money.',
    highlight: 'For students, freelancers & skilled professionals',
    accent: 'bg-primary-900 text-white',
  },
  {
    href: '/register/customer',
    icon: Briefcase,
    title: 'Customer',
    description: 'I want to hire skilled people for tasks and projects.',
    highlight: 'For individuals and businesses',
    accent: 'bg-accent text-white',
  },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">SV</span>
            </div>
            <span className="font-display text-xl text-primary-900">SkilVer</span>
          </Link>
          <h1 className="font-display text-3xl text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500">How will you be using SkilVer?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ACCOUNT_TYPES.map(type => (
            <Link
              key={type.href}
              href={type.href}
              className="card-base p-8 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 block group"
            >
              <div className={`w-12 h-12 ${type.accent} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <type.icon size={22} />
              </div>
              <h2 className="font-display text-xl text-gray-900 mb-2">{type.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{type.description}</p>
              <span className="text-xs font-semibold text-primary-900 bg-primary-50 px-3 py-1.5 rounded-full">
                {type.highlight}
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-900 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}