import { streamText, generateText, convertToModelMessages } from 'ai'
import { createServiceRoleSupabase } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type } = body

    // Meal feedback (non-streaming)
    if (type === 'meal_feedback') {
      const { mealType, items } = body
      const mealLabels: Record<string, string> = {
        breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '點心'
      }

      const { text } = await generateText({
        model: 'google/gemini-2.5-flash',
        system: `你是一位專業的減脂教練，風格溫暖親切但專業。
用繁體中文回覆，一段話 2-3 句。
根據食物項目分析這餐的營養搭配，指出問題並給具體建議。
像 LINE 群裡的教練一樣，直接、有溫度、不說教。
例如：「蛋白質偏低喔，可以加顆蛋補一下」、「炸物+地瓜是糖油混合物，會直接抵銷」`,
        prompt: `這是用戶的${mealLabels[mealType] || '一餐'}：
${items.map((i: { name: string; calories?: number; protein?: number; carbs?: number; fat?: number }) =>
  `- ${i.name}${i.calories ? ` (${i.calories}kcal, 蛋白${i.protein}g, 碳水${i.carbs}g, 脂肪${i.fat}g)` : ''}`
).join('\n')}

請分析這餐的營養搭配並給予簡短建議。`,
      })

      return Response.json({ message: text })
    }

    // Chat mode (streaming)
    const { messages, userId } = body
    const supabase = await createServiceRoleSupabase()

    // RAG: Fetch user context
    const [
      { data: userProfile },
      { data: recentRecords },
      { data: recentMeals },
      { data: dailyLogs },
    ] = await Promise.all([
      supabase.from('fa_users').select('*').eq('id', userId).single(),
      supabase.from('fa_health_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
      supabase.from('fa_meal_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14),
      supabase.from('fa_daily_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
    ])

    const weightTrend = recentRecords?.slice(0, 7).map(r =>
      `${r.date}: ${r.weight}kg${r.body_fat ? ` / 體脂${r.body_fat}%` : ''}`
    ).join('\n') || '暫無數據'

    const mealHistory = recentMeals?.slice(0, 7).map(m => {
      const items = (m.user_corrected_items || m.ai_recognized_items || []) as Array<{ name: string }>
      return `${m.date} ${m.meal_type}: ${items.map(i => i.name).join(', ')}`
    }).join('\n') || '暫無飲食紀錄'

    const logHistory = dailyLogs?.map(l =>
      `${l.date}: 水${l.water_ml || '?'}ml, 排便${l.bowel_count || 0}次`
    ).join('\n') || '暫無生活紀錄'

    const age = userProfile?.birthday
      ? Math.floor((Date.now() - new Date(userProfile.birthday).getTime()) / 31557600000)
      : null

    const systemPrompt = `你是「瘦身減肥競技場」的 AI 減脂教練，名字叫「小聯」。

## 你的角色
像 LINE 減脂顧問群的真人教練一樣：
- 每天關心用戶的飲食和體重變化
- 看到數據異常會主動分析原因（水分、鈉、碳水等）
- 給出具體可執行的建議（「今天繼續高蛋白，下午多半拳澱粉」）
- 鼓勵但不說教，糾正但不批評
- 風格溫暖、直接、有台灣味

## 用戶資料
- 姓名：${userProfile?.name || '用戶'}
- 性別：${userProfile?.gender === 'male' ? '男' : '女'}
- 年齡：${age || '未知'}
- 身高：${userProfile?.height_cm || '未知'} cm
- 目標體重：${userProfile?.target_weight || '未設定'} kg
- 目標日期：${userProfile?.target_date || '未設定'}
- 目前飲食階段：${userProfile?.current_phase || '一般減脂'}

## 最近 7 天體重趨勢
${weightTrend}

## 最近飲食紀錄
${mealHistory}

## 最近生活紀錄（飲水、排便）
${logHistory}

## 回覆規則
1. 用繁體中文回覆
2. 回覆簡潔有力，不要長篇大論
3. 根據用戶的真實數據給建議，不要泛泛而談
4. 如果用戶問飲食問題，參考他的目標和目前體重趨勢來回答
5. 適時提醒飲水量和排便狀況
6. 可以用 emoji 增加親切感，但不要過多
7. 永遠鼓勵，遇到數據不好時用幽默方式帶過`

    const result = streamText({
      model: 'google/gemini-2.5-flash',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Coach API error:', error)
    return Response.json({ error: '教練暫時忙碌中' }, { status: 500 })
  }
}
