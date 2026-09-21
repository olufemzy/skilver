import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  proposal: z.string().min(50),
  price: z.number().min(500),
  deliveryTime: z.number().min(1)
})