import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userName, gender, latestWeight, previousWeight, targetWeight, streak, recentTrend, bodyFat, dayOfWeek, hour } = body

    const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : null
    const toGoal = targetWeight && latestWeight ? (latestWeight - targetWeight).toFixed(1) : null
    const timeGreeting = (hour ?? 12) < 12 ? '早安' : (hour ?? 12) < 18 ? '午安' : '晚安'

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      system: `你是「瘦身減肥聯盟」的首頁智慧問候 AI。每次用戶打開 App 時，你要生成一段個人化的歡迎語。

風格：像一個幽默又有營養學知識的好朋友，不是醫生也不是教官。
- 繁體中文，台灣口語
- 2-4 句話，簡短有溫度
- 用「${timeGreeting}」開頭打招呼（只用這一個，不要列出其他時段的問候）
- 根據體重趨勢給一個有趣的觀察或營養小知識
- 如果體重下降：開心鼓勵
- 如果體重上升：幽默帶過，不批評
- 如果有連續打卡：誇獎堅持
- 可以穿插一個實用的營養學或減脂小知識
- 偶爾可以用台語、流行語、誇張比喻
- 不要太正式，要像朋友聊天`,
      prompt: `用戶：${userName}（${gender === 'male' ? '男' : '女'}）
今天：星期${dayOfWeek}
${latestWeight ? `最新體重：${latestWeight} kg` : '尚未打卡'}
${weightChange !== null ? `上次變化：${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg` : ''}
${bodyFat ? `最新體脂：${bodyFat}%` : ''}
${toGoal ? `距離目標：還差 ${toGoal} kg` : ''}
${streak ? `連續打卡：${streak} 天` : '今天還沒打卡'}
${recentTrend ? `近期趨勢：${recentTrend}` : ''}

請生成今日歡迎語（包含一個營養學或減脂相關的小知識或有趣觀察）。`,
    })

    return NextResponse.json({ message: text })
  } catch {
    return NextResponse.json({ message: '' })
  }
}
