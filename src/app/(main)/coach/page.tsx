import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoachChat from '@/components/coach/coach-chat'

export const dynamic = 'force-dynamic'

export default async function CoachPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('fa_users')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <CoachChat userId={user.id} userName={profile?.name || ''} />
  )
}
