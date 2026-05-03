/**
 * 皮克敏音效系統 — 使用真實 MP3 音檔
 */

function play(src: string, volume = 0.7) {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(src)
    audio.volume = volume
    audio.play().catch(() => {/* autoplay blocked, ignore */})
  } catch { /* ignore */ }
}

/** 慶祝歡呼（登入 / 打卡成功 / 截圖上傳成功） */
export function playPikminCelebration() {
  play('/sounds/pikmin-yahoo.mp3', 0.75)
}

/** 競技場成員頁：隨機個人叫聲 */
const ARENA_CALLS = [
  '/sounds/pikmin-haa.mp3',
  '/sounds/pikmin-hyah.mp3',
  '/sounds/pikmin-wah.mp3',
  '/sounds/pikmin-phew.mp3',
  '/sounds/pikmin-moo.mp3',
  '/sounds/pikmin.mp3',
]

export function playRandomPikminCall() {
  const src = ARENA_CALLS[Math.floor(Math.random() * ARENA_CALLS.length)]
  play(src, 0.6)
}
