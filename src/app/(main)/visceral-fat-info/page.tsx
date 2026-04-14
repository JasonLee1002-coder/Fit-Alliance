'use client'

import { useRouter } from 'next/navigation'
import UserMetricCard from '@/components/shared/user-metric-card'

export default function VisceralFatInfoPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">🫀 認識內臟脂肪</h1>
        <p className="text-gray-500 text-sm mt-2">了解內臟脂肪對健康的影響</p>
      </div>

      <UserMetricCard
        metric="visceral_fat"
        label="內臟脂肪"
        unit=""
        color="#f43f5e"
        evaluate={(v) => {
          if (v <= 9) return { type: 'good', message: `健康範圍（標準 1-9），繼續保持！` }
          if (v <= 14) return { type: 'high', message: `偏高 ${v - 9}（超過健康值 9）` }
          return { type: 'high', message: `過高 ${v - 14}（建議就醫諮詢）` }
        }}
      />

      {/* Hero Illustration */}
      <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border border-rose-100 p-6 text-center">
        <div className="text-6xl mb-3">🫀</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          內臟脂肪是堆積在腹腔內部、包裹在內臟器官周圍的脂肪，<br />
          與皮下脂肪不同，<strong className="text-rose-600">它無法從外觀直接看出</strong>。
        </p>
      </div>

      {/* What is Visceral Fat */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📌 什麼是內臟脂肪？</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            人體的脂肪分為兩大類：<strong>皮下脂肪</strong>和<strong>內臟脂肪</strong>。
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-center text-2xl mb-2">🤏</div>
              <div className="text-xs font-bold text-blue-700 text-center mb-1">皮下脂肪</div>
              <p className="text-xs text-gray-600">
                分布在皮膚下方，可以用手捏到。主要存在於腹部、大腿、手臂等部位。
              </p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-4">
              <div className="text-center text-2xl mb-2">🫀</div>
              <div className="text-xs font-bold text-rose-700 text-center mb-1">內臟脂肪</div>
              <p className="text-xs text-gray-600">
                深藏在腹腔內，包裹在肝臟、腸道、腎臟等器官周圍，無法從外觀判斷。
              </p>
            </div>
          </div>
          <p>
            一般體脂秤或健康量測設備上會顯示<strong>內臟脂肪等級（1-59）</strong>，數字越高代表內臟脂肪越多。
          </p>
        </div>
      </div>

      {/* Risk Levels */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📊 內臟脂肪等級對照</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-emerald-700">1 - 9：正常範圍</div>
              <p className="text-xs text-gray-600 mt-0.5">
                內臟脂肪量健康，繼續保持均衡飲食與規律運動即可。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-700">10 - 14：偏高（警戒）</div>
              <p className="text-xs text-gray-600 mt-0.5">
                內臟脂肪偏高，建議調整飲食習慣、增加有氧運動，並定期追蹤。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="text-2xl">🚨</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-rose-700">15 以上：過高（危險）</div>
              <p className="text-xs text-gray-600 mt-0.5">
                內臟脂肪嚴重超標，與多種慢性疾病高度相關，建議儘速就醫諮詢。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">⚡ 為什麼內臟脂肪很重要？</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            內臟脂肪不只是「多餘的脂肪」，它具有<strong className="text-rose-600">代謝活性</strong>，會分泌發炎因子與荷爾蒙，直接影響身體健康。
          </p>
          <div className="space-y-2">
            {[
              { icon: '💔', title: '心血管疾病', desc: '內臟脂肪過高會增加動脈硬化、高血壓、心臟病的風險。' },
              { icon: '🩸', title: '第二型糖尿病', desc: '會導致胰島素阻抗，使血糖難以正常調節，大幅提升糖尿病風險。' },
              { icon: '🫁', title: '脂肪肝', desc: '脂肪堆積在肝臟周圍，可能引發非酒精性脂肪肝，嚴重時造成肝硬化。' },
              { icon: '🧠', title: '慢性發炎', desc: '分泌促發炎因子（如 TNF-α、IL-6），長期可能增加失智症、癌症風險。' },
              { icon: '🔬', title: '代謝症候群', desc: '腰圍過大、三酸甘油脂偏高、高密度膽固醇偏低等，常與內臟脂肪有直接關聯。' },
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

      {/* BMI vs Visceral Fat */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">💡 BMI 正常 ≠ 內臟脂肪正常</h2>
        <div className="text-sm text-gray-700 leading-relaxed space-y-2">
          <p>
            許多人 BMI 在正常範圍，但內臟脂肪卻偏高，這種情況被稱為<strong className="text-amber-700">「隱性肥胖」（Skinny Fat / TOFI）</strong>。
          </p>
          <p>
            TOFI = <em>Thin on the Outside, Fat on the Inside</em>（外瘦內胖）。這類人外觀看起來不胖，但體內脂肪大量堆積在器官周圍，健康風險不亞於明顯肥胖者。
          </p>
          <div className="bg-white/60 rounded-2xl p-4 mt-3">
            <p className="text-xs text-gray-600">
              <strong>研究指出：</strong>即使體重正常，內臟脂肪過高的人罹患心血管疾病的風險，比體重超標但內臟脂肪正常者更高。
              <br /><span className="text-[10px] text-gray-400 mt-1 block">— 出處：The Lancet Diabetes & Endocrinology, 2019</span>
            </p>
          </div>
        </div>
      </div>

      {/* How to Reduce */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🏃 如何降低內臟脂肪？</h2>
        <div className="space-y-3">
          {[
            {
              icon: '🥗',
              title: '調整飲食',
              tips: ['減少精製糖和加工食品', '增加蔬菜、蛋白質攝取', '避免過量飲酒（酒精會促進內臟脂肪堆積）', '控制碳水化合物的攝取量'],
            },
            {
              icon: '🏃',
              title: '有氧運動',
              tips: ['每週至少 150 分鐘中強度有氧運動', '快走、慢跑、游泳、騎腳踏車都有效', '研究證實有氧運動是降低內臟脂肪最有效的方式'],
            },
            {
              icon: '💪',
              title: '肌力訓練',
              tips: ['增加肌肉量可提升基礎代謝率', '建議每週 2-3 次重量訓練', '肌肉越多，靜態燃脂效率越高'],
            },
            {
              icon: '😴',
              title: '充足睡眠',
              tips: ['每晚 7-9 小時優質睡眠', '睡眠不足會增加皮質醇分泌，促進內臟脂肪堆積', '維持規律的睡眠作息'],
            },
            {
              icon: '🧘',
              title: '壓力管理',
              tips: ['長期壓力會使皮質醇升高，導致腹部脂肪增加', '可透過冥想、瑜珈、深呼吸來紓壓', '保持正面心態，避免過度焦慮'],
            },
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

      {/* Medical Diagram - Visual representation */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🔬 內臟脂肪與皮下脂肪分布圖</h2>
        <div className="bg-gray-50 rounded-2xl p-5">
          {/* SVG cross-section diagram */}
          <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Body outline */}
            <ellipse cx="200" cy="150" rx="150" ry="130" fill="#fef2f2" stroke="#fca5a5" strokeWidth="2" />
            {/* Subcutaneous fat layer */}
            <ellipse cx="200" cy="150" rx="130" ry="110" fill="#fff7ed" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="6 3" />
            {/* Abdominal cavity */}
            <ellipse cx="200" cy="150" rx="95" ry="80" fill="#fef9c3" stroke="#fde047" strokeWidth="1" />
            {/* Visceral fat blobs */}
            <ellipse cx="160" cy="130" rx="25" ry="18" fill="#fda4af" opacity="0.7" />
            <ellipse cx="240" cy="130" rx="22" ry="16" fill="#fda4af" opacity="0.7" />
            <ellipse cx="200" cy="170" rx="28" ry="15" fill="#fda4af" opacity="0.7" />
            <ellipse cx="175" cy="160" rx="18" ry="12" fill="#fda4af" opacity="0.6" />
            <ellipse cx="225" cy="155" rx="20" ry="14" fill="#fda4af" opacity="0.6" />
            {/* Organs */}
            <ellipse cx="180" cy="135" rx="15" ry="20" fill="#a7f3d0" stroke="#6ee7b7" strokeWidth="1" />
            <text x="180" y="139" textAnchor="middle" fontSize="8" fill="#065f46">肝</text>
            <ellipse cx="220" cy="135" rx="12" ry="18" fill="#a7f3d0" stroke="#6ee7b7" strokeWidth="1" />
            <text x="220" y="139" textAnchor="middle" fontSize="8" fill="#065f46">腎</text>
            {/* Intestines representation */}
            <path d="M185,165 Q195,155 205,165 Q215,175 225,165" fill="none" stroke="#6ee7b7" strokeWidth="2" />
            <path d="M180,175 Q195,165 210,175 Q225,185 230,175" fill="none" stroke="#6ee7b7" strokeWidth="2" />
            <text x="205" y="192" textAnchor="middle" fontSize="8" fill="#065f46">腸道</text>
            {/* Labels */}
            <line x1="55" y1="80" x2="85" y2="110" stroke="#f87171" strokeWidth="1" />
            <text x="15" y="75" fontSize="10" fill="#be123c" fontWeight="bold">皮下脂肪</text>
            <line x1="340" y1="90" x2="290" y2="120" stroke="#fb923c" strokeWidth="1" />
            <text x="310" y="82" fontSize="10" fill="#c2410c" fontWeight="bold">腹腔</text>
            <line x1="310" y1="170" x2="260" y2="155" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="305" y="178" fontSize="11" fill="#be123c" fontWeight="bold">內臟脂肪</text>
            <rect x="295" y="165" rx="2" width="90" height="18" fill="#fda4af" opacity="0.3" />
            {/* Title */}
            <text x="200" y="25" textAnchor="middle" fontSize="13" fill="#374151" fontWeight="bold">腹部橫截面示意圖</text>
            <text x="200" y="285" textAnchor="middle" fontSize="9" fill="#9ca3af">粉紅色 = 內臟脂肪 ｜ 綠色 = 器官 ｜ 橘色虛線 = 皮下脂肪層</text>
          </svg>
        </div>
      </div>

      {/* Measurement Methods */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📏 如何測量內臟脂肪？</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="font-bold text-gray-800 mb-1">🏥 醫療級檢測</div>
              <p className="text-xs text-gray-600">
                CT（電腦斷層掃描）和 MRI（核磁共振造影）是最精確的方法，可以直接看到內臟脂肪的分布。但費用較高，通常用於研究或臨床。
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="font-bold text-gray-800 mb-1">⚖️ 智慧體脂秤</div>
              <p className="text-xs text-gray-600">
                利用生物電阻抗分析（BIA）技術估算內臟脂肪等級。雖然不如 CT 精確，但方便日常追蹤，適合長期監控趨勢變化。本 App 支援拍照辨識體脂秤數據。
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="font-bold text-gray-800 mb-1">📏 腰圍測量</div>
              <p className="text-xs text-gray-600">
                簡單的自我評估方式。男性腰圍超過 90 公分、女性超過 80 公分，即為腹部肥胖，通常與較高的內臟脂肪有關。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6 text-center">
        <div className="text-3xl mb-3">💪</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">持續追蹤，掌握健康</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          每天記錄體重與身體數據，持續觀察內臟脂肪的趨勢變化。<br />
          搭配均衡飲食和規律運動，一步步改善體態與健康！
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
          <li>1. World Health Organization (WHO) - Waist circumference and waist-hip ratio: report of a WHO expert consultation, 2008</li>
          <li>2. Neeland IJ, et al. Visceral and ectopic fat, atherosclerosis, and cardiometabolic disease. The Lancet Diabetes & Endocrinology, 2019;7(9):715-725</li>
          <li>3. Shuster A, et al. The clinical importance of visceral adiposity. British Journal of Radiology, 2012;85(1009):1-10</li>
          <li>4. OMRON Healthcare - Understanding Visceral Fat Level</li>
          <li>5. Harvard Health Publishing - Abdominal fat and what to do about it, 2021</li>
        </ul>
      </div>
    </div>
  )
}
