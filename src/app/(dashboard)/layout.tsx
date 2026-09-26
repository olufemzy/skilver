import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default async function DashboardLayout({children,}: { children: React.ReactNode}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-surface">
      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen">
        <div className="container-app py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}