'use client'

import { motion } from 'framer-motion'

export default function MealsLoading() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6 border border-purple-100 text-center"
      >
        <motion.img
          src="/nav3d-meals-sm.png"
          alt=""
          className="w-20 h-20 mx-auto mb-3 drop-shadow-lg"
          animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="text-lg font-black text-purple-700">準備飲食紀錄...</p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-sm text-purple-500">載入你的飲食資料</span>
          <span className="flex gap-0.5">
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </span>
        </div>
      </motion.div>
    </div>
  )
}
