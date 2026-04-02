'use client'

import { useState } from 'react'

export function isInAppWebView(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /Line\/|FBAN|FBAV|Instagram|MicroMessenger|WeChat|Snapchat|Twitter\/|TikTok/i.test(ua)
}

export default function WebViewWarning() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden yuzu-pop-in">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4 text-white text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="font-extrabold text-lg">請用手機瀏覽器開啟</h2>
          <p className="text-white/90 text-sm mt-1">
            目前在 LINE / FB 等 App 內開啟，Google 登入無法使用
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 text-center font-medium">
            請按照以下步驟操作：
          </p>

          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="font-bold text-blue-800 text-sm mb-2">📱 iPhone / iPad</p>
            <div className="space-y-1.5 text-xs text-blue-700">
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span>點擊右下角或右上角的 <strong>「...」</strong> 選單</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span>選擇 <strong>「在 Safari 中開啟」</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="font-bold text-green-800 text-sm mb-2">🤖 Android</p>
            <div className="space-y-1.5 text-xs text-green-700">
              <div className="flex items-start gap-2">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span>點擊右上角 <strong>「⋮」</strong> 選單</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span>選擇 <strong>「在 Chrome 中開啟」</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-500">開啟後即可正常使用 Google 帳號登入 ✅</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => setDismissed(true)}
            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            我知道了，繼續嘗試
          </button>
        </div>
      </div>
    </div>
  )
}
