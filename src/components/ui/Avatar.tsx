import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-lg' }
const imgSizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const s = sizes[size]
  const px = imgSizes[size]

  if (src) {
    return (
      <div className={cn(`${s} rounded-full overflow-hidden bg-gray-100 flex-shrink-0`, className)}>
        <Image src={src} alt={name} width={px} height={px} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={cn(`${s} rounded-full bg-primary-900 flex items-center justify-center text-white font-bold flex-shrink-0`, className)}>
      {getInitials(name)}
    </div>
  )
}