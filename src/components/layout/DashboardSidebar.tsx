'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, Briefcase, MessageSquare, DollarSign, Star, FolderOpen, Bell, Settings, LogOut, PlusCircle, Bookmark, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

const PROVIDER_LINKS = [
  { href: '/provider', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/provider/profile', icon: User, label: 'My Profile' },
  { href: '/provider/portfolio', icon: FolderOpen, label: 'Portfolio' },
  { href: '/provider/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { href: '/provider/applications', icon: FileText, label: 'Applications' },
  { href: '/provider/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/provider/earnings', icon: DollarSign, label: 'Earnings' },
]

const CUSTOMER_LINKS = [
  { href: '/customer', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/customer/post-job', icon: PlusCircle, label: 'Post a Job' },
  { href: '/customer/jobs', icon: Briefcase, label: 'My Jobs' },
  { href: '/customer/saved', icon: Bookmark, label: 'Saved Providers' },
  { href: '/customer/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/customer/payments', icon: DollarSign, label: 'Payments' },
]

export default function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isProvider = session?.user?.accountType === 'STUDENT'
  const links = isProvider ? PROVIDER_LINKS : CUSTOMER_LINKS

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col sticky top-0 h-screen">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-primary-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-display text-xs font-bold">SB</span>
          </div>
          <span className="font-display text-lg text-primary-900">SkilVer</span>
        </Link>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <Avatar src={session?.user?.image} name={session?.user?.name || 'User'} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">{isProvider ? 'Provider' : 'Customer'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-0.5">
        <Link href="/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          Notifications
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          <Settings size={18} />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}