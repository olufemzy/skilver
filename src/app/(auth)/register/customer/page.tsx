'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { User, Mail, Phone, Lock, MapPin, Building } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Full name required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone number required'),
  password: z.string().min(8, 'Minimum 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  location: z.string().min(2, 'Location required'),
  customerType: z.enum(['INDIVIDUAL', 'BUSINESS']),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDesc: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerType: 'INDIVIDUAL' },
  })
  const customerType = watch('customerType')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountType: 'CUSTOMER' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Registration failed')
      toast.success('Account created! Please log in.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">SB</span>
            </div>
            <span className="font-display text-xl text-primary-900">SkilVer</span>
          </Link>
          <h1 className="font-display text-2xl text-gray-900 mb-1">Create Customer Account</h1>
          <p className="text-gray-500 text-sm">Find and hire verified talent</p>
        </div>

        <div className="card-base p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label-base">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['INDIVIDUAL', 'BUSINESS'] as const).map(type => (
                  <label key={type} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${customerType === type ? 'border-primary-900 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" value={type} {...register('customerType')} className="sr-only" />
                    {type === 'INDIVIDUAL' ? <User size={18} /> : <Building size={18} />}
                    <span className="font-medium text-sm">{type === 'INDIVIDUAL' ? 'Individual' : 'Business'}</span>
                  </label>
                ))}
              </div>
            </div>

            <Input label="Full Name" placeholder="Your full name" leftIcon={<User size={16} />} error={errors.name?.message} {...register('name')} />
            <Input label="Email Address" type="email" placeholder="you@example.com" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
            <Input label="Phone Number" placeholder="0801 234 5678" leftIcon={<Phone size={16} />} error={errors.phone?.message} {...register('phone')} />
            <Input label="Location (City, State)" placeholder="Lagos, Nigeria" leftIcon={<MapPin size={16} />} error={errors.location?.message} {...register('location')} />

            {customerType === 'BUSINESS' && (
              <>
                <Input label="Business Name" placeholder="Acme Ltd." leftIcon={<Building size={16} />} error={errors.businessName?.message} {...register('businessName')} />
                <Input label="Industry" placeholder="e.g. Technology, Retail" error={errors.industry?.message} {...register('industry')} />
                <div>
                  <label className="label-base">Business Description</label>
                  <textarea className="input-base resize-none h-24" placeholder="Brief description of your business..." {...register('businessDesc')} />
                </div>
              </>
            )}

            <Input label="Password" type="password" placeholder="Min. 8 characters" leftIcon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" leftIcon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-900 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}