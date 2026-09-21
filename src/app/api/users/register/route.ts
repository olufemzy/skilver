import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword, validatePassword } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  location: z.string().optional(),
  accountType: z.enum(['STUDENT', 'CUSTOMER']),
  // Student fields
  university: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  matricId: z.string().optional(),
  graduationYear: z.number().optional(),
  // Customer fields
  customerType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDesc: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const passwordError = validatePassword(data.password)
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const hashed = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashed,
        location: data.location,
        accountType: data.accountType,
        ...(data.accountType === 'STUDENT' ? {
          providerProfile: {
            create: {
              university: data.university,
              faculty: data.faculty,
              department: data.department,
              level: data.level,
              matricId: data.matricId,
              graduationYear: data.graduationYear,
            },
          },
        } : {
          customerProfile: {
            create: {
              customerType: data.customerType || 'INDIVIDUAL',
              businessName: data.businessName,
              industry: data.industry,
              businessDesc: data.businessDesc,
            },
          },
        }),
      },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}