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

  // Sync each participant's current_value with their latest health record
  if (allParticipants && allParticipants.length > 0) {
    const userIds = [...new Set(allParticipants.map(p => p.user_id))]
    for (const uid of userIds) {
      const { data: latestRecord } = await supabase
        .from('fa_health_records')
        .select('weight')
        .eq('user_id', uid)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (latestRecord?.weight != null) {
        // Update in DB
        await supabase
          .from('fa_challenge_participants')
          .update({ current_value: latestRecord.weight })
          .eq('user_id', uid)
          .in('challenge_id', challengeIds)

        // Update in-memory for immediate display
        for (const p of allParticipants) {
          if (p.user_id === uid) {
            p.current_value = latestRecord.weight
          }
        }
      }
    }
  }

  return (
    <ChallengeHub
      userId={user.id}
      userName={profile?.name || ''}
      challenges={challenges ?? []}
      allParticipants={allParticipants ?? []}
    />
  )
}
