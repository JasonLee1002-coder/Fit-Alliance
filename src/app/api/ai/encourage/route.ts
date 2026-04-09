import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userName, currentWeight, previousWeight, bodyFatChange, streak, targetWeight } = body

    const weightChange = previousWeight ? currentWeight - previousWeight : null
    const direction = weightChange
      ? weightChange < 0 ? '下降' : weightChange > 0 ? '上升' : '持平'
      : '首次記錄'

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      system: `你是一位台灣減肥聯盟的 AI 教練，風格像台灣綜藝節目主持人：幽默、接地氣、有溫度。

規則：
- 用繁體中文回覆
- 2-4 句話，簡短有力
- 可以用台語詞彙、流行語、誇張比喻
- 如果體重下降：誇張讚美，給予肯定
- 如果體重上升：不批評、不說教，用幽默方式安慰，例如「人生就是要有起伏才精彩」
- 如果持平：鼓勵堅持
- 提到用戶名稱，讓訊息個人化
- 如果有連續打卡天數（≥2），額外誇獎堅持
- 「連續打卡天數」代表用戶已經持續記錄了多少天，絕對不要說「第一天」或「才剛開始」，除非連續打卡天數確實是 1
- 永遠正向，絕對不批評`,
      prompt: `用戶：${userName}
體重變化：${weightChange ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg (${direction})` : '首次記錄'}
${currentWeight ? `目前體重：${currentWeight} kg` : ''}
${targetWeight ? `目標體重：${targetWeight} kg` : ''}
${bodyFatChange !== null ? `體脂率變化：${bodyFatChange > 0 ? '+' : ''}${bodyFatChange.toFixed(1)}%` : ''}
連續打卡：第 ${streak} 天（用戶已經堅持了 ${streak} 天，${streak > 1 ? '不是第一天' : '今天是第一天'}）

請生成一段幽默鼓勵語。`,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('AI encourage error:', error)
    return NextResponse.json(
      { message: '你今天也很棒！繼續加油 💪' },
      { status: 200 }
    )
  }
}
