'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail, Lock } from 'lucide-react'
import Image from 'next/image'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const res = await signIn('credentials', {
      ...data,
      redirect: false,
    })

    if (res?.error) {
      setLoading(false)
      toast.error('Invalid email or password')
      return
    }

    const session = await getSession()

    if (!session?.user?.role) {
      setLoading(false)
      toast.error('Unable to determine your account type')
      return
    }

    toast.success(`Welcome back! ${session.user.role}`)

    setTimeout(() => {
      switch (session.user.role) {
        case 'ADMIN':
          router.push('/admin')
          break

        case 'CUSTOMER':
          router.push('/customer')
          break

        case 'PROVIDER':
          router.push('/provider')
          break

        default:
          router.push('/')
          break
      }

      router.refresh()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex justify-center items-center gap-1 mb-2">
            <div className="w-10 h-10  rounded-lg flex items-center justify-center">
              <Image alt="SkilVer Logo" src="/logo/logo.png" width={130} height={60} />
            </div>

            <span className="font-display text-lg text-primary-900 font-semibold">
              SkilVer
            </span>
          </Link>

          <h1 className="font-display text-2xl text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in to your account
          </p>
        </div>

        <div className="card-base p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-900 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-primary-900 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}