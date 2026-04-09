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

  // Sync each participant's current_value with their latest health record (batch)
  if (allParticipants && allParticipants.length > 0) {
    const userIds = [...new Set(allParticipants.map(p => p.user_id))]

    // Fetch all latest weights in parallel
    const weightResults = await Promise.all(
      userIds.map(uid =>
        supabase
          .from('fa_health_records')
          .select('user_id, weight')
          .eq('user_id', uid)
          .order('date', { ascending: false })
          .limit(1)
          .single()
          .then(res => res.data)
      )
    )

    // Build a map and batch update
    const weightMap = new Map<string, number>()
    for (const rec of weightResults) {
      if (rec?.weight != null) weightMap.set(rec.user_id, rec.weight)
    }

    // Update DB in parallel — errors are non-fatal, page still renders with in-memory values
    await Promise.all(
      Array.from(weightMap.entries()).map(([uid, weight]) =>
        supabase
          .from('fa_challenge_participants')
          .update({ current_value: weight })
          .eq('user_id', uid)
          .in('challenge_id', challengeIds)
          .then(({ error }) => { if (error) console.error('[Challenge] Weight sync failed:', uid, error) })
      )
    )

    // Update in-memory
    for (const p of allParticipants) {
      const w = weightMap.get(p.user_id)
      if (w != null) p.current_value = w
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
