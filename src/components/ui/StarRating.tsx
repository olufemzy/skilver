import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  interactive?: boolean
  onChange?: (value: number) => void
  size?: number
}

export default function StarRating({ value, max = 5, interactive, onChange, size = 16 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = interactive ? i < (hovered || value) : i < Math.round(value)
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            onMouseEnter={interactive ? () => setHovered(i + 1) : undefined}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
            className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          >
            <Star
              size={size}
              className={cn(filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200')}
            />
          </button>
        )
      })}
    </div>
  )
}