'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import WebViewWarning, { isInAppWebView } from '@/components/shared/webview-warning'
import { pub } from '@/lib/pub'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showWebViewWarning] = useState(() => isInAppWebView())
  const wrongAccount = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') === 'wrong_account'

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 30%, #fff7ed 70%, #fef3c7 100%)' }}>
      {/* WebView Warning */}
      {showWebViewWarning && <WebViewWarning />}

      {/* Background decoration — richer depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-8%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[60%] w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-6 yuzu-slide-up">
          <div className="mb-4 yuzu-float inline-block relative">
            {/* Glow ring behind logo */}
            <div className="absolute inset-0 rounded-[28px] blur-xl opacity-40" style={{ background: 'linear-gradient(135deg, #10b981, #f59e0b)' }} />
            <img src={pub('/char-coaches.png')} alt="Fit Alliance" className="relative w-48 h-48 drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
            瘦身減肥競技場
          </h1>
          <p className="text-gray-400 font-medium text-sm tracking-wide">
            一起變瘦，一起變強
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/70 yuzu-pop-in" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6) inset' }}>
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-gray-800">歡迎加入</h2>
            <p className="text-gray-400 text-xs mt-0.5">用 Google 帳號快速開始</p>
          </div>

          {wrongAccount && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              ⚠️ 請選擇 <strong>leechishen@gmail.com</strong>，不是工作帳號 lcs@transtep.com
            </div>
          )}

          {/* Google Login Button — emerald-accented primary CTA */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 font-bold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-60 yuzu-cta-glow-emerald"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)' }}
          >
            {loading ? (
              <div className="yuzu-spinner" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="white" fillOpacity="0.9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="white" fillOpacity="0.75" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="white" fillOpacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="white" fillOpacity="0.8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? '登入中...' : '以 Google 帳號登入'}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            登入即表示你同意我們的服務條款與隱私政策
          </p>
        </div>

        {/* Features Preview — 3 distinct images */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { img: pub('/char-coach-sm.png'), label: 'AI 教練', desc: '個人化建議', delay: '0.1s' },
            { img: pub('/pikmin-scale.png'), label: '體重追蹤', desc: '每日打卡', delay: '0.2s' },
            { img: pub('/nav3d-challenge-sm.png'), label: '聯盟挑戰', desc: '競技排名', delay: '0.3s' },
          ].map(item => (
            <div
              key={item.label}
              className="bg-white/70 backdrop-blur-sm rounded-2xl py-3 px-2 border border-white/60 text-center yuzu-slide-up"
              style={{ animationDelay: item.delay, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <img src={item.img} alt="" className="w-10 h-10 mx-auto mb-1.5 drop-shadow" />
              <div className="text-[11px] font-bold text-gray-700">{item.label}</div>
              <div className="text-[10px] text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
