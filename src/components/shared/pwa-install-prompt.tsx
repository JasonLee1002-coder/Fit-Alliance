'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Share, Plus, MoreVertical, Download } from 'lucide-react'

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

export default function PwaInstallPrompt() {
  const appName = '瘦身減肥聯盟'
  const appIcon = '/char-coaches.png'
  const accentColor = '#10B981'

  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  const [step, setStep] = useState(0)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if (isStandalone()) return
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) return

    const plat = detectPlatform()
    if (!plat) return
    setPlatform(plat)

    if (plat === 'android') {
      const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e) }
      window.addEventListener('beforeinstallprompt', handler)
      const timer = setTimeout(() => setShow(true), 3000)
      return () => { window.removeEventListener('beforeinstallprompt', handler); clearTimeout(timer) }
    }

    if (plat === 'ios') {
      const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent)
      if (!isSafari) return
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleDismiss() {
    setShow(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  async function handleAndroidInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') setShow(false)
      setDeferredPrompt(null)
    } else {
      setStep(1)
    }
  }

  if (!show || !platform) return null

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-6"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto relative">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <button onClick={handleDismiss}
                className="absolute top-4 right-5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 z-10">
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }} className="px-6 pt-2 pb-6">

                    <div className="flex flex-col items-center mb-5">
                      <motion.div className="relative"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.1, damping: 12 }}>
                        <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 flex items-center justify-center shadow-lg">
                          <img src={appIcon} alt={appName} className="w-14 h-14 rounded-2xl object-cover" />
                        </div>
                        <motion.span className="absolute -top-2 -right-2 text-lg"
                          animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>✨</motion.span>
                        <motion.span className="absolute -bottom-1 -left-2 text-sm"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}>💪</motion.span>
                      </motion.div>
                    </div>

                    <motion.h2 className="text-center text-lg font-bold text-gray-900 mb-1"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      把{appName}放到桌面
                    </motion.h2>
                    <motion.p className="text-center text-sm text-gray-500 mb-5"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      像 App 一樣一鍵開啟，更快更方便！
                    </motion.p>

                    <motion.div className="space-y-2.5 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      {[
                        { emoji: '⚡', text: '一鍵開啟，不用找網址' },
                        { emoji: '📱', text: '全螢幕體驗，像原生 App' },
                        { emoji: '🏋️', text: '隨時打卡，瘦身不中斷' },
                      ].map((item, i) => (
                        <motion.div key={i}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50"
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}>
                          <span className="text-lg">{item.emoji}</span>
                          <span className="text-sm text-gray-700">{item.text}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.button
                      onClick={() => platform === 'android' && deferredPrompt ? handleAndroidInstall() : setStep(1)}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #059669)`, boxShadow: `0 8px 20px ${accentColor}30` }}
                      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <Smartphone className="w-4 h-4" />
                      {platform === 'android' && deferredPrompt ? '立即安裝' : '教我怎麼加'}
                    </motion.button>
                    <button onClick={handleDismiss} className="w-full mt-2 py-2 text-xs text-gray-400">先不要，以後再說</button>
                  </motion.div>
                ) : (
                  <motion.div key="steps" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
                    className="px-6 pt-2 pb-6">
                    <h2 className="text-center text-base font-bold text-gray-900 mb-1">
                      {platform === 'ios' ? 'iPhone 加到主畫面' : 'Android 加到主畫面'}
                    </h2>
                    <p className="text-center text-xs text-gray-400 mb-5">
                      只要 {platform === 'ios' ? '3' : '2'} 步，超簡單！
                    </p>

                    {platform === 'ios' && (
                      <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-xs text-amber-700 font-medium">
                          ⚠️ 請先確認：必須使用 <strong>Safari 瀏覽器</strong>（iPhone 預設瀏覽器）開啟本頁面。如果你是用 LINE 或其他 App 內開啟，請先複製網址，再用 Safari 打開。
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 mb-6">
                      {platform === 'ios' ? (
                        <>
                          <StepCard n={1} color={accentColor} delay={0.1}
                            icon={<Share className="w-5 h-5" style={{ color: accentColor }} />}
                            title="用 Safari 打開後，點底部「分享」按鈕" desc="畫面最下方中間的 ⬆️ 方形箭頭按鈕（不是右上角）">
                            <div className="mt-2 flex justify-center">
                              <motion.div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100"
                                animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                                <Share className="w-5 h-5 text-blue-500" />
                              </motion.div>
                            </div>
                            <p className="mt-1.5 text-[10px] text-gray-400 text-center">如果看不到底部按鈕，輕點一下畫面最上方或最下方讓它出現</p>
                          </StepCard>
                          <StepCard n={2} color={accentColor} delay={0.2}
                            icon={<Plus className="w-5 h-5" style={{ color: accentColor }} />}
                            title='往下滑，找到「加入主畫面」' desc="會看到一個 ＋ 號圖示的選項，點它">
                            <div className="mt-2 flex justify-center">
                              <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-gray-600" />
                                <span className="text-xs text-gray-700 font-medium">加入主畫面</span>
                              </div>
                            </div>
                          </StepCard>
                          <StepCard n={3} color={accentColor} delay={0.3}
                            icon={<Download className="w-5 h-5" style={{ color: accentColor }} />}
                            title='按右上角「新增」完成！' desc="桌面就會出現 App 圖示，以後直接點開">
                            <div className="mt-2 flex justify-center">
                              <motion.span className="text-2xl" animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}>🎉</motion.span>
                            </div>
                          </StepCard>
                        </>
                      ) : (
                        <>
                          <StepCard n={1} color={accentColor} delay={0.1}
                            icon={<MoreVertical className="w-5 h-5" style={{ color: accentColor }} />}
                            title='用 Chrome 打開後，點右上角「⋮」' desc="Chrome 瀏覽器右上角的三個點選單">
                            <div className="mt-2 flex justify-center">
                              <motion.div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200"
                                animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                              </motion.div>
                            </div>
                          </StepCard>
                          <StepCard n={2} color={accentColor} delay={0.2}
                            icon={<Smartphone className="w-5 h-5" style={{ color: accentColor }} />}
                            title='選「加到主畫面」或「安裝應用程式」' desc="點選後桌面就會出現捷徑圖示">
                            <div className="mt-2 flex justify-center gap-2">
                              <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <Download className="w-4 h-4 text-gray-600" />
                                <span className="text-xs text-gray-700 font-medium">加到主畫面</span>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-center">
                              <motion.span className="text-2xl" animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>🎉</motion.span>
                            </div>
                          </StepCard>
                        </>
                      )}
                    </div>

                    <motion.button onClick={handleDismiss}
                      className="w-full py-3 rounded-2xl text-white font-bold text-sm"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #059669)` }}
                      whileTap={{ scale: 0.98 }}>知道了！</motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StepCard({ n, color, delay, icon, title, desc, children }: {
  n: number; color: string; delay: number
  icon: React.ReactNode; title: string; desc: string; children?: React.ReactNode
}) {
  return (
    <motion.div className="flex gap-3 items-start"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>{n}</div>
      <div className="flex-1 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
        <div className="flex items-center gap-2 mb-1">{icon}
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>
        <p className="text-xs text-gray-500">{desc}</p>
        {children}
      </div>
    </motion.div>
  )
}
