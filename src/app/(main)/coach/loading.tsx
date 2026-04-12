'use client'

import { motion } from 'framer-motion'

export default function CoachLoading() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 text-center"
      >
        <motion.img
          src="/char-coach-male.png"
          alt=""
          className="w-20 h-20 mx-auto mb-3 drop-shadow-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.p
          className="text-lg font-black text-emerald-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          AI 教練準備中...
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-1.5 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm text-emerald-500">分析你的健康數據</span>
          <span className="flex gap-0.5">
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </span>
        </motion.div>
      </motion.div>

      {/* Chat skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
            <div className={`rounded-2xl p-4 max-w-[70%] ${i % 2 === 0 ? 'bg-emerald-100' : 'bg-white border border-gray-100'}`}>
              <div className="space-y-2">
                <div className="h-3 w-32 bg-gray-200/50 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200/50 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
