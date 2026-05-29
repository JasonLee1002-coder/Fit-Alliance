import { streamText, generateText, convertToModelMessages } from 'ai'
import { googleAI } from '@/lib/google-ai'
import { createServiceRoleSupabase } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type } = body

    // Chat mode (streaming)
    const { messages, userId } = body
    const supabase = await createServiceRoleSupabase()

    // RAG: Fetch user context
    const [
      { data: userProfile },
      { data: recentRecords },
      { data: dailyLogs },
    ] = await Promise.all([
      supabase.from('fa_users').select('*').eq('id', userId).single(),
      supabase.from('fa_health_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
      supabase.from('fa_daily_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
    ])

    const weightTrend = recentRecords?.slice(0, 7).map(r =>
      `${r.date}: ${r.weight}kg${r.body_fat ? ` / 體脂${r.body_fat}%` : ''}`
    ).join('\n') || '暫無數據'

    const logHistory = dailyLogs?.map(l =>
      `${l.date}: 水${l.water_ml || '?'}ml, 排便${l.bowel_count || 0}次`
    ).join('\n') || '暫無生活紀錄'

    const age = userProfile?.birthday
      ? Math.floor((Date.now() - new Date(userProfile.birthday).getTime()) / 31557600000)
      : null

    const systemPrompt = `你是「瘦身減肥競技場」的 AI 減脂教練，名字叫「小聯」。

## 你的角色
像專業體重管理顧問：
- 每天關心用戶的體重變化與趨勢
- 看到數據異常會主動分析原因（水分、睡眠、運動等）
- 給出具體可執行的體重管理建議
- 鼓勵但不說教，糾正但不批評
- 風格溫暖、直接、有台灣味

## 用戶資料
- 姓名：${userProfile?.name || '用戶'}
- 性別：${userProfile?.gender === 'male' ? '男' : '女'}
- 年齡：${age || '未知'}
- 身高：${userProfile?.height_cm || '未知'} cm
- 目標體重：${userProfile?.target_weight || '未設定'} kg
- 目標日期：${userProfile?.target_date || '未設定'}

## 最近 7 天體重趨勢
${weightTrend}

## 最近生活紀錄（飲水、排便）
${logHistory}

## 回覆規則
1. 用繁體中文回覆
2. 回覆簡潔有力，不要長篇大論
3. 根據用戶的真實體重數據給建議，不要泛泛而談
4. 適時提醒飲水量和生活作息對體重的影響
5. 可以用 emoji 增加親切感，但不要過多
6. 永遠鼓勵，遇到數據不好時用幽默方式帶過`

    const result = streamText({
      model: googleAI('gemini-2.5-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Coach API error:', error)
    return Response.json({ error: '教練暫時忙碌中' }, { status: 500 })
  }
}
