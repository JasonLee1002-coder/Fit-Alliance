'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

const navItems = [
  { href: '/', label: '每日打卡', icon: '⚡', description: '體重紀錄' },
  { href: '/meals', label: '飲食紀錄', icon: '📸', description: '拍照上傳' },
  { href: '/coach', label: 'AI 教練', icon: '🤖', description: '個人指導' },
  { href: '/records', label: '健康紀錄', icon: '📊', description: '趨勢圖表' },
  { href: '/challenge', label: '共同挑戰', icon: '🏆', description: '排行榜' },
  { href: '/invite', label: '邀請朋友', icon: '🤝', description: '分享連結' },
  { href: '/report', label: '問題回報', icon: '💬', description: '回報問題' },
]

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-xl shadow-lg p-2.5 border border-gray-100"
        aria-label="開啟選單"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow">
              <span className="text-xl">💪</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">瘦身減肥聯盟</h1>
              <p className="text-[10px] text-gray-400">Fit Alliance</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div>{item.label}</div>
                  <div className="text-[10px] text-gray-400">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-50">
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-600 text-sm font-bold">
                  {user?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user?.name || '設定名稱'}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
