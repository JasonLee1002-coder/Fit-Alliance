'use client'

import { useRouter } from 'next/navigation'

export default function BodyFatInfoPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📊 認識體脂肪與體脂率</h1>
        <p className="text-gray-500 text-sm mt-2">了解體脂肪對身體組成的意義</p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-100 p-6 text-center">
        <div className="text-6xl mb-3">⚖️</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          體脂肪是人體儲存的脂肪總量，<strong className="text-orange-600">體脂率</strong>則是體脂肪佔體重的百分比。<br />
          它比「體重」更能反映你的<strong className="text-orange-600">真實身體組成</strong>。
        </p>
      </div>

      {/* What is Body Fat */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📌 體脂肪 vs 體脂率</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-orange-50 rounded-2xl p-4">
            <div className="text-center text-2xl mb-2">🧈</div>
            <div className="text-xs font-bold text-orange-700 text-center mb-1">體脂肪（kg）</div>
            <p className="text-xs text-gray-600">
              身體中脂肪的實際重量。例如體重 70 kg、體脂率 25% 的人，體脂肪約 17.5 kg。
            </p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4">
            <div className="text-center text-2xl mb-2">📊</div>
            <div className="text-xs font-bold text-amber-700 text-center mb-1">體脂率（%）</div>
            <p className="text-xs text-gray-600">
              體脂肪佔體重的百分比。相同體重下，體脂率越低代表肌肉比例越高，體態越精實。
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
          <strong>公式：</strong>體脂率 = 體脂肪重量 ÷ 體重 × 100%
        </div>
      </div>

      {/* Healthy Ranges */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🎯 健康體脂率範圍</h2>

        {/* Men */}
        <div className="mb-4">
          <div className="text-sm font-bold text-blue-600 mb-2">🚹 男性體脂率</div>
          <div className="space-y-2">
            {[
              { range: '6-13%', label: '運動員', color: 'bg-blue-100 text-blue-700 border-blue-200' },
              { range: '14-17%', label: '精實', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { range: '18-24%', label: '標準健康', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
              { range: '25-29%', label: '偏高', color: 'bg-amber-100 text-amber-700 border-amber-200' },
              { range: '30%+', label: '肥胖', color: 'bg-red-100 text-red-700 border-red-200' },
            ].map(item => (
              <div key={item.range} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${item.color}`}>
                <span className="text-sm font-bold">{item.range}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Women */}
        <div>
          <div className="text-sm font-bold text-pink-600 mb-2">🚺 女性體脂率</div>
          <div className="space-y-2">
            {[
              { range: '14-20%', label: '運動員', color: 'bg-pink-100 text-pink-700 border-pink-200' },
              { range: '21-24%', label: '精實', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { range: '25-31%', label: '標準健康', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
              { range: '32-35%', label: '偏高', color: 'bg-amber-100 text-amber-700 border-amber-200' },
              { range: '36%+', label: '肥胖', color: 'bg-red-100 text-red-700 border-red-200' },
            ].map(item => (
              <div key={item.range} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${item.color}`}>
                <span className="text-sm font-bold">{item.range}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Body Fat Matters */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">⚡ 為什麼體脂率比體重更重要？</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>兩個人體重相同（如 70 kg），但體脂率可能天差地別：</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
              <div className="text-2xl mb-1">💪</div>
              <div className="text-sm font-bold text-emerald-700">體脂率 18%</div>
              <p className="text-xs text-gray-500 mt-1">肌肉量高，線條明顯，看起來精壯</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
              <div className="text-2xl mb-1">😮</div>
              <div className="text-sm font-bold text-red-600">體脂率 35%</div>
              <p className="text-xs text-gray-500 mt-1">脂肪比例高，看起來鬆軟，健康風險增加</p>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {[
              { icon: '📉', title: '體重下降 ≠ 減脂成功', desc: '體重降了但可能只是流失水分或肌肉。追蹤體脂率才能確認是否真的在減脂。' },
              { icon: '📈', title: '體重上升也可能是好事', desc: '重訓增加肌肉量會讓體重上升，但體脂率下降，體態反而更好。' },
              { icon: '🩺', title: '體脂率與健康直接相關', desc: '高體脂率與心血管疾病、糖尿病、代謝症候群、脂肪肝等風險增加有直接關聯。' },
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
      </div>

      {/* Body Fat Types */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🔬 體脂肪的種類</h2>
        <div className="space-y-3">
          {[
            { icon: '🤏', title: '皮下脂肪', desc: '堆積在皮膚下方，可以捏到。主要在腹部、大腿、手臂。適量是正常的，過多影響外觀。', color: 'bg-blue-50 border-blue-100' },
            { icon: '🫀', title: '內臟脂肪', desc: '包裹在內臟周圍，看不到摸不到但危害最大。與心血管疾病、糖尿病高度相關。', color: 'bg-rose-50 border-rose-100', link: '/visceral-fat-info' },
            { icon: '🦴', title: '必需脂肪', desc: '維持生命機能必須的脂肪，存在於骨髓、大腦、神經、器官中。男性約 3%，女性約 12%。', color: 'bg-amber-50 border-amber-100' },
          ].map(item => (
            <div key={item.title} className={`p-4 rounded-2xl border ${item.color}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-bold text-gray-800">{item.title}</span>
                {item.link && (
                  <a href={item.link} className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">了解更多</a>
                )}
              </div>
              <p className="text-xs text-gray-600 ml-7">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Reduce */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🏃 如何有效降低體脂率？</h2>
        <div className="space-y-3">
          {[
            { icon: '🍽️', title: '熱量赤字', tips: ['每日攝取低於 TDEE（總熱量消耗）300-500 大卡', '不要極端節食，以免肌肉流失', '高蛋白飲食有助維持肌肉量'] },
            { icon: '🏋️', title: '重量訓練', tips: ['增加肌肉量以提高基礎代謝率', '每週 3-4 次肌力訓練', '複合動作（深蹲、硬舉、臥推）效果最好'] },
            { icon: '🏃', title: '有氧運動', tips: ['每週 150 分鐘中強度有氧', 'HIIT（高強度間歇訓練）可在短時間內高效燃脂', '搭配重訓效果更好'] },
            { icon: '😴', title: '睡眠與恢復', tips: ['每晚 7-9 小時睡眠', '睡眠不足會提高皮質醇，促進脂肪囤積', '充足休息讓肌肉修復、代謝正常'] },
          ].map(section => (
            <div key={section.title} className="p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{section.icon}</span>
                <span className="text-sm font-bold text-gray-800">{section.title}</span>
              </div>
              <ul className="space-y-1 ml-7">
                {section.tips.map(tip => (
                  <li key={tip} className="text-xs text-gray-600 list-disc">{tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement Methods */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📏 如何測量體脂率？</h2>
        <div className="space-y-3">
          {[
            { method: '⚖️ 智慧體脂秤', accuracy: '一般', desc: '利用 BIA 生物電阻抗估算，方便日常追蹤，適合觀察趨勢變化。' },
            { method: '📐 皮脂夾', accuracy: '中等', desc: '測量皮下脂肪厚度後推算體脂率。需要正確操作才準確。' },
            { method: '💧 水中秤重法', accuracy: '高', desc: '利用阿基米德原理，透過水中排水量計算身體密度。' },
            { method: '🔬 DEXA 掃描', accuracy: '最高', desc: '雙能量 X 光掃描，可精確測量全身脂肪、肌肉、骨密度分布。醫療級金標準。' },
          ].map(item => (
            <div key={item.method} className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-800">{item.method}</span>
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">精確度：{item.accuracy}</span>
              </div>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6 text-center">
        <div className="text-3xl mb-3">💪</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">持續追蹤體脂率</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          體重只是一個數字，體脂率才是真正的健康指標。<br />
          每天記錄，觀察趨勢，讓數據引導你的瘦身旅程！
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-600 transition active:scale-[0.98]"
        >
          ← 返回打卡
        </button>
      </div>

      {/* References */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-500 mb-2">📚 參考資料</h2>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li>1. American Council on Exercise (ACE) - Body Fat Percentage Norms</li>
          <li>2. National Institutes of Health (NIH) - Body Composition and Health</li>
          <li>3. Harvard Health Publishing - The truth about fats, 2022</li>
          <li>4. Journal of Clinical Densitometry - DEXA body composition standards, 2020</li>
          <li>5. WHO - Obesity: Preventing and Managing the Global Epidemic</li>
        </ul>
      </div>
    </div>
  )
}
