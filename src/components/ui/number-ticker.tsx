'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  decimalPlaces?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function NumberTicker({
  value,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [motionValue, isInView, value])

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + latest.toFixed(decimalPlaces) + suffix
      }
    })
  }, [spring, decimalPlaces, prefix, suffix])

  return (
    <span
      ref={ref}
      className={cn('tabular-nums', className)}
    >
      {prefix}0{suffix}
    </span>
  )
}
