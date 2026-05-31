'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const code = searchParams.get('code')
    if (!code) {
      router.replace('/login?error=no_code')
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.session) {
        console.error('Auth callback error:', error)
        router.replace('/login?error=auth_callback_failed')
        return
      }

      const user = data.session.user

      // First try to find by auth user ID
      let { data: profile } = await supabase
        .from('fa_users')
        .select('profile_completed')
        .eq('id', user.id)
        .single()

      // If no match by ID, check if this email already has a profile (e.g. re-auth or provider switch)
      if (!profile && user.email) {
        const { data: existing } = await supabase
          .from('fa_users')
          .select('id, profile_completed')
          .eq('email', user.email)
          .single()

        if (existing) {
          // Re-link: update the row's id to the current auth user id so future lookups work
          await supabase
            .from('fa_users')
            .update({ id: user.id })
            .eq('email', user.email)
          profile = { profile_completed: existing.profile_completed }
        }
      }

      if (!profile) {
        await supabase.from('fa_users').insert({
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
          avatar_url: user.user_metadata?.avatar_url ?? null,
        })
        router.replace('/profile-setup')
      } else if (!profile.profile_completed) {
        router.replace('/profile-setup')
      } else {
        router.replace('/')
      }
    })
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">登入中...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-orange-50">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}
