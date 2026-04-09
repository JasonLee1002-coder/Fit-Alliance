'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

const navItems = [
  { href: '/', label: '每日打卡首頁', img: '/nav3d-checkin-sm.png', description: '體重紀錄' },
  { href: '/records', label: '健康紀錄', img: '/nav3d-records-sm.png', description: '趨勢圖表' },
  { href: '/challenge', label: '共同挑戰', img: '/nav3d-challenge-sm.png', description: '排行榜' },
  { href: '/invite', label: '個人邀請朋友', img: '/nav3d-invite-sm.png', description: '分享連結' },
  { href: '/report', label: '問題回報', img: '/nav3d-report-sm.png', description: '回報問題' },
]

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-xl p-2.5 border border-emerald-500/20 bg-black/60 backdrop-blur-xl shadow-lg shadow-black/50"
        aria-label="開啟選單"
      >
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : undefined }}
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300',
          'super-ui-sidebar',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-md" />
              <img src="/icon-192.png" alt="Fit Alliance" className="relative w-12 h-12 rounded-xl shadow-lg" />
            </div>
            <div>
              <h1 className="font-bold text-emerald-100 text-sm tracking-wide">瘦身減肥聯盟</h1>
              <p className="text-[10px] text-emerald-600">Fit Alliance</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group',
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                      : 'text-emerald-700 hover:bg-white/5 hover:text-emerald-400'
                  )}
                >
                  <img src={item.img} alt="" className="w-11 h-11 drop-shadow-lg group-hover:scale-105 transition-transform duration-200" />
                  <div>
                    <div className={cn(isActive ? 'text-emerald-300 font-medium' : 'text-emerald-500')}>{item.label}</div>
                    <div className="text-[10px] text-emerald-800">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-emerald-500/10">
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center">
                  <span className="text-emerald-200 text-sm font-bold">
                    {user?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-emerald-300 truncate">{user?.name || '設定名稱'}</div>
              <div className="text-[10px] text-emerald-700 truncate">{user?.email}</div>
            </div>
            <svg className="w-4 h-4 text-emerald-700 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </motion.aside>
    </>
  )
}
