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
- **優先引用「比上週」或「比上月」的數字**，這才是真實的進步趨勢
- 體重下降：誇張讚美
- 體重上升：不批評，幽默安慰，提醒從週趨勢看才準
- 持平：鼓勵堅持
- **絕對不要說「才第一天」「只有第一天」等輕視天數的話**，每次打卡都是重要的一步
- 結尾給一個簡短的今日健康小提醒（飲食、水分、睡眠等）
- 永遠正向`,
      prompt: `用戶：${userName}
目前體重：${currentWeight} kg
${lines.join('\n')}
已連續打卡 ${streak} 天

請生成一段幽默鼓勵語，**優先提到週或月的實際數字比較**（比上週/比上月），讓用戶看到中長期的進步趨勢。`,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('AI encourage error:', error)
    return NextResponse.json({ message: '你今天也很棒！繼續加油 💪' }, { status: 200 })
  }
}
