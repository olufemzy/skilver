'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, Bell, ChevronDown, Search } from 'lucide-react'
// import { cn } from '@/lib/utils'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // const dashboardHref = session?.user?.accountType === 'ADMIN'
  //   ? '/admin'
  //   : session?.user?.accountType === 'CUSTOMER'
  //   ? '/customer'
  //   : '/provider'

  const dashboardHref =
  session?.user?.role === "ADMIN"
    ? "/admin"
    : session?.user?.role === "CUSTOMER"
      ? "/customer"
      : session?.user?.role === "PROVIDER"
        ? "/provider"
        : "/";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">SV</span>
            </div>
            <span className="font-display text-xl text-primary-900 hidden sm:block">SkilVer</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/browse" className="hover:text-primary-900 transition-colors">Browse Services</Link>
            {/* <Link href="/jobs" className="hover:text-primary-900 transition-colors">Jobs</Link> */}
            <Link href="/browse?verified=true" className="hover:text-primary-900 transition-colors">Verified Talent</Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/browse" className="hidden md:flex items-center gap-1.5 text-gray-500 hover:text-primary-900 transition-colors">
                  <Search size={18} />
                </Link>
                <Link href="/notifications" className="relative text-gray-500 hover:text-primary-900 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center font-semibold">3</span>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {session.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-modal border border-gray-100 py-2 z-50">
                      <Link href={dashboardHref} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                      <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-primary-900 transition-colors">Log In</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
            <button className="md:hidden" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/browse" className="block text-gray-700 font-medium py-2" onClick={() => setMobileOpen(false)}>Browse Services</Link>
          {/* <Link href="/jobs" className="block text-gray-700 font-medium py-2" onClick={() => setMobileOpen(false)}>Browse Jobs</Link> */}
          {!session && (
            <>
              <Link href="/login" className="block text-gray-700 font-medium py-2" onClick={() => setMobileOpen(false)}>Log In</Link>
              <Link href="/register" className="btn-primary block text-center py-3" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}