import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Briefcase, DollarSign, Star, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { JobStatusBadge, VerificationBadge } from '@/components/ui/Badge'

export default async function ProviderDashboard() {
  const session = await getServerSession(authOptions)

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      contracts: {
        where: { status: { in: ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED'] } },
        include: { job: true, customer: { include: { user: true } } },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  const recentJobs = await prisma.job.findMany({
    where: { status: 'OPEN' },
    include: { category: true, _count: { select: { applications: true } } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  const stats = [
    { label: 'Total Earned', value: formatCurrency(profile?.totalEarnings || 0), icon: DollarSign, color: 'bg-green-50 text-green-700' },
    { label: 'Jobs Completed', value: profile?.jobsCompleted || 0, icon: Briefcase, color: 'bg-blue-50 text-blue-700' },
    { label: 'Average Rating', value: `${(profile?.averageRating || 0).toFixed(1)}/5`, icon: Star, color: 'bg-amber-50 text-amber-700' },
    { label: 'Active Jobs', value: profile?.contracts?.length || 0, icon: Clock, color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back — here's what's happening.</p>
      </div>

      {/* Verification alert */}
      {profile?.verificationStatus !== 'VERIFIED' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Account not yet verified</p>
            <p className="text-amber-700 text-sm mt-0.5">Submit your student ID to get the Verified Student badge and unlock more opportunities.</p>
            <Link href="/provider/profile#verification" className="text-sm font-semibold text-amber-800 underline mt-2 inline-block">Submit verification →</Link>
          </div>
          <VerificationBadge status={profile?.verificationStatus || 'PENDING'} />
        </div>
      )}

      {/* Stats */}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active jobs */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Active Contracts</h2>
          {profile?.contracts?.length ? (
            <div className="space-y-3">
              {/* {profile.contracts.map(contract => (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="card-base p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow block">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{contract.job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{contract.customer.user.name}</p>
                  </div>
                  <JobStatusBadge status={contract.status} />
                </Link>
              ))} */}
            </div>
          ) : (
            <div className="card-base p-8 text-center text-gray-400">
              <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active contracts yet</p>
              <Link href="/provider/jobs" className="text-primary-900 text-sm font-semibold mt-2 inline-block">Browse jobs →</Link>
            </div>
          )}
        </div>

        {/* Recommended jobs */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Recommended Jobs</h2>
          <div className="space-y-3">
            {/* {recentJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="card-base p-4 hover:shadow-card-hover transition-shadow block">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.category.name} • {job._count.applications} applicants</p>
                  </div>
                  <p className="text-sm font-semibold text-primary-900 whitespace-nowrap ml-2">₦{job.budget.toLocaleString()}</p>
                </div>
              </Link>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  )
}