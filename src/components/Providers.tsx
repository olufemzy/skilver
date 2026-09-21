'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
// import { NotificationProvider } from '@/context/NotificationContext'
import type { Session } from 'next-auth'
import { useState } from 'react'

export default function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  }))

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {/* <NotificationProvider> */}
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
              success: { iconTheme: { primary: '#0D4A2F', secondary: '#fff' } },
            }}
          />
        {/* </NotificationProvider> */}
      </QueryClientProvider>
    </SessionProvider>
  )
}