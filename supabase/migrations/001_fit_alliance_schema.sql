-- ============================================
-- Fit Alliance - 瘦身減肥聯盟網 Database Schema
-- Shared Supabase project with FeedBites
-- All tables prefixed with "fa_" to avoid conflicts
-- ============================================

-- 1. Users profile (extends auth.users)
CREATE TABLE IF NOT EXISTS fa_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birthday DATE,
  height_cm NUMERIC(5,1),
  target_weight NUMERIC(5,1),
  target_date DATE,
  current_phase TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Health records (daily weigh-in)
CREATE TABLE IF NOT EXISTS fa_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(5,1),
  body_fat NUMERIC(4,1),
  muscle_mass NUMERIC(5,1),
  visceral_fat NUMERIC(4,1),
  bone_mass NUMERIC(4,1),
  bmr NUMERIC(6,0),
  bmi NUMERIC(4,1),
  screenshot_url TEXT,
  ai_ocr_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_health_records_user_date ON fa_health_records(user_id, date DESC);

-- 3. Daily logs (water, bowel, exercise, mood)
CREATE TABLE IF NOT EXISTS fa_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  water_ml INTEGER,
  bowel_count INTEGER DEFAULT 0,
  exercise_note TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. Meal records (food photo + AI recognition)
CREATE TABLE IF NOT EXISTS fa_meal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  photo_url TEXT,
  ai_recognized_items JSONB,
  user_corrected_items JSONB,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_meal_records_user_date ON fa_meal_records(user_id, date DESC);

-- 5. Coach conversations
CREATE TABLE IF NOT EXISTS fa_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Coach messages
CREATE TABLE IF NOT EXISTS fa_coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES fa_coach_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'user', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'nudge')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_coach_messages_conv ON fa_coach_messages(conversation_id, created_at);

-- 7. Challenges
CREATE TABLE IF NOT EXISTS fa_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  prize_description TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  invite_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Challenge participants (personal goals)
CREATE TABLE IF NOT EXISTS fa_challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES fa_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL DEFAULT 'reduce_absolute' CHECK (target_type IN ('reduce_percent', 'reduce_absolute')),
  target_value NUMERIC(5,1) NOT NULL DEFAULT 5,
  start_value NUMERIC(5,1),
  current_value NUMERIC(5,1),
  personal_goal TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- 9. Group messages (challenge chat)
CREATE TABLE IF NOT EXISTS fa_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES fa_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES fa_users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_group_messages_challenge ON fa_group_messages(challenge_id, created_at DESC);

-- 10. Message likes
CREATE TABLE IF NOT EXISTS fa_message_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES fa_group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- 11. Member relationships (one-directional labels)
CREATE TABLE IF NOT EXISTS fa_member_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  UNIQUE(from_user_id, to_user_id)
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS fa_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('coach_nudge', 'milestone', 'challenge_update', 'report_reply')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fa_notifications_user ON fa_notifications(user_id, read, created_at DESC);

-- 13. Push subscriptions (Web Push)
CREATE TABLE IF NOT EXISTS fa_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- 14. Dev reports (issue tracking)
CREATE TABLE IF NOT EXISTS fa_dev_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'ux', 'display', 'feature', 'other')),
  description TEXT NOT NULL,
  screenshot_urls JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Dev report replies
CREATE TABLE IF NOT EXISTS fa_dev_report_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES fa_dev_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Groups (invite system)
CREATE TABLE IF NOT EXISTS fa_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  invite_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fa_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES fa_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES fa_users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE fa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_member_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_dev_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_dev_report_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_group_members ENABLE ROW LEVEL SECURITY;

-- Users: own data only
CREATE POLICY "Users can view own profile" ON fa_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON fa_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON fa_users FOR INSERT WITH CHECK (auth.uid() = id);

-- Health records: own data, but challenge members can view each other
CREATE POLICY "Users manage own health records" ON fa_health_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Challenge members can view records" ON fa_health_records FOR SELECT
  USING (
    user_id IN (
      SELECT cp.user_id FROM fa_challenge_participants cp
      WHERE cp.challenge_id IN (
        SELECT challenge_id FROM fa_challenge_participants WHERE user_id = auth.uid()
      )
    )
  );

-- Daily logs: own data only
CREATE POLICY "Users manage own daily logs" ON fa_daily_logs FOR ALL USING (auth.uid() = user_id);

-- Meal records: own data, challenge members can view
CREATE POLICY "Users manage own meals" ON fa_meal_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Challenge members can view meals" ON fa_meal_records FOR SELECT
  USING (
    user_id IN (
      SELECT cp.user_id FROM fa_challenge_participants cp
      WHERE cp.challenge_id IN (
        SELECT challenge_id FROM fa_challenge_participants WHERE user_id = auth.uid()
      )
    )
  );

-- Coach conversations & messages: own only
CREATE POLICY "Users manage own coach conversations" ON fa_coach_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own coach messages" ON fa_coach_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM fa_coach_conversations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users insert own coach messages" ON fa_coach_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM fa_coach_conversations WHERE user_id = auth.uid()
    )
  );

-- Challenges: anyone can view active, participants can manage
CREATE POLICY "Anyone can view challenges" ON fa_challenges FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON fa_challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update challenge" ON fa_challenges FOR UPDATE USING (auth.uid() = creator_id);

-- Challenge participants
CREATE POLICY "Anyone can view participants" ON fa_challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON fa_challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON fa_challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Group messages: visible to challenge participants
CREATE POLICY "Participants can view group messages" ON fa_group_messages FOR SELECT
  USING (
    challenge_id IN (
      SELECT challenge_id FROM fa_challenge_participants WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Participants can send messages" ON fa_group_messages FOR INSERT
  WITH CHECK (
    challenge_id IN (
      SELECT challenge_id FROM fa_challenge_participants WHERE user_id = auth.uid()
    ) OR is_ai = true
  );

-- Message likes
CREATE POLICY "Users can manage own likes" ON fa_message_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view likes" ON fa_message_likes FOR SELECT USING (true);

-- Relationships: own only
CREATE POLICY "Users manage own relationships" ON fa_member_relationships FOR ALL USING (auth.uid() = from_user_id);

-- Notifications: own only
CREATE POLICY "Users view own notifications" ON fa_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON fa_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Push subscriptions: own only
CREATE POLICY "Users manage own push subs" ON fa_push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Dev reports: users see own, admins see all
CREATE POLICY "Users manage own reports" ON fa_dev_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all reports" ON fa_dev_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM fa_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Report replies: visible to report owner and admins
CREATE POLICY "Report owner and admins view replies" ON fa_dev_report_replies FOR SELECT
  USING (
    report_id IN (SELECT id FROM fa_dev_reports WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM fa_users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Users and admins can reply" ON fa_dev_report_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Groups
CREATE POLICY "Members can view group" ON fa_groups FOR SELECT
  USING (
    id IN (SELECT group_id FROM fa_group_members WHERE user_id = auth.uid())
    OR creator_id = auth.uid()
  );
CREATE POLICY "Users can create groups" ON fa_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Members can view group members" ON fa_group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM fa_group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can join groups" ON fa_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role bypass for AI operations (notifications, coach nudges)
-- The service_role key bypasses RLS automatically
