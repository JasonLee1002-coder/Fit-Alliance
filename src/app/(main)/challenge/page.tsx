import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChallengeHub from '@/components/challenge/challenge-hub'

export const dynamic = 'force-dynamic'

export default async function ChallengePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <ChallengeHub />
}
