import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import {
  Briefcase,
  DollarSign,
  Star,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { VerificationBadge } from '@/components/ui/Badge'

export default async function ProviderDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // Temporary demo data until PostgreSQL is connected
  const verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' = 'PENDING'
  const totalEarnings = 0
  const jobsCompleted = 0
  const averageRating = 0
  const activeContracts: any[] = []
  const recentJobs: any[] = []

  const stats = [
    {
      label: 'Total Earned',
      value: formatCurrency(totalEarnings),
      icon: DollarSign,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Jobs Completed',
      value: jobsCompleted,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Average Rating',
      value: `${averageRating.toFixed(1)}/5`,
      icon: Star,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Active Jobs',
      value: activeContracts.length,
      icon: Clock,
      color: 'bg-purple-50 text-purple-700',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">
          Dashboard 
        </h1>

        <p className="text-gray-500 text-sm">
          Welcome back — here's what's happening.
        </p>
      </div>

      {/* Verification alert */}
      {verificationStatus === 'PENDING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle
            size={20}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />

          <div>
            <p className="font-semibold text-amber-800 text-sm">
              Account not yet verified
            </p>

            <p className="text-amber-700 text-sm mt-0.5">
              Submit your student ID to get the Verified Student badge
              and unlock more opportunities.
            </p>

            <Link
              href="/provider/profile#verification"
              className="text-sm font-semibold text-amber-800 underline mt-2 inline-block"
            >
              Submit verification →
            </Link>
          </div>

          <VerificationBadge status={verificationStatus} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-base p-5">
            <div
              className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon size={18} />
            </div>

            <p className="text-2xl font-display text-gray-900">
              {stat.value}
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active jobs */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">
            Active Contracts
          </h2>

          {activeContracts.length > 0 ? (
            <div className="space-y-3">
              {activeContracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="card-base p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow block"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {contract.job.title}
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {contract.customer.user.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card-base p-8 text-center text-gray-400">
              <Briefcase
                size={32}
                className="mx-auto mb-3 opacity-30"
              />

              <p className="text-sm">
                No active contracts yet
              </p>

              <Link
                href="/provider/jobs"
                className="text-primary-900 text-sm font-semibold mt-2 inline-block"
              >
                Browse jobs →
              </Link>
            </div>
          )}
        </div>

        {/* Recommended jobs */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">
            Recommended Jobs
          </h2>

          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="card-base p-4 hover:shadow-card-hover transition-shadow block"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {job.title}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {job.category} • {job.applications} applicants
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-primary-900 whitespace-nowrap ml-2">
                      ₦{Number(job.budget).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card-base p-8 text-center text-gray-400">
              <Briefcase
                size={32}
                className="mx-auto mb-3 opacity-30"
              />

              <p className="text-sm">
                No recommended jobs yet
              </p>

              <Link
                href="/provider/jobs"
                className="text-primary-900 text-sm font-semibold mt-2 inline-block"
              >
                Browse available jobs →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}