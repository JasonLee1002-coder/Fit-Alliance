'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WordFadeInProps {
  words: string
  className?: string
  delay?: number
}

export function WordFadeIn({ words, className, delay = 0.15 }: WordFadeInProps) {
  const wordList = words.split(' ')

  return (
    <motion.p className={cn('font-medium', className)}>
      {wordList.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * delay, duration: 0.3 }}
          className="mr-1 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  )
}
