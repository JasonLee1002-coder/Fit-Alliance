import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/sidebar'
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

  if (!profile?.profile_completed) {
    redirect('/profile-setup')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar user={profile as User} />
      <main className="lg:pl-64">
        <div className="max-w-4xl mx-auto p-4 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
