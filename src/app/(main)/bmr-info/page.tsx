'use client'
import { useRouter } from 'next/navigation'

export default function BmrInfoPage() {
  const router = useRouter()
  return (
    <div className="space-y-6 pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        返回
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🔥 認識基礎代謝率</h1>
        <p className="text-gray-500 text-sm mt-2">你每天「躺著就燒」的熱量</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6 text-center">
        <div className="text-6xl mb-3">🔥</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          BMR（Basal Metabolic Rate）是你的身體<strong className="text-amber-600">維持基本生命功能所消耗的熱量</strong>，<br />
          即使整天躺著不動，也需要這些能量來維持心跳、呼吸、體溫。
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📌 BMR 計算公式</h2>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-4">
          <div>
            <div className="text-xs font-bold text-amber-700 mb-1">女性（Mifflin-St Jeor）</div>
            <div className="text-sm font-black text-amber-900 font-mono">BMR = 10×體重(kg) + 6.25×身高(cm) − 5×年齡 − 161</div>
          </div>
          <div>
            <div className="text-xs font-bold text-blue-700 mb-1">男性（Mifflin-St Jeor）</div>
            <div className="text-sm font-black text-blue-900 font-mono">BMR = 10×體重(kg) + 6.25×身高(cm) − 5×年齡 + 5</div>
          </div>
          <p className="text-xs text-gray-500">例：女性 60 kg、165 cm、30 歲 → BMR ≈ 1,407 kcal</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📊 BMR 參考範圍</h2>
        <div className="space-y-2">
          {[
            { group: '成年女性', range: '1,200–1,600 kcal/天', color: 'bg-pink-50 text-pink-700 border-pink-200' },
            { group: '成年男性', range: '1,500–2,000 kcal/天', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { group: '運動員（任何性別）', range: '通常高出 15–30%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          ].map(item => (
            <div key={item.group} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.color}`}>
              <span className="text-sm font-bold">{item.group}</span>
              <span className="text-sm font-black flex-shrink-0 ml-2">{item.range}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">💡 BMR 與減重的關係</h2>
        <div className="space-y-3">
          {[
            { icon: '⚖️', title: '熱量赤字的基礎', desc: 'BMR 是你每天「最低必要熱量」。減重時不應低於 BMR，否則會讓身體進入飢餓模式、減慢代謝。' },
            { icon: '💪', title: '肌肉提升 BMR', desc: '肌肉是代謝引擎。增加肌肉量可以提高 BMR，讓你在相同活動量下燃燒更多熱量。' },
            { icon: '📈', title: 'TDEE = BMR × 活動係數', desc: '每日總消耗熱量（TDEE）= BMR × 活動係數（久坐 1.2 ~ 運動員 1.9）。這才是減重熱量目標的計算基礎。' },
            { icon: '🧊', title: '節食過度的陷阱', desc: '長期攝取遠低於 BMR 的熱量，身體會分解肌肉作為能量，導致 BMR 進一步下降、越減越難瘦。' },
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

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🎯 如何提高 BMR？</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🏋️', label: '增加肌肉量', desc: '重訓是最有效的 BMR 提升工具' },
            { icon: '🥩', label: '足夠蛋白質', desc: '食物熱效應高，消化蛋白質也燃熱量' },
            { icon: '😴', label: '充足睡眠', desc: '睡眠不足會降低代謝、增加飢餓素' },
            { icon: '🚰', label: '多喝水', desc: '水分充足有助維持正常代謝效率' },
          ].map(item => (
            <div key={item.label} className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-amber-800">{item.label}</div>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border border-orange-100 p-6 text-center">
        <div className="text-3xl mb-3">🔥</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">BMR 是你代謝的底線</h3>
        <p className="text-sm text-gray-600 leading-relaxed">保護並提升 BMR，才能讓減脂更輕鬆、<br />讓「越吃越瘦」不再只是夢想！</p>
        <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-2xl shadow-lg hover:bg-amber-600 transition active:scale-[0.98]">← 返回打卡</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-500 mb-2">📚 參考資料</h2>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li>1. Mifflin MD et al. - A new predictive equation for resting energy expenditure, 1990</li>
          <li>2. 衛生福利部國民健康署 - 每日飲食指南</li>
          <li>3. American Council on Exercise - Understanding Basal Metabolic Rate</li>
        </ul>
      </div>
    </div>
  )
}
