'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import WebViewWarning, { isInAppWebView } from '@/components/shared/webview-warning'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showWebViewWarning] = useState(() => isInAppWebView())

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* WebView Warning */}
      {showWebViewWarning && <WebViewWarning />}

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8 yuzu-slide-up">
          <div className="mb-5 yuzu-float">
            <img src="/char-coach.png" alt="Fit Alliance" className="w-28 h-28 drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
            瘦身減肥聯盟
          </h1>
          <p className="text-gray-400 text-lg font-light">
            一起變瘦，一起變強
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-white/60 yuzu-pop-in">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">歡迎加入</h2>
              <p className="text-gray-400 text-sm mt-1">用 Google 帳號快速開始</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-700 font-semibold hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? '登入中...' : '以 Google 帳號登入'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              登入即表示你同意我們的服務條款與隱私政策
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { img: '/char-coaches.png', label: 'AI 教練', delay: '0.1s' },
            { img: '/nav3d-meals-sm.png', label: '食物辨識', delay: '0.2s' },
            { img: '/nav3d-challenge-sm.png', label: '聯盟挑戰', delay: '0.3s' },
          ].map(item => (
            <div
              key={item.label}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/60 yuzu-health-card yuzu-slide-up"
              style={{ animationDelay: item.delay }}
            >
              <img src={item.img} alt="" className="w-10 h-10 mx-auto mb-1.5" />
              <div className="text-xs font-medium text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
