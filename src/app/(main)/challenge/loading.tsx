'use client'

import { motion } from 'framer-motion'

export default function ChallengeLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Mascot + motivational text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-orange-100 text-center"
      >
        <motion.img
          src="/nav3d-challenge-sm.png"
          alt=""
          className="w-20 h-20 mx-auto mb-3 drop-shadow-lg"
          animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.p
          className="text-lg font-black text-orange-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          準備進入挑戰場...
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-1.5 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm text-orange-500">載入排行榜資料</span>
          <span className="flex gap-0.5">
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </span>
        </motion.div>
      </motion.div>

      {/* Skeleton cards */}
      <div className="space-y-3">
        {[1, 2].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
