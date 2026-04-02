import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordsView from '@/components/dashboard/records-view'

export const dynamic = 'force-dynamic'

export default async function RecordsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: records } = await supabase
    .from('fa_health_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100)

  return <RecordsView records={records ?? []} />
}
