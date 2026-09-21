import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Briefcase, DollarSign, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { JobStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      jobs: {
        include: {
          category: true,
          _count: { select: { applications: true } },
          contract: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  const stats = [
    { label: 'Jobs Posted', value: profile?.jobsPosted || 0, icon: Briefcase, color: 'bg-blue-50 text-blue-700' },
    // { label: 'Active Jobs', value: profile?.jobs?.filter(j => j.status === 'IN_PROGRESS').length || 0, icon: Users, color: 'bg-amber-50 text-amber-700' },
    // { label: 'Completed Jobs', value: profile?.jobs?.filter(j => j.status === 'COMPLETED').length || 0, icon: CheckCircle, color: 'bg-green-50 text-green-700' },
    { label: 'Total Spent', value: formatCurrency(profile?.totalSpent || 0), icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900 mb-1">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 text-sm">Manage your jobs and hired talent.</p>
        </div>
        <Link href="/customer/post-job">
          <Button>Post a Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card-base p-5">
            <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-display text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
          <Link href="/customer/jobs" className="text-sm text-primary-900 font-semibold hover:underline">View all</Link>
        </div>

        {profile?.jobs?.length ? (
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Job Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Applications</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* {profile.jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/jobs/${job.id}`} className="font-medium text-sm text-gray-900 hover:text-primary-900">{job.title}</Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">{job.category.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">{job._count.applications}</td>
                    <td className="px-5 py-4"><JobStatusBadge status={job.status} /></td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">₦{job.budget.toLocaleString()}</td>
                  </tr>
                ))} */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-base p-12 text-center">
            <Briefcase size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="font-semibold text-gray-900 mb-2">No jobs posted yet</p>
            <p className="text-sm text-gray-500 mb-6">Post your first job and get proposals from verified talent within hours.</p>
            <Link href="/customer/post-job"><Button>Post Your First Job</Button></Link>
          </div>
        )}
      </div>
    </div>
  )
}