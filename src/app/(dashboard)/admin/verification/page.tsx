import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import VerificationQueue from '@/components/admin/VerificationQueue'

export default async function VerificationPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.accountType !== 'ADMIN') redirect('/')

  const pending = await prisma.providerProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-900 mb-1">Verification Queue</h1>
        <p className="text-gray-500 text-sm">{pending.length} application{pending.length !== 1 ? 's' : ''} pending review</p>
      </div>
      <VerificationQueue items={pending} />
    </div>
  )
}