import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Vercel cron job — runs daily to keep Supabase free-tier project active.
// Supabase free tier pauses after 7 days of zero activity.
// This route pings it once a day so it never auto-pauses.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Lightweight query — just count active challenges, doesn't load user data
  const { error } = await supabase
    .from('fa_challenges')
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.error('[keepalive] Supabase ping failed:', error.message)
    return NextResponse.json({ ok: false, error: error.message, ts: new Date().toISOString() }, { status: 500 })
  }

  console.log('[keepalive] Supabase ping OK', new Date().toISOString())
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
