import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has profile, if not redirect to profile setup
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('fa_users')
          .select('profile_completed')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Create initial profile
          await supabase.from('fa_users').insert({
            id: user.id,
            email: user.email ?? '',
            name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
            avatar_url: user.user_metadata?.avatar_url ?? null,
          })
          return NextResponse.redirect(`${origin}/profile-setup`)
        }

        if (!profile.profile_completed) {
          return NextResponse.redirect(`${origin}/profile-setup`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error, redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
