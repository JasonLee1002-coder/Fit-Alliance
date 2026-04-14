import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DailyCheckIn from '@/components/dashboard/daily-checkin'
import type { User, HealthRecord } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createServerSupabase()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: profile }, { data: records }] = await Promise.all([
    supabase.from('fa_users').select('*').eq('id', authUser.id).single(),
    supabase.from('fa_health_records').select('*').eq('user_id', authUser.id).order('date', { ascending: false }).limit(30),
  ])

  const todayRecord = records?.find(r => r.date === today)

  // Calculate streak
  let streak = 0
  if (records && records.length > 0) {
    const sortedDates = [...new Set(records.map(r => r.date))].sort().reverse()
    const checkDate = new Date(today)
    for (const dateStr of sortedDates) {
      const expected = checkDate.toISOString().split('T')[0]
      if (dateStr === expected) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr < expected) {
        break
      }
    }
  }

  return (
    <DailyCheckIn
      user={profile as User}
      records={(records ?? []) as HealthRecord[]}
      todayRecord={todayRecord as HealthRecord | undefined}
      dailyLog={null}
      streak={streak}
    />
  )
}
