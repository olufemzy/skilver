import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Users, Briefcase, DollarSign, ShieldCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (session?.user?.accountType !== 'ADMIN') redirect('/')

  const [
    totalUsers, totalStudents, totalCustomers,
    pendingVerifications, totalJobs, completedJobs,
    transactions, disputes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { accountType: 'STUDENT' } }),
    prisma.user.count({ where: { accountType: 'CUSTOMER' } }),
    prisma.providerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'COMPLETED' } }),
    prisma.transaction.aggregate({ _sum: { totalAmount: true, platformFee: true } }),
    prisma.dispute.count({ where: { status: 'OPEN' } }),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { id: true, name: true, email: true, accountType: true, createdAt: true, isSuspended: true },
  })

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-50 text-blue-700', href: '/admin/users' },
    { label: 'Pending Verifications', value: pendingVerifications, icon: ShieldCheck, color: 'bg-amber-50 text-amber-700', href: '/admin/verification' },
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: 'bg-purple-50 text-purple-700', href: '/admin/jobs' },
    { label: 'Platform Revenue', value: formatCurrency(transactions._sum.platformFee || 0), icon: DollarSign, color: 'bg-green-50 text-green-700', href: '/admin/transactions' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview and management</p>
      </div>

      {disputes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600" />
          <p className="text-sm text-red-800 font-medium">{disputes} open dispute{disputes !== 1 ? 's' : ''} require attention.</p>
          <Link href="/admin/disputes" className="ml-auto text-sm font-semibold text-red-800 underline">View disputes</Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="card-base p-5 hover:shadow-card-hover transition-shadow">
            <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-display text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Platform stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-base p-5">
          <p className="text-xs text-gray-500 mb-1">Students</p>
          <p className="text-2xl font-display text-gray-900">{totalStudents}</p>
        </div>
        <div className="card-base p-5">
          <p className="text-xs text-gray-500 mb-1">Customers</p>
          <p className="text-2xl font-display text-gray-900">{totalCustomers}</p>
        </div>
        <div className="card-base p-5">
          <p className="text-xs text-gray-500 mb-1">Job Completion Rate</p>
          <p className="text-2xl font-display text-gray-900">
            {totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Recent users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Users</h2>
          <Link href="/admin/users" className="text-sm text-primary-900 font-semibold hover:underline">View all</Link>
        </div>
        <div className="card-base overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{user.accountType}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.isSuspended ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${user.id}`} className="text-xs text-primary-900 font-semibold hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}