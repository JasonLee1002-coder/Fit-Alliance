'use client'

import { useEffect, useRef } from 'react'
import { playRandomPikminCall } from '@/lib/pikmin-sounds'

/** 競技場成員頁專用：進入後隨機播皮克敏叫聲 */
export default function PikminArenaSounds() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 進入頁面 1 秒後先叫一次
    const first = setTimeout(() => playRandomPikminCall(), 1000)

    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        playRandomPikminCall()
        scheduleNext()
      }, 8000 + Math.random() * 10000)
    }
    scheduleNext()

    return () => {
      clearTimeout(first)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return null
}
