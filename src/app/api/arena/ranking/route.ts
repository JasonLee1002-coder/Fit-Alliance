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

    // 找到這個用戶參與的所有群組 ID（身為 creator 或 member）
    const [{ data: createdGroups }, { data: joinedGroups }] = await Promise.all([
      supabase.from('fa_groups').select('id').eq('creator_id', user.id),
      supabase.from('fa_group_members').select('group_id').eq('user_id', user.id),
    ])

    const groupIds = Array.from(new Set([
      ...(createdGroups ?? []).map(g => g.id),
      ...(joinedGroups ?? []).map(g => g.group_id),
    ]))

    if (groupIds.length === 0) {
      // 只顯示自己
      return fetchParticipants(supabase, [user.id], user.id)
    }

    // 取得這些群組的所有成員
    const { data: members } = await supabase
      .from('fa_group_members')
      .select('user_id')
      .in('group_id', groupIds)

    // 也包含這些群組的 creators
    const { data: creators } = await supabase
      .from('fa_groups')
      .select('creator_id')
      .in('id', groupIds)

    const allUserIds = Array.from(new Set([
      user.id,
      ...(members ?? []).map(m => m.user_id),
      ...(creators ?? []).map(c => c.creator_id),
    ]))

    return fetchParticipants(supabase, allUserIds, user.id)
  } catch (err) {
    console.error('[Arena] ranking error:', err)
    return NextResponse.json({ participants: [] })
  }
}

async function fetchParticipants(supabase: any, userIds: string[], currentUserId: string) {
  // 取用戶資料（含 target_weight、show_in_arena）
  const { data: users } = await supabase
    .from('fa_users')
    .select('id, name, avatar_url, target_weight, show_in_arena')
    .in('id', userIds)
    .eq('show_in_arena', true)

  if (!users || users.length === 0) {
    return NextResponse.json({ participants: [] })
  }

  const visibleUserIds = users.map((u: any) => u.id)

  // 取每人最早體重（起始點）和最新體重
  const [{ data: allRecords }] = await Promise.all([
    supabase
      .from('fa_health_records')
      .select('user_id, weight, date')
      .in('user_id', visibleUserIds)
      .not('weight', 'is', null)
      .order('date', { ascending: true }),
  ])

  // 建立 map：userId → 最早/最新體重
  const firstWeight: Record<string, number> = {}
  const latestWeight: Record<string, number> = {}

  for (const r of allRecords ?? []) {
    if (!r.user_id || !r.weight) continue
    if (!firstWeight[r.user_id]) firstWeight[r.user_id] = r.weight
    latestWeight[r.user_id] = r.weight // 最後一筆會是最新（因為 ascending order）
  }

  // 計算每人進度 %
  const participants = users.map((u: any) => {
    const start = firstWeight[u.id] ?? null
    const current = latestWeight[u.id] ?? start
    const target = u.target_weight

    let progress = 0
    if (start && current !== null && target && start > target) {
      const reduced = start - current
      const needed = start - target
      progress = Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
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
