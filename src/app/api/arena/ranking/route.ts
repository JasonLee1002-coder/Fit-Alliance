import { NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServiceRoleSupabase()

    // Get latest active challenge
    const { data: challenges } = await supabase
      .from('fa_challenges')
      .select('id, name')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ challenge: null, participants: [] })
    }

    const challenge = challenges[0]

    // Get participants with user info (service role bypasses RLS)
    const { data: participants } = await supabase
      .from('fa_challenge_participants')
      .select('user_id, target_type, target_value, start_value, current_value, user:fa_users(id, name, avatar_url)')
      .eq('challenge_id', challenge.id)

    if (!participants) {
      return NextResponse.json({ challenge, participants: [] })
    }

    const ranked = participants
      .map((p: any) => {
        const start = p.start_value ?? 0
        const curr = p.current_value ?? start
        const target = p.target_value ?? 1
        const reduced = start - curr
        const progress = target > 0 ? Math.min(Math.round((reduced / target) * 100), 100) : 0
        return {
          userId: p.user_id,
          name: p.user?.name ?? null,
          avatar: p.user?.avatar_url ?? null,
          progress: Math.max(0, progress),
        }
      })
      .sort((a: any, b: any) => b.progress - a.progress)

    return NextResponse.json({ challenge, participants: ranked })
  } catch (err) {
    console.error('[Arena] ranking error:', err)
    return NextResponse.json({ challenge: null, participants: [] })
  }
}
