import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  location: z.string().optional(),
  accountType: z.enum(['STUDENT', 'CUSTOMER']),
  university: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  matricId: z.string().optional(),
  graduationYear: z.number().optional(),
  customerType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDesc: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    schema.parse(body)

    return NextResponse.json(
      {
        error:
          'Registration is temporarily unavailable while the database is being configured.',
      },
      { status: 503 }
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}