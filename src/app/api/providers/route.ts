import { NextRequest, NextResponse } from 'next/server'
import providers from '../../../providers.json'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams

  const query = (params.get('q') || '').toLowerCase()
  const category = (params.get('category') || '').toLowerCase()
  const verified = params.get('verified') === 'true'
  const available = params.get('available') === 'true'
  const minRating = Number(params.get('minRating')) || 0
  const page = Number(params.get('page')) || 1
  const pageSize = 18

  let filteredProviders = providers.filter((provider: any) => {
    const matchesQuery =
      !query ||
      provider.name?.toLowerCase().includes(query) ||
      provider.location?.toLowerCase().includes(query) ||
      provider.university?.toLowerCase().includes(query) ||
      provider.department?.toLowerCase().includes(query) ||
      provider.title?.toLowerCase().includes(query) ||
      provider.skills?.some((skill: string) =>
        skill.toLowerCase().includes(query)
      )

    const matchesCategory =
      !category ||
      provider.category?.toLowerCase() === category

    const matchesVerified =
      !verified || provider.verified === true

    const matchesAvailable =
      !available || provider.available === true

    const matchesRating =
      !minRating || Number(provider.rating) >= minRating

    return (
      matchesQuery &&
      matchesCategory &&
      matchesVerified &&
      matchesAvailable &&
      matchesRating
    )
  })

  const total = filteredProviders.length

  const start = (page - 1) * pageSize
  const end = start + pageSize

  filteredProviders = filteredProviders.slice(start, end)

  const data = filteredProviders.map((provider: any) => ({
    id: provider.id,
    userId: provider.id,
    name: provider.name,
    avatarUrl: provider.avatar || null,
    location: provider.location || null,
    university: provider.university || null,
    department: provider.department || null,
    level: provider.level || null,
    verificationStatus: provider.verified ? 'VERIFIED' : 'PENDING',
    averageRating: Number(provider.rating) || 0,
    totalReviews: Number(provider.reviews) || 0,
    jobsCompleted: Number(provider.jobs) || 0,
    isAvailable: provider.available === true,
    skills: provider.skills || [],
    startingPrice: provider.price ? Number(provider.price) : null,
  }))

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  })
}