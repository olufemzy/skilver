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
import { User, Mail, Phone, Lock, MapPin, GraduationCap } from 'lucide-react'

const NIGERIAN_UNIVERSITIES = [
  'University of Lagos', 'Obafemi Awolowo University', 'University of Ibadan',
  'Ahmadu Bello University', 'University of Nigeria Nsukka', 'University of Benin',
  'Lagos State University', 'Covenant University', 'Babcock University',
  'Federal University of Technology Akure', 'Nnamdi Azikiwe University',
  'University of Port Harcourt', 'Bayero University Kano', 'Other',
]

const LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate']

const schema = z.object({
  name: z.string().min(2, 'Full name required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Minimum 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  location: z.string().min(2, 'Location required'),
  university: z.string().min(2, 'University required'),
  faculty: z.string().min(2, 'Faculty required'),
  department: z.string().min(2, 'Department required'),
  level: z.string().min(1, 'Level required'),
  matricId: z.string().min(4, 'Matric number required'),
  graduationYear: z.number().min(2024).max(2035),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function StudentRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { graduationYear: 2026 },
  })

  const nextStep = async () => {
    const fields: (keyof FormData)[] = step === 1
      ? ['name', 'email', 'phone', 'password', 'confirmPassword']
      : ['location', 'university', 'faculty', 'department', 'level', 'matricId', 'graduationYear']
    const valid = await trigger(fields)
    if (valid) setStep(s => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountType: 'STUDENT' }),
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
          <h1 className="font-display text-2xl text-gray-900 mb-1">Join as a Provider</h1>
          <p className="text-gray-500 text-sm">Step {step} of 2 — {step === 1 ? 'Personal Info' : 'University Info'}</p>
          <div className="flex gap-2 mt-3 justify-center">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 w-16 rounded-full transition-colors ${s <= step ? 'bg-primary-900' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="card-base p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-5">
                <Input label="Full Name" placeholder="Amaka Okonkwo" leftIcon={<User size={16} />} error={errors.name?.message} {...register('name')} />
                <Input label="Email Address" type="email" placeholder="you@university.edu.ng" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
                <Input label="Phone Number" placeholder="0801 234 5678" leftIcon={<Phone size={16} />} error={errors.phone?.message} {...register('phone')} />
                <Input label="Password" type="password" placeholder="Min. 8 characters" leftIcon={<Lock size={16} />} error={errors.password?.message} hint="Must include uppercase and number" {...register('password')} />
                <Input label="Confirm Password" type="password" placeholder="Repeat password" leftIcon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                <Button type="button" onClick={nextStep} className="w-full">Continue</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <Input label="Your Location (City, State)" placeholder="Lagos, Nigeria" leftIcon={<MapPin size={16} />} error={errors.location?.message} {...register('location')} />
                <div>
                  <label className="label-base">University</label>
                  <select className="input-base" {...register('university')}>
                    <option value="">Select university</option>
                    {NIGERIAN_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  {errors.university && <p className="mt-1 text-xs text-red-600">{errors.university.message}</p>}
                </div>
                <Input label="Faculty" placeholder="e.g. Faculty of Engineering" leftIcon={<GraduationCap size={16} />} error={errors.faculty?.message} {...register('faculty')} />
                <Input label="Department" placeholder="e.g. Computer Science" error={errors.department?.message} {...register('department')} />
                <div>
                  <label className="label-base">Level</label>
                  <select className="input-base" {...register('level')}>
                    <option value="">Select level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.level && <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>}
                </div>
                <Input label="Matric / Student ID" placeholder="e.g. 180405001" error={errors.matricId?.message} {...register('matricId')} />
                <Input label="Expected Graduation Year" type="number" placeholder="2026" error={errors.graduationYear?.message} {...register('graduationYear', { valueAsNumber: true })} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button type="submit" loading={loading} className="flex-1">Create Account</Button>
                </div>
              </div>
            )}
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