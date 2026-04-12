'use client'
import { useRouter } from 'next/navigation'

export default function MuscleInfoPage() {
  const router = useRouter()
  return (
    <div className="space-y-6 pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        返回
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">💪 認識肌肉量</h1>
        <p className="text-gray-500 text-sm mt-2">越多越好的健康數值</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-6 text-center">
        <div className="text-6xl mb-3">💪</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          肌肉是人體最大的代謝器官，<strong className="text-green-600">肌肉量越高，基礎代謝率越高</strong>，<br />
          即使休息時也能燃燒更多熱量，是減脂最強的武器。
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📊 肌肉量參考範圍（體重計量測）</h2>
        <div className="space-y-2">
          {[
            { group: '成年女性', range: '36–44 kg', color: 'bg-pink-50 text-pink-700 border-pink-200' },
            { group: '成年男性', range: '50–62 kg', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { group: '運動員女性', range: '44 kg 以上', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { group: '運動員男性', range: '62 kg 以上', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          ].map(item => (
            <div key={item.group} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.color}`}>
              <span className="text-sm font-bold">{item.group}</span>
              <span className="text-sm font-black">{item.range}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">※ 以上為體重計（生物阻抗法 BIA）測量值，各品牌略有差異</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔥 為什麼肌肉這麼重要？</h2>
        <div className="space-y-3">
          {[
            { icon: '⚡', title: '提升基礎代謝率', desc: '每增加 1 kg 肌肉，靜息時每天多燃燒約 50 kcal。肌肉量越高，躺著都在瘦！' },
            { icon: '🛡️', title: '保護關節與骨骼', desc: '強健的肌肉像盔甲一樣保護骨骼，減少關節受傷風險，讓你跑更快、跳更高。' },
            { icon: '🩺', title: '預防慢性病', desc: '肌肉量充足與降低第二型糖尿病、心血管疾病、肌少症等慢性病風險密切相關。' },
            { icon: '🧓', title: '抗老化關鍵', desc: '30 歲後每年流失約 1% 肌肉，維持肌肉量是抵抗老化最有效的方式之一。' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-sm font-bold text-gray-800">{item.title}</div>
                <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🏋️ 如何增加肌肉量？</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🥩', label: '足夠蛋白質', desc: '每公斤體重至少 1.6g 蛋白質' },
            { icon: '🏋️', label: '阻力訓練', desc: '每週 2–3 次重量訓練' },
            { icon: '😴', label: '充足睡眠', desc: '7–9 小時，肌肉在睡眠中修復' },
            { icon: '🔄', label: '漸進超負荷', desc: '循序漸進增加重量或次數' },
          ].map(item => (
            <div key={item.label} className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-green-800">{item.label}</div>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6 text-center">
        <div className="text-3xl mb-3">💪</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">減脂不減肌，才是真正的瘦</h3>
        <p className="text-sm text-gray-600 leading-relaxed">體重下降的同時，確保肌肉量維持或上升，<br />這才是健康且持久的減脂成果！</p>
        <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-600 transition active:scale-[0.98]">← 返回打卡</button>
      </div>
    </div>
  )
}
