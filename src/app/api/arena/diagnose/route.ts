import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 診斷用：列出當前用戶的所有家人/朋友連結資料來源
 * 訪問方式：https://<你的網址>/api/arena/diagnose
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

    const supabase = await createServiceRoleSupabase()

    // 1. 我自己
    const { data: me } = await supabase
      .from('fa_users')
      .select('id, name, email, target_weight')
      .eq('id', user.id)
      .single()

    // 2. 我的 groups
    const [{ data: createdGroups }, { data: joinedGroups }] = await Promise.all([
      supabase.from('fa_groups').select('*').eq('creator_id', user.id),
      supabase.from('fa_group_members').select('*, fa_groups(id, name, creator_id)').eq('user_id', user.id),
    ])

    // 3. 所有 groups 的成員
    const groupIds = Array.from(new Set([
      ...(createdGroups ?? []).map((g: any) => g.id),
      ...(joinedGroups ?? []).map((g: any) => g.group_id),
    ]))
    const { data: groupMembers } = groupIds.length > 0
      ? await supabase
          .from('fa_group_members')
          .select('*, fa_users(id, name)')
          .in('group_id', groupIds)
      : { data: [] }

    // 4. 我的 member_relationships（雙向）
    const [{ data: relFrom }, { data: relTo }] = await Promise.all([
      supabase.from('fa_member_relationships').select('*, to_user:fa_users!fa_member_relationships_to_user_id_fkey(id, name)').eq('from_user_id', user.id),
      supabase.from('fa_member_relationships').select('*, from_user:fa_users!fa_member_relationships_from_user_id_fkey(id, name)').eq('to_user_id', user.id),
    ])

    // 5. 我的 challenge_participants（舊系統）
    const { data: myChallenges } = await supabase
      .from('fa_challenge_participants')
      .select('challenge_id')
      .eq('user_id', user.id)

    const challengeIds = (myChallenges ?? []).map((c: any) => c.challenge_id)
    const { data: challengeMembers } = challengeIds.length > 0
      ? await supabase
          .from('fa_challenge_participants')
          .select('*, fa_users(id, name)')
          .in('challenge_id', challengeIds)
      : { data: [] }

    // 6. 嘗試找所有可能的「家人」——名字包含「老婆」「女兒」的 users
    const { data: possibleFamily } = await supabase
      .from('fa_users')
      .select('id, name, email, target_weight')
      .or('name.ilike.%老婆%,name.ilike.%女兒%,name.ilike.%妻%,name.ilike.%daughter%')

    return NextResponse.json({
      me,
      myGroups: {
        created: createdGroups,
        joined: joinedGroups,
        allMembers: groupMembers,
      },
      memberRelationships: {
        from: relFrom,
        to: relTo,
      },
      legacyChallenges: {
        myParticipations: myChallenges,
        allMembers: challengeMembers,
      },
      possibleFamilyByName: possibleFamily,
      summary: {
        groupCount: groupIds.length,
        groupMemberCount: groupMembers?.length ?? 0,
        relationshipCount: (relFrom?.length ?? 0) + (relTo?.length ?? 0),
        legacyChallengeCount: challengeIds.length,
        legacyMemberCount: challengeMembers?.length ?? 0,
        possibleFamilyCount: possibleFamily?.length ?? 0,
      },
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'unknown' }, { status: 500 })
  }
}
