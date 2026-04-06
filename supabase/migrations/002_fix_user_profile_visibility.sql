-- Allow challenge co-participants to view each other's basic profile (name, avatar)
-- This fixes the issue where users can only see their own avatar in the leaderboard
CREATE POLICY "Challenge members can view co-participant profiles" ON fa_users FOR SELECT
  USING (
    id IN (
      SELECT cp.user_id FROM fa_challenge_participants cp
      WHERE cp.challenge_id IN (
        SELECT challenge_id FROM fa_challenge_participants WHERE user_id = auth.uid()
      )
    )
  );
