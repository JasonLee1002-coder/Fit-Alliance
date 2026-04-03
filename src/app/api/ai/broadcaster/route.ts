import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { challengeId } = await request.json()
    if (!challengeId) return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 })

    const supabase = await createServiceRoleSupabase()

    // Get challenge info
    const { data: challenge } = await supabase
      .from('fa_challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })

    // Get participants with user info
    const { data: participants } = await supabase
      .from('fa_challenge_participants')
      .select('*, user:fa_users(id, name, avatar_url)')
      .eq('challenge_id', challengeId)

    if (!participants?.length) return NextResponse.json({ error: 'No participants' }, { status: 400 })

    // Get recent weight records for each participant
    const participantData = await Promise.all(participants.map(async (p) => {
      const { data: records } = await supabase
        .from('fa_health_records')
        .select('date, weight, body_fat')
        .eq('user_id', p.user_id)
        .order('date', { ascending: false })
        .limit(10)

      const startValue = p.start_value || 0
      const currentValue = p.current_value || startValue
      const change = startValue - currentValue
      const pct = startValue ? (change / startValue * 100 / p.target_value * 100) : 0

      return {
        name: (p.user as { name: string })?.name || 'Unknown',
        startValue,
        currentValue,
        progressPercent: Math.min(100, Math.max(0, pct)).toFixed(1),
        personalGoal: p.personal_goal || null,
        recentWeights: records?.map(r => `${r.date}: ${r.weight}kg`).join(', ') || 'no data',
      }
    }))

    // Get relationships for AI context
    const { data: rels } = await supabase
      .from('fa_member_relationships')
      .select('from_user_id, to_user_id, label')

    // Build relationship map for richer commentary
    const relMap: Record<string, string[]> = {}
    rels?.forEach(r => {
      const fromName = participantData.find((_, i) => participants[i].user_id === r.from_user_id)?.name
      const toName = participantData.find((_, i) => participants[i].user_id === r.to_user_id)?.name
      if (fromName && toName) {
        if (!relMap[fromName]) relMap[fromName] = []
        relMap[fromName].push(`${toName}是${fromName}的${r.label}`)
      }
    })
    const relationshipContext = Object.values(relMap).flat().join('、') || '尚未設定關係'

    const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000))

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash',
      system: `你是「瘦身減肥聯盟」的 AI 播報員 🎙️，負責報導挑戰賽的戰況。

風格：體育播報員 + 台灣綜藝節目主持人混合。
- 有點誇張、有點幽默、非常有溫度
- 點名每個人的進度
- 如果有人設定了個人目標（personalGoal），融入播報中
- 可以開玩笑但不傷人
- 用繁體中文
- 3-5 句話，不要太長
- 可以用 emoji 但不要過多`,
      prompt: `挑戰賽：${challenge.name}
剩餘天數：${daysLeft} 天
結束日期：${challenge.end_date}

參賽者戰況：
${participantData.map((p, i) => `${i + 1}. ${p.name}：進度 ${p.progressPercent}%（起始 ${p.startValue}kg → 目前 ${p.currentValue}kg）${p.personalGoal ? `，動力：「${p.personalGoal}」` : ''}`).join('\n')}

參賽者之間的關係：${relationshipContext}
（如果有關係設定，用關係稱呼他們，例如叫「老公」而不是「Jason」，讓播報更有溫度）

請生成一段精彩的賽況播報！`,
    })

    // Save broadcast message
    await supabase.from('fa_group_messages').insert({
      challenge_id: challengeId,
      user_id: null,
      content: text,
      is_ai: true,
      sender_name: '🎙️ AI 播報員',
      sender_avatar: null,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('Broadcaster error:', error)
    return NextResponse.json({ error: '播報員暫時忙碌中' }, { status: 500 })
  }
}
