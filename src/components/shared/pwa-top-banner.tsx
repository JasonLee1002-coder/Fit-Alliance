'use client'

import { useEffect, useState } from 'react'
import { X, Smartphone, Share, Plus, MoreVertical, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Platform = 'ios' | 'android' | null

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as any).standalone === true)
  )
}

export default function PwaTopBanner() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const plat = detectPlatform()
    if (!plat) return
    setPlatform(plat)

    if (plat === 'android') {
      const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e) }
      window.addEventListener('beforeinstallprompt', handler)
      setShow(true)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    if (plat === 'ios') {
      const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent)
      if (!isSafari) return
      setShow(true)
    }
  }, [])

  function handleDismiss() {
    setShow(false)
    setShowSteps(false)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  async function handleInstall() {
    if (platform === 'android' && deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') { setShow(false); setShowSteps(false) }
      setDeferredPrompt(null)
    } else {
      setShowSteps(true)
    }
  }

  if (!show || !platform) return null

  return (
    <>
      {/* 頂部橫幅 */}
      <AnimatePresence>
        {show && !showSteps && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[9990] bg-emerald-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium truncate">加到主畫面，像 App 一樣使用！</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstall}
                className="bg-white text-emerald-600 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm active:scale-95"
              >
                {platform === 'android' && deferredPrompt ? '立即安裝' : '怎麼安裝？'}
              </button>
              <button onClick={handleDismiss} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 步驟說明 Modal */}
      <AnimatePresence>
        {showSteps && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[9991]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSteps(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[9992] px-4 pb-6"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-md mx-auto overflow-hidden">
                <div className="flex justify-center pt-3"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
                <button onClick={() => setShowSteps(false)}
                  className="absolute top-4 right-5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 z-10">
                  <X className="w-4 h-4" />
                </button>

                <div className="px-6 pt-3 pb-6">
                  <h2 className="text-center text-base font-bold text-gray-900 mb-1">
                    {platform === 'ios' ? 'iPhone 加到主畫面' : 'Android 加到主畫面'}
                  </h2>
                  <p className="text-center text-xs text-gray-400 mb-4">
                    只要 {platform === 'ios' ? '3' : '2'} 步，超簡單！
                  </p>

                  {platform === 'ios' && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-700 font-medium">
                        ⚠️ 必須使用 <strong>Safari 瀏覽器</strong>開啟本頁面才能安裝。LINE 或其他 App 內開啟請先複製網址再用 Safari 打開。
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 mb-5">
                    {platform === 'ios' ? (
                      <>
                        <MiniStep n={1} color="#10B981" icon={<Share className="w-4 h-4" />}
                          title="點底部「分享」⬆️ 按鈕" desc="Safari 底部中間的方形箭頭按鈕" />
                        <MiniStep n={2} color="#10B981" icon={<Plus className="w-4 h-4" />}
                          title='往下滑找「加入主畫面」' desc="有 ＋ 號的選項" />
                        <MiniStep n={3} color="#10B981" icon={<Download className="w-4 h-4" />}
                          title='按右上角「新增」完成 🎉' desc="桌面就會出現 App 圖示" />
                      </>
                    ) : (
                      <>
                        <MiniStep n={1} color="#10B981" icon={<MoreVertical className="w-4 h-4" />}
                          title='點右上角「⋮」選單' desc="Chrome 右上角三個點" />
                        <MiniStep n={2} color="#10B981" icon={<Smartphone className="w-4 h-4" />}
                          title='選「加到主畫面」或「安裝應用程式」' desc="點選後桌面就會出現圖示 🎉" />
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600"
                  >
                    知道了！
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MiniStep({ n, color, icon, title, desc }: {
  n: number; color: string; icon: React.ReactNode; title: string; desc: string
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: color }}>
        {n}
      </div>
      <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="flex items-center gap-1.5 mb-0.5" style={{ color }}>
          {icon}
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  )
}
