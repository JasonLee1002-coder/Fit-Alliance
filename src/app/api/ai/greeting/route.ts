import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userName, gender, latestWeight, prevWeight,
      weekAgoWeight, monthAgoWeight,
      targetWeight, streak, bodyFat, dayOfWeek, hour,
    } = body

    const fmt = (v: number) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))
    const dayChange   = latestWeight && prevWeight     ? latestWeight - prevWeight     : null
    const weekChange  = latestWeight && weekAgoWeight  ? latestWeight - weekAgoWeight  : null
    const monthChange = latestWeight && monthAgoWeight ? latestWeight - monthAgoWeight : null

    const timeGreeting = (hour ?? 12) < 12 ? '早安' : (hour ?? 12) < 18 ? '午安' : '晚安'

    const compLines: string[] = []
    if (dayChange   !== null) compLines.push(`比上次紀錄：${fmt(dayChange)} kg`)
    if (weekChange  !== null) compLines.push(`比上週：${fmt(weekChange)} kg`)
    if (monthChange !== null) compLines.push(`比上月：${fmt(monthChange)} kg`)

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      system: `你是「瘦身減肥競技場」的首頁智慧問候 AI。每次用戶打開 App，生成個人化歡迎語。

風格：像幽默又有營養學知識的好朋友，不是醫生也不是教官。
- 繁體中文，台灣口語，可用台語或流行語
- 3-5 句話，有溫度
- 用「${timeGreeting}」開頭打招呼
- **如果有體重數據，必須引用至少一個實際數字比較**（比上次/比上週/比上月）
- 體重下降：開心鼓勵
- 體重上升：幽默帶過，不批評
- 有連續打卡：誇獎堅持
- 結尾給一個實用的營養學或減脂小知識
- 不要太正式，要像朋友聊天`,
      prompt: `用戶：${userName}（${gender === 'male' ? '男' : '女'}）
今天：星期${dayOfWeek}
${latestWeight ? `最新體重：${latestWeight} kg` : '尚未打卡'}
${compLines.length ? compLines.join('\n') : ''}
${bodyFat ? `最新體脂：${bodyFat}%` : ''}
${targetWeight && latestWeight ? `距離目標 ${targetWeight} kg：還差 ${(latestWeight - targetWeight).toFixed(1)} kg` : ''}
${streak ? `連續打卡：${streak} 天` : '今天還沒打卡'}

請生成今日歡迎語。${compLines.length ? '**必須提到至少一個實際數字比較。**' : ''}`,
    })

    return NextResponse.json({ message: text })
  } catch {
    return NextResponse.json({ message: '' })
  }
}
