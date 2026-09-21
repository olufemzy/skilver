import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const query = params.get('q') || ''
  const category = params.get('category') || ''
  const verified = params.get('verified') === 'true'
  const available = params.get('available') === 'true'
  const minRating = Number(params.get('minRating')) || 0
  const serviceType = params.get('serviceType') || ''
  const page = Number(params.get('page')) || 1
  const pageSize = 18

  const where: any = {
    user: {
      isSuspended: false,
      isActive: true,
      ...(query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      } : {}),
    },
    ...(verified ? { verificationStatus: 'VERIFIED' } : {}),
    ...(available ? { isAvailable: true } : {}),
    ...(minRating > 0 ? { averageRating: { gte: minRating } } : {}),
    ...(query ? {
      OR: [
        { university: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
        { skills: { some: { skill: { name: { contains: query, mode: 'insensitive' } } } } },
        { services: { some: { title: { contains: query, mode: 'insensitive' } } } },
      ],
    } : {}),
  }

  const [total, profiles] = await Promise.all([
    prisma.providerProfile.count({ where }),
    prisma.providerProfile.findMany({
      where,
      include: {
        user: true,
        skills: { include: { skill: true }, take: 5 },
        services: { orderBy: { startPrice: 'asc' }, take: 1 },
      },
      orderBy: [{ verificationStatus: 'asc' }, { averageRating: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const data = profiles.map(p => ({
    id: p.id,
    userId: p.userId,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl,
    location: p.user.location,
    university: p.university,
    department: p.department,
    level: p.level,
    verificationStatus: p.verificationStatus,
    averageRating: p.averageRating,
    totalReviews: p.totalReviews,
    jobsCompleted: p.jobsCompleted,
    isAvailable: p.isAvailable,
    skills: p.skills.map(s => s.skill.name),
    startingPrice: p.services[0]?.startPrice ?? null,
  }))

  return NextResponse.json({ data, total, page, pageSize, hasMore: page * pageSize < total })
}