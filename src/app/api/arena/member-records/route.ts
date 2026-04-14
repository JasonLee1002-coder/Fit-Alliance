import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const targetUserId = request.nextUrl.searchParams.get('userId')
    if (!targetUserId) return NextResponse.json({ error: 'missing userId' }, { status: 400 })

    // 驗證當前用戶已登入
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

    const supabase = await createServiceRoleSupabase()

    // 取目標用戶的資料與健康紀錄
    const [{ data: profile }, { data: records }] = await Promise.all([
      supabase.from('fa_users').select('id, name, avatar_url, target_weight').eq('id', targetUserId).single(),
      supabase.from('fa_health_records').select('*').eq('user_id', targetUserId).order('date', { ascending: false }).limit(100),
    ])

    // 若 fa_users 不存在，用關係標籤補名字
    let name = profile?.name ?? null
    if (!name) {
      const { data: rel } = await supabase
        .from('fa_member_relationships')
        .select('label')
        .eq('from_user_id', user.id)
        .eq('to_user_id', targetUserId)
        .single()
      name = rel?.label ?? '隊友'
    }

    return NextResponse.json({
      profile: { ...profile, name, id: targetUserId },
      records: records ?? [],
    })
  } catch (err) {
    console.error('[Arena] member-records error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
