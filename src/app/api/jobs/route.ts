import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { moderateJobPost } from '@/lib/ai'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(5),
  categoryId: z.string(),
  description: z.string().min(50),
  budget: z.number().min(500),
  serviceType: z.enum(['REMOTE', 'PHYSICAL', 'BOTH']),
  location: z.string().optional(),
  deadline: z.string().optional(),
  providersNeeded: z.number().min(1).max(10),
  skillIds: z.string().array().optional(),
})

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const status = params.get('status') || 'OPEN'
  const categoryId = params.get('categoryId') || ''
  const page = Number(params.get('page')) || 1
  const pageSize = 20

  const where: any = {
    status,
    ...(categoryId ? { categoryId } : {}),
  }

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      include: {
        category: true,
        customer: { include: { user: { select: { name: true, avatarUrl: true } } } },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ data: jobs, total, page, pageSize, hasMore: page * pageSize < total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const customer = await prisma.customerProfile.findUnique({ where: { userId: session.user.id } })
    if (!customer) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    // AI moderation
    const moderation = await moderateJobPost(data.title, data.description).catch(() => ({ flagged: false }))

    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        budget: data.budget,
        serviceType: data.serviceType,
        location: data.location,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        providersNeeded: data.providersNeeded,
        isAiReviewed: true,
        // aiFlagReason: moderation.flagged ? moderation.reason : null,
        status: moderation.flagged ? 'DRAFT' : 'OPEN',
        ...(data.skillIds?.length ? {
          skills: { create: data.skillIds.map(id => ({ skillId: id })) },
        } : {}),
      },
    })

    await prisma.customerProfile.update({
      where: { id: customer.id },
      data: { jobsPosted: { increment: 1 } },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}