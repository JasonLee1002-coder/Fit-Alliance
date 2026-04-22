import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userName,
      currentWeight,
      prevWeight,       // 上一筆
      weekAgoWeight,    // 約 7 天前
      monthAgoWeight,   // 約 30 天前
      currentBodyFat,
      prevBodyFat,
      streak,
      targetWeight,
    } = body

    const fmt = (v: number) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))

    const dayChange   = prevWeight     ? currentWeight - prevWeight     : null
    const weekChange  = weekAgoWeight  ? currentWeight - weekAgoWeight  : null
    const monthChange = monthAgoWeight ? currentWeight - monthAgoWeight : null
    const fatChange   = prevBodyFat && currentBodyFat ? currentBodyFat - prevBodyFat : null

    const lines: string[] = []
    if (dayChange   !== null) lines.push(`比上次：${fmt(dayChange)} kg`)
    if (weekChange  !== null) lines.push(`比上週：${fmt(weekChange)} kg`)
    if (monthChange !== null) lines.push(`比上月：${fmt(monthChange)} kg`)
    if (fatChange   !== null) lines.push(`體脂率變化：${fmt(fatChange)}%`)
    if (targetWeight)         lines.push(`距離目標 ${targetWeight} kg：還差 ${(currentWeight - targetWeight).toFixed(1)} kg`)

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      system: `你是台灣減肥聯盟的 AI 教練，風格幽默接地氣、有溫度，像台灣綜藝節目主持人。

規則：
- 繁體中文，台灣口語，可用台語詞彙或流行語
- 3-5 句話，不要太長
- **必須引用下面的實際數字來說話**，例如「比昨天少了 0.3 公斤」「這個月累積掉了 1.5 公斤」
- 體重下降：誇張讚美
- 體重上升：不批評，幽默安慰
- 持平：鼓勵堅持
- 有連續打卡天數（≥2）：額外誇獎
- 結尾給一個簡短的今日健康小提醒（飲食、水分、睡眠等）
- 永遠正向`,
      prompt: `用戶：${userName}
目前體重：${currentWeight} kg
${lines.join('\n')}
連續打卡：第 ${streak} 天${streak > 1 ? '（不是第一天，用戶已經堅持了！）' : ''}

請生成一段幽默鼓勵語，**必須提到至少一個實際數字比較**（比上次/比上週/比上月其中之一）。`,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('AI encourage error:', error)
    return NextResponse.json({ message: '你今天也很棒！繼續加油 💪' }, { status: 200 })
  }
}
