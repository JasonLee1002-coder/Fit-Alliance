import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChallengeHub from '@/components/challenge/challenge-hub'

export const dynamic = 'force-dynamic'

export default async function ChallengePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('fa_users')
    .select('id, name, avatar_url')
    .eq('id', user.id)
    .single()

  // Get challenges user participates in
  const { data: participations } = await supabase
    .from('fa_challenge_participants')
    .select('challenge_id')
    .eq('user_id', user.id)

  const challengeIds = participations?.map(p => p.challenge_id) ?? []

  const { data: challenges } = challengeIds.length > 0
    ? await supabase
        .from('fa_challenges')
        .select('*')
        .in('id', challengeIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Get all participants for these challenges
  const { data: allParticipants } = challengeIds.length > 0
    ? await supabase
        .from('fa_challenge_participants')
        .select('*, user:fa_users(id, name, avatar_url)')
        .in('challenge_id', challengeIds)
    : { data: [] }

  return (
    <ChallengeHub
      userId={user.id}
      userName={profile?.name || ''}
      challenges={challenges ?? []}
      allParticipants={allParticipants ?? []}
    />
  )
}
