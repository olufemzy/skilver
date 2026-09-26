'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  User,
  Briefcase,
  MessageSquare,
  DollarSign,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
  PlusCircle,
  Bookmark,
  FileText,
  Users,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Tags,
  Menu,
  X,
} from 'lucide-react'
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

const ADMIN_LINKS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/verification', icon: ShieldCheck, label: 'Verification' },
  { href: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
  { href: '/admin/categories', icon: Tags, label: 'Categories' },
  { href: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
  { href: '/admin/portfolio', icon: FolderOpen, label: 'Portfolio' },
  { href: '/admin/profile', icon: User, label: 'My Profile' },
]

export default function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const [mobileOpen, setMobileOpen] = useState(false)

  const role = session?.user?.role

  const links =
    role === 'ADMIN'
      ? ADMIN_LINKS
      : role === 'PROVIDER'
        ? PROVIDER_LINKS
        : CUSTOMER_LINKS

  const roleLabel =
    role === 'ADMIN'
      ? 'Administrator'
      : role === 'PROVIDER'
        ? 'Provider'
        : 'Customer'

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-display text-xs font-bold">
              SV
            </span>
          </div>

          <span className="font-display text-lg text-primary-900">
            SkilVer
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 w-64 bg-white border-r border-gray-100',
          'h-screen flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-display text-xs font-bold">
                  SV
                </span>
              </div>

              <span className="font-display text-lg text-primary-900">
                SkilVer
              </span>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobileMenu}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Information */}
          <div className="flex items-center gap-3 p-3 mt-4 bg-gray-50 rounded-xl">
            <Avatar
              src={session?.user?.image}
              name={session?.user?.name || 'User'}
              size="sm"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.name || 'User'}
              </p>

              <p className="text-xs text-gray-400">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/admin' &&
                link.href !== '/provider' &&
                link.href !== '/customer' &&
                pathname.startsWith(`${link.href}/`))

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Links */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <Link
            href="/notifications"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            Notifications
          </Link>

          <Link
            href="/settings"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Content Spacer */}
      <div className="lg:hidden h-16" />
    </>
  )
}