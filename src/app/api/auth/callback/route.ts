import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Behind Nginx proxy: use forwarded headers to build the public origin
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = request.headers.get('host') ?? 'poc.mcstation.ai'
  const origin = `${proto}://${host}`

  if (code) {
    try {
      const supabase = await createServerSupabase()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('fa_users')
            .select('profile_completed')
            .eq('id', user.id)
            .single()

          if (!profile) {
            await supabase.from('fa_users').insert({
              id: user.id,
              email: user.email ?? '',
              name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
              avatar_url: user.user_metadata?.avatar_url ?? null,
            })
            return NextResponse.redirect(`${origin}${BASE}/profile-setup`)
          }

          if (!profile.profile_completed) {
            return NextResponse.redirect(`${origin}${BASE}/profile-setup`)
          }
        }

        return NextResponse.redirect(`${origin}${BASE}${next}`)
      }

      console.error('Auth callback error:', error)
    } catch (e) {
      console.error('Auth callback exception:', e)
    }
  }

  return NextResponse.redirect(`${origin}${BASE}/login?error=auth_callback_failed`)
}
