'use client'
import { useRouter } from 'next/navigation'
import UserMetricCard from '@/components/shared/user-metric-card'

export default function BoneMassInfoPage() {
  const router = useRouter()
  return (
    <div className="space-y-6 pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        返回
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🦴 認識骨質量</h1>
        <p className="text-gray-500 text-sm mt-2">身體的鋼筋骨架</p>
      </div>

      <UserMetricCard
        metric="bone_mass"
        label="骨質量"
        unit="kg"
        color="#06b6d4"
        evaluate={() => ({ type: 'neutral', message: '請對照下方表格，找出你的性別與體重區間' })}
      />

      <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-3xl border border-cyan-100 p-6 text-center">
        <div className="text-6xl mb-3">🦴</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          骨質量是體重計估算骨骼中<strong className="text-cyan-600">礦物質（主要為鈣、磷）的重量</strong>，<br />
          反映骨骼密度與強健程度，是預防骨質疏鬆的重要指標。
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📊 骨質量參考範圍</h2>
        <div className="space-y-2">
          {[
            { group: '女性（輕體重 < 50 kg）', range: '1.95 kg', color: 'bg-pink-50 text-pink-700 border-pink-200' },
            { group: '女性（中體重 50–75 kg）', range: '2.40 kg', color: 'bg-pink-50 text-pink-700 border-pink-200' },
            { group: '女性（重體重 > 75 kg）', range: '2.95 kg', color: 'bg-pink-50 text-pink-700 border-pink-200' },
            { group: '男性（輕體重 < 65 kg）', range: '2.66 kg', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { group: '男性（中體重 65–95 kg）', range: '3.29 kg', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { group: '男性（重體重 > 95 kg）', range: '3.69 kg', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          ].map(item => (
            <div key={item.group} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.color}`}>
              <span className="text-xs font-medium">{item.group}</span>
              <span className="text-sm font-black flex-shrink-0 ml-2">{item.range}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">※ 以上為體重計（BIA）推算值，精確測量需雙能量 X 光骨密度儀（DXA）</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">⚠️ 骨質疏鬆的風險</h2>
        <div className="space-y-3">
          {[
            { icon: '👵', title: '年齡增長', desc: '女性 35 歲、男性 45 歲後骨質開始流失，停經後女性流失更快。' },
            { icon: '🪑', title: '久坐不動', desc: '缺乏負重運動（走路、跑步、舉重）會加速骨質流失。' },
            { icon: '☀️', title: '維生素D不足', desc: '缺乏日曬或飲食中維生素D不足，影響鈣吸收，骨質下降。' },
            { icon: '🚬', title: '抽菸與過量飲酒', desc: '兩者都會干擾骨細胞的正常代謝，顯著降低骨密度。' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-sm font-bold text-red-800">{item.title}</div>
                <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🥛 如何強化骨骼？</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🥛', label: '補充鈣質', desc: '牛奶、豆腐、深綠色蔬菜' },
            { icon: '☀️', label: '日曬15分鐘', desc: '促進維生素D合成' },
            { icon: '🏃', label: '負重運動', desc: '跑步、跳繩、深蹲' },
            { icon: '🐟', label: '維生素D食物', desc: '鮭魚、蛋黃、強化乳' },
          ].map(item => (
            <div key={item.label} className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-cyan-800">{item.label}</div>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-3xl border border-cyan-100 p-6 text-center">
        <div className="text-3xl mb-3">🦴</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">骨骼的健康要趁早存</h3>
        <p className="text-sm text-gray-600 leading-relaxed">就像存退休金一樣，年輕時多存骨本，<br />老了才能立得穩、走得遠！</p>
        <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:bg-cyan-600 transition active:scale-[0.98]">← 返回打卡</button>
      </div>
    </div>
  )
}
