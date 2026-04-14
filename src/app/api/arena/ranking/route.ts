import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ participants: [] })

    const supabase = await createServiceRoleSupabase()

    // 1. 群組
    const [{ data: createdGroups }, { data: joinedGroups }] = await Promise.all([
      supabase.from('fa_groups').select('id').eq('creator_id', user.id),
      supabase.from('fa_group_members').select('group_id').eq('user_id', user.id),
    ])
    const groupIds = Array.from(new Set([
      ...(createdGroups ?? []).map(g => g.id),
      ...(joinedGroups ?? []).map(g => g.group_id),
    ]))
    const [{ data: members }, { data: creators }] = groupIds.length > 0
      ? await Promise.all([
          supabase.from('fa_group_members').select('user_id').in('group_id', groupIds),
          supabase.from('fa_groups').select('creator_id').in('id', groupIds),
        ])
      : [{ data: [] }, { data: [] }]

    // 2. 關係標籤（用於沒有 fa_users 的成員）
    const [{ data: relFrom }, { data: relTo }] = await Promise.all([
      supabase.from('fa_member_relationships').select('to_user_id, label').eq('from_user_id', user.id),
      supabase.from('fa_member_relationships').select('from_user_id, label').eq('to_user_id', user.id),
    ])
    const relationshipLabels: Record<string, string> = {}
    for (const r of relFrom ?? []) relationshipLabels[r.to_user_id] = r.label ?? ''
    for (const r of relTo ?? []) relationshipLabels[r.from_user_id] = r.label ?? ''

    // 3. 挑戰成員（含挑戰起始資料作為進度計算基準）
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

    // 建立挑戰基準 map：每人的 start_value / target（挑戰當初設定，最準確）
    const challengeBaseMap: Record<string, { start: number; target: number; challengeCurrent: number }> = {}
    for (const cp of challengeParticipants ?? []) {
      if (!challengeBaseMap[cp.user_id] && cp.start_value) {
        const targetWeight = cp.target_type === 'reduce_percent'
          ? cp.start_value * (1 - cp.target_value / 100)
          : cp.start_value - cp.target_value
        challengeBaseMap[cp.user_id] = {
          start: cp.start_value,
          target: targetWeight,
          challengeCurrent: cp.current_value ?? cp.start_value,
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

    return fetchParticipants(supabase, allUserIds, user.id, relationshipLabels, challengeBaseMap)
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
  challengeBaseMap: Record<string, { start: number; target: number; challengeCurrent: number }>,
) {
  // 取用戶資料
  const { data: users } = await supabase
    .from('fa_users')
    .select('id, name, avatar_url, target_weight')
    .in('id', userIds)

  const userMap: Record<string, any> = {}
  for (const u of users ?? []) userMap[u.id] = u

  // 補齊沒有 fa_users 的成員（用關係標籤當名稱）
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

  // 取最新 health record 體重（最準確的現況）
  const { data: latestRecords } = await supabase
    .from('fa_health_records')
    .select('user_id, weight, date')
    .in('user_id', userIds)
    .not('weight', 'is', null)
    .order('date', { ascending: false })

  const latestWeightMap: Record<string, number> = {}
  for (const r of latestRecords ?? []) {
    if (!latestWeightMap[r.user_id]) latestWeightMap[r.user_id] = r.weight
  }

  const allUsers = Object.values(userMap)
  const participants = allUsers.map((u: any) => {
    let progress = 0
    const cb = challengeBaseMap[u.id]
    const currentWeight = latestWeightMap[u.id] ?? cb?.challengeCurrent ?? null

    if (cb && currentWeight !== null) {
      // 用挑戰起始體重 + 挑戰目標 + 最新實際體重 → 最準確
      const reduced = cb.start - currentWeight
      const needed = cb.start - cb.target
      if (needed > 0) {
        progress = Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
      }
    } else if (currentWeight !== null && u.target_weight) {
      // 沒有挑戰資料，用 fa_users.target_weight
      const start = currentWeight  // 只有當前體重，無從計算起始，進度無法算
      // Skip — not enough data
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
