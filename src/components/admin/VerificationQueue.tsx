'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface VerificationItem {
  id: string
  userId: string
  university: string | null
  department: string | null
  level: string | null
  matricId: string | null
  verificationDocs: string[]
  createdAt: Date | string
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
}

interface VerificationQueueProps {
  items: VerificationItem[]
}

export default function VerificationQueue({
  items: initialItems,
}: VerificationQueueProps) {
  const [items, setItems] = useState(initialItems)
  const [processing, setProcessing] = useState<string | null>(null)

  const handle = async (
    profileId: string,
    action: 'approve' | 'reject',
    note?: string
  ) => {
    setProcessing(profileId)

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, action, note }),
      })

      if (!res.ok) throw new Error('Failed')

      setItems((prev) => prev.filter((i) => i.id !== profileId))

      toast.success(
        action === 'approve'
          ? 'Student verified!'
          : 'Application rejected'
      )
    } catch {
      toast.error('Something went wrong')
    } finally {
      setProcessing(null)
    }
  }

  if (!items.length) {
    return (
      <div className="card-base p-12 text-center">
        <CheckCircle
          size={40}
          className="mx-auto mb-4 text-emerald-400"
        />

        <p className="font-semibold text-gray-900">
          Queue is empty
        </p>

        <p className="text-sm text-gray-500 mt-1">
          All verification applications have been reviewed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="card-base p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
              {item.user.name?.[0] || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">
                {item.user.name}
              </h3>

              <p className="text-sm text-gray-500">
                {item.user.email} • {item.user.phone}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">
                    University
                  </p>
                  <p className="font-medium text-gray-700">
                    {item.university || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Department
                  </p>
                  <p className="font-medium text-gray-700">
                    {item.department || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Level
                  </p>
                  <p className="font-medium text-gray-700">
                    {item.level || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Matric ID
                  </p>
                  <p className="font-medium text-gray-700">
                    {item.matricId || '—'}
                  </p>
                </div>
              </div>

              {item.verificationDocs.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">
                    Submitted documents
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {item.verificationDocs.map((doc, i) => (
                      <a
                        key={i}
                        href={doc}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-900 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                Applied {formatDate(item.createdAt)}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="danger"
                size="sm"
                loading={processing === item.id}
                onClick={() => handle(item.id, 'reject')}
              >
                <XCircle size={14} /> Reject
              </Button>

              <Button
                variant="primary"
                size="sm"
                loading={processing === item.id}
                onClick={() => handle(item.id, 'approve')}
              >
                <CheckCircle size={14} /> Approve
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}