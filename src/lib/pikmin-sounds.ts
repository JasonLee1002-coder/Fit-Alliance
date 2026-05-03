/**
 * 皮克敏音效合成器 — 使用 Web Audio API 產生可愛叫聲
 * 不需要音檔，純合成
 */

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch {
    return null
  }
}

/** 基礎音符播放：頻率滑動 + 包絡 */
function playNote(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  duration: number,
  startTime: number,
  volume = 0.18,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freqStart, startTime)
  osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration * 0.8)

  // 包絡：快速起音，自然衰退
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

/** 叫聲 1：短促上揚「嘿！」 */
function callHey() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  playNote(ctx, 680, 980, 0.18, t, 0.16)
  playNote(ctx, 680, 980, 0.18, t, 0.08, 'triangle')
}

/** 叫聲 2：雙音「皮～克」 */
function callPikmin() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  playNote(ctx, 820, 760, 0.14, t, 0.14)
  playNote(ctx, 1050, 920, 0.18, t + 0.16, 0.16)
}

/** 叫聲 3：三連音「嗯嗯嗯」 */
function callTriple() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  for (let i = 0; i < 3; i++) {
    playNote(ctx, 740 + i * 60, 700 + i * 50, 0.12, t + i * 0.13, 0.13)
  }
}

/** 叫聲 4：上揚長音「嘿〜」 */
function callRise() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  playNote(ctx, 520, 1100, 0.32, t, 0.14)
  playNote(ctx, 520, 1100, 0.32, t + 0.01, 0.07, 'triangle')
}

/** 叫聲 5：興奮雙音「Yeah!」 */
function callYeah() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  playNote(ctx, 900, 1200, 0.12, t, 0.15)
  playNote(ctx, 750, 600, 0.2, t + 0.13, 0.13)
}

const CALLS = [callHey, callPikmin, callTriple, callRise, callYeah]

/** 隨機播一個皮克敏叫聲 */
export function playRandomPikminCall() {
  const fn = CALLS[Math.floor(Math.random() * CALLS.length)]
  fn()
}

/** 慶祝連音：三連叫 + 歡呼上揚 */
export function playPikminCelebration() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  // 三連快叫
  playNote(ctx, 700, 1000, 0.1, t,       0.16)
  playNote(ctx, 800, 1100, 0.1, t + 0.12, 0.16)
  playNote(ctx, 900, 1300, 0.1, t + 0.24, 0.18)
  // 最後長揚音
  playNote(ctx, 600, 1400, 0.4, t + 0.4,  0.15)
  playNote(ctx, 600, 1400, 0.4, t + 0.41, 0.08, 'triangle')
}
