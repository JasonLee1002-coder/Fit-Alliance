import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/sidebar'
import AppShell from '@/components/shared/app-shell'
import type { User } from '@/types'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('fa_users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // No fa_users row at all = unknown/blocked account; boot them back to login
  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login?error=wrong_account')
  }

  if (!profile.profile_completed) {
    redirect('/profile-setup')
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar user={profile as User} />
        <main className="lg:pl-64">
          <div className="max-w-4xl mx-auto p-4 pt-16 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </AppShell>
  )
}
