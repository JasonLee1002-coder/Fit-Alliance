import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // 取得當前登入用戶
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ participants: [] })

    const supabase = await createServiceRoleSupabase()

    // 1. 找到這個用戶參與的所有群組 ID
    const [{ data: createdGroups }, { data: joinedGroups }] = await Promise.all([
      supabase.from('fa_groups').select('id').eq('creator_id', user.id),
      supabase.from('fa_group_members').select('group_id').eq('user_id', user.id),
    ])
    const groupIds = Array.from(new Set([
      ...(createdGroups ?? []).map(g => g.id),
      ...(joinedGroups ?? []).map(g => g.group_id),
    ]))

    // 2. 取得這些群組的所有成員 + creators
    const [{ data: members }, { data: creators }] = groupIds.length > 0
      ? await Promise.all([
          supabase.from('fa_group_members').select('user_id').in('group_id', groupIds),
          supabase.from('fa_groups').select('creator_id').in('id', groupIds),
        ])
      : [{ data: [] }, { data: [] }]

    // 3. 透過 fa_member_relationships 連結的用戶（雙向）
    const [{ data: relFrom }, { data: relTo }] = await Promise.all([
      supabase.from('fa_member_relationships').select('to_user_id, label').eq('from_user_id', user.id),
      supabase.from('fa_member_relationships').select('from_user_id, label').eq('to_user_id', user.id),
    ])

    // 建立關係標籤 map（用於沒有 fa_users 的用戶顯示名稱）
    const relationshipLabels: Record<string, string> = {}
    for (const r of relFrom ?? []) relationshipLabels[r.to_user_id] = r.label ?? ''
    for (const r of relTo ?? []) relationshipLabels[r.from_user_id] = r.label ?? ''

    // 4. legacy fa_challenge_participants 共同挑戰成員
    const { data: myChallenges } = await supabase
      .from('fa_challenge_participants')
      .select('challenge_id')
      .eq('user_id', user.id)

    const myChallengeIds = (myChallenges ?? []).map((c: any) => c.challenge_id)
    const { data: challengeParticipants } = myChallengeIds.length > 0
      ? await supabase
          .from('fa_challenge_participants')
          .select('user_id, start_value, current_value, target_type, target_value')
          .in('challenge_id', myChallengeIds)
      : { data: [] }

    // 建立挑戰進度 map（用於沒有 fa_health_records 但有挑戰資料的用戶）
    const challengeProgressMap: Record<string, { start: number; current: number; targetType: string; targetValue: number }> = {}
    for (const cp of challengeParticipants ?? []) {
      if (!challengeProgressMap[cp.user_id] && cp.start_value && cp.current_value) {
        challengeProgressMap[cp.user_id] = {
          start: cp.start_value,
          current: cp.current_value,
          targetType: cp.target_type,
          targetValue: cp.target_value,
        }
      }
    }

    const allUserIds = Array.from(new Set([
      user.id,
      ...(members ?? []).map((m: any) => m.user_id),
      ...(creators ?? []).map((c: any) => c.creator_id),
      ...(relFrom ?? []).map((r: any) => r.to_user_id),
      ...(relTo ?? []).map((r: any) => r.from_user_id),
      ...(challengeParticipants ?? []).map((m: any) => m.user_id),
    ]))

    return fetchParticipants(supabase, allUserIds, user.id, relationshipLabels, challengeProgressMap)
  } catch (err) {
    console.error('[Arena] ranking error:', err)
    return NextResponse.json({ participants: [] })
  }
}

async function fetchParticipants(
  supabase: any,
  userIds: string[],
  currentUserId: string,
  relationshipLabels: Record<string, string>,
  challengeProgressMap: Record<string, { start: number; current: number; targetType: string; targetValue: number }>,
) {
  // 取用戶資料（含 target_weight）
  const { data: users } = await supabase
    .from('fa_users')
    .select('id, name, avatar_url, target_weight')
    .in('id', userIds)

  // 建立已知用戶 map
  const userMap: Record<string, any> = {}
  for (const u of users ?? []) userMap[u.id] = u

  // 補齊沒有 fa_users 資料的用戶（用關係標籤當名稱）
  for (const uid of userIds) {
    if (!userMap[uid]) {
      userMap[uid] = {
        id: uid,
        name: relationshipLabels[uid] || '隊友',
        avatar_url: null,
        target_weight: null,
      }
    }
  }

  const allUsers = Object.values(userMap)
  if (allUsers.length === 0) {
    return NextResponse.json({ participants: [] })
  }

  // 取每人最早體重（起始點）和最新體重（來自 health records）
  const { data: allRecords } = await supabase
    .from('fa_health_records')
    .select('user_id, weight, date')
    .in('user_id', userIds)
    .not('weight', 'is', null)
    .order('date', { ascending: true })

  const firstWeight: Record<string, number> = {}
  const latestWeight: Record<string, number> = {}

  for (const r of allRecords ?? []) {
    if (!r.user_id || !r.weight) continue
    if (!firstWeight[r.user_id]) firstWeight[r.user_id] = r.weight
    latestWeight[r.user_id] = r.weight
  }

  // 計算每人進度 %
  const participants = allUsers.map((u: any) => {
    let progress = 0

    if (firstWeight[u.id] && latestWeight[u.id]) {
      // 優先使用 health records 計算進度
      const start = firstWeight[u.id]
      const current = latestWeight[u.id]
      const target = u.target_weight
      if (target && start > target) {
        const reduced = start - current
        const needed = start - target
        progress = Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
      }
    } else if (challengeProgressMap[u.id]) {
      // 沒有 health records，使用挑戰打卡資料
      const cp = challengeProgressMap[u.id]
      if (cp.targetType === 'reduce_percent') {
        const targetWeight = cp.start * (1 - cp.targetValue / 100)
        if (cp.start > targetWeight) {
          const reduced = cp.start - cp.current
          const needed = cp.start - targetWeight
          progress = Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
        }
      } else {
        // reduce_absolute
        const targetWeight = cp.start - cp.targetValue
        if (cp.start > targetWeight) {
          const reduced = cp.start - cp.current
          const needed = cp.targetValue
          progress = Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
        }
      }
    }

    return {
      userId: u.id,
      name: u.name,
      avatar: u.avatar_url,
      progress,
      isMe: u.id === currentUserId,
    }
  }).sort((a: any, b: any) => b.progress - a.progress)

  return NextResponse.json({ participants })
}
