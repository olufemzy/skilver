import { cn } from '@/lib/utils'
import type { VerificationStatus, JobStatus, ApplicationStatus } from '@/types'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'verified'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

export default function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full',
      variants[variant],
      size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1',
    )}>
      {variant === 'verified' && <span className="mr-1">✓</span>}
      {label}
    </span>
  )
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { label: string; variant: BadgeProps['variant'] }> = {
    VERIFIED: { label: 'Verified Student', variant: 'verified' },
    PENDING: { label: 'Pending Verification', variant: 'warning' },
    REJECTED: { label: 'Not Verified', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; variant: BadgeProps['variant'] }> = {
    DRAFT: { label: 'Draft', variant: 'default' },
    OPEN: { label: 'Open', variant: 'success' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    SUBMITTED: { label: 'Submitted', variant: 'warning' },
    REVISION_REQUESTED: { label: 'Revision', variant: 'warning' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
    DISPUTED: { label: 'Disputed', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge label={label} variant={variant} />
}