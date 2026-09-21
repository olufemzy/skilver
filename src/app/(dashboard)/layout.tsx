import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-surface flex">
      <DashboardSidebar />
      <main className="flex-1 min-w-0">
        <div className="container-app py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}