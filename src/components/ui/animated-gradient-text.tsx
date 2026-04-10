'use client'

import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_3s_linear_infinite]',
        className
      )}
    >
      {children}
    </span>
  )
}
