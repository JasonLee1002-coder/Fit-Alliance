'use client'

import { motion } from 'framer-motion'

export default function RecordsLoading() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 text-center"
      >
        <motion.img
          src="/nav3d-records-sm.png"
          alt=""
          className="w-20 h-20 mx-auto mb-3 drop-shadow-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="text-lg font-black text-blue-700">載入健康紀錄...</p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-sm text-blue-500">整理你的趨勢數據</span>
          <span className="flex gap-0.5">
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </span>
        </div>
      </motion.div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
