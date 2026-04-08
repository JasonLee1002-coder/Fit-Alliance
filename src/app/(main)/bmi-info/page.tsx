'use client'

import { useRouter } from 'next/navigation'

export default function BmiInfoPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📐 認識 BMI 身體質量指數</h1>
        <p className="text-gray-500 text-sm mt-2">最常見的體重評估指標</p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 text-center">
        <div className="text-6xl mb-3">📐</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          BMI（Body Mass Index）是利用<strong className="text-blue-600">身高與體重</strong>計算出的數值，<br />
          用來快速評估一個人的體重是否在健康範圍。
        </p>
      </div>

      {/* Formula */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📌 BMI 計算公式</h2>
        <div className="bg-blue-50 rounded-2xl p-5 text-center border border-blue-100">
          <div className="text-2xl font-black text-blue-700 mb-2">BMI = 體重(kg) ÷ 身高(m)²</div>
          <p className="text-sm text-gray-600">例：體重 70 kg、身高 170 cm（1.7 m）</p>
          <p className="text-sm text-gray-600">BMI = 70 ÷ (1.7 × 1.7) = 70 ÷ 2.89 ≈ <strong className="text-blue-700">24.2</strong></p>
        </div>
      </div>

      {/* Classification Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🎯 BMI 分級標準（亞洲標準）</h2>
        <p className="text-xs text-gray-400 mb-3">以下為世界衛生組織亞太區域標準，較適合亞洲人體型</p>
        <div className="space-y-2">
          {[
            { range: '< 18.5', label: '體重過輕', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: '營養不良風險增加' },
            { range: '18.5 - 22.9', label: '正常範圍', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', desc: '維持健康體態' },
            { range: '23.0 - 24.9', label: '過重', color: 'bg-amber-100 text-amber-700 border-amber-200', desc: '建議控制飲食與增加運動' },
            { range: '25.0 - 29.9', label: '輕度肥胖', color: 'bg-orange-100 text-orange-700 border-orange-200', desc: '慢性病風險上升' },
            { range: '30.0 - 34.9', label: '中度肥胖', color: 'bg-red-100 text-red-700 border-red-200', desc: '應積極減重，建議就醫諮詢' },
            { range: '≥ 35.0', label: '重度肥胖', color: 'bg-red-200 text-red-800 border-red-300', desc: '嚴重健康風險，需醫療介入' },
          ].map(item => (
            <div key={item.range} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${item.color}`}>
              <div>
                <span className="text-sm font-bold">{item.range}</span>
                <span className="text-xs ml-2 opacity-75">{item.desc}</span>
              </div>
              <span className="text-xs font-bold flex-shrink-0 ml-2">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why BMI Matters */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">⚡ BMI 的用途與意義</h2>
        <div className="space-y-2">
          {[
            { icon: '🏥', title: '醫療評估工具', desc: '全球醫療機構最常用的初步體重評估方式，簡單快速，適合大規模篩檢。' },
            { icon: '📊', title: '趨勢追蹤', desc: '長期追蹤 BMI 變化可以觀察體重管理成效，配合體脂率更完整。' },
            { icon: '🛡️', title: '健康風險預測', desc: 'BMI 過高與第二型糖尿病、心血管疾病、高血壓、部分癌症等風險增加有關。' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-sm font-bold text-gray-800">{item.title}</div>
                <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">⚠️ BMI 的限制</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>BMI 雖然方便，但<strong className="text-amber-700">有重要的限制</strong>：</p>
          <div className="space-y-2">
            {[
              { icon: '💪', text: '無法區分肌肉與脂肪 — 健身者 BMI 可能偏高但體脂低，反而很健康。' },
              { icon: '🫀', text: '無法反映內臟脂肪 — BMI 正常的人也可能有高內臟脂肪（隱性肥胖）。' },
              { icon: '👴', text: '不適用所有族群 — 老年人、孕婦、兒童、運動員的 BMI 解讀方式不同。' },
              { icon: '📏', text: '不反映脂肪分布 — 腰部脂肪堆積比全身均勻分布的風險更高。' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <p className="text-xs text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/60 rounded-xl p-3 mt-2">
            <p className="text-xs text-gray-600">
              <strong>建議：</strong>BMI 搭配<a href="/body-fat-info" className="text-orange-600 underline">體脂率</a>和<a href="/visceral-fat-info" className="text-orange-600 underline">內臟脂肪</a>一起看，才能全面了解身體狀況。
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6 text-center">
        <div className="text-3xl mb-3">📐</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">BMI 是起點，不是終點</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          BMI 是最快速的健康指標，但不是唯一的。<br />
          搭配體脂率、內臟脂肪、肌肉量等數據，才能真正掌握健康全貌！
        </p>
        <button onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-600 transition active:scale-[0.98]">
          ← 返回打卡
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-500 mb-2">📚 參考資料</h2>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li>1. WHO Expert Consultation - Appropriate BMI for Asian populations, The Lancet, 2004</li>
          <li>2. 衛生福利部國民健康署 - 成人健康體位標準</li>
          <li>3. Harvard T.H. Chan School of Public Health - BMI: Uses and limitations</li>
          <li>4. National Heart, Lung, and Blood Institute - Calculate Your BMI</li>
        </ul>
      </div>
    </div>
  )
}
