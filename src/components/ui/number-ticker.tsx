'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  decimalPlaces?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function NumberTicker({ value, decimalPlaces = 0, className, prefix = '', suffix = '' }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, motionValue, value])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent =
          prefix +
          Intl.NumberFormat('zh-TW', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces))) +
          suffix
      }
    })
  }, [springValue, decimalPlaces, prefix, suffix])

  return (
    <span ref={ref} className={cn('inline-block tabular-nums font-mono', className)}>
      {prefix}
      {Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(value)}
      {suffix}
    </span>
  )
}
