export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  gender: 'male' | 'female' | null
  birthday: string | null
  height_cm: number | null
  target_weight: number | null
  target_date: string | null
  current_phase: string | null
  profile_completed: boolean
  role: 'admin' | 'user'
  created_at: string
}

export interface HealthRecord {
  id: string
  user_id: string
  date: string
  weight: number | null
  body_fat: number | null
  muscle_mass: number | null
  visceral_fat: number | null
  bone_mass: number | null
  bmr: number | null
  bmi: number | null
  screenshot_url: string | null
  ai_ocr_result: Record<string, number> | null
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  date: string
  water_ml: number | null
  bowel_count: number | null
  exercise_note: string | null
  mood: number | null
  notes: string | null
  created_at: string
}

export interface MealRecord {
  id: string
  user_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  photo_url: string | null
  photo_urls: string[] | null
  ai_recognized_items: FoodItem[] | null
  user_corrected_items: FoodItem[] | null
  ai_feedback: string | null
  created_at: string
}

export interface FoodItem {
  name: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  sodium: number | null
  confidence: number | null
  portion: string | null
  healthTip: string | null
}

export interface CoachConversation {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CoachMessage {
  id: string
  conversation_id: string
  role: 'coach' | 'user' | 'system'
  content: string
  message_type: 'text' | 'image' | 'nudge'
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Challenge {
  id: string
  name: string
  creator_id: string
  start_date: string
  end_date: string
  prize_description: string | null
  status: 'upcoming' | 'active' | 'ended'
  invite_token: string
  created_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  target_type: 'reduce_percent' | 'reduce_absolute'
  target_value: number
  start_value: number | null
  current_value: number | null
  personal_goal: string | null
  joined_at: string
  // Joined fields
  user?: Pick<User, 'id' | 'name' | 'avatar_url'>
}

export interface GroupMessage {
  id: string
  challenge_id: string
  user_id: string | null
  content: string
  is_ai: boolean
  sender_name: string
  sender_avatar: string | null
  like_count: number
  created_at: string
  // Client-side
  liked_by_me?: boolean
}

export interface MemberRelationship {
  id: string
  from_user_id: string
  to_user_id: string
  label: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'coach_nudge' | 'milestone' | 'challenge_update' | 'report_reply'
  title: string
  body: string
  read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface DevReport {
  id: string
  user_id: string
  type: 'bug' | 'ux' | 'display' | 'feature' | 'other'
  description: string
  screenshot_urls: string[] | null
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  user?: Pick<User, 'id' | 'name' | 'avatar_url'>
}

export interface DevReportReply {
  id: string
  report_id: string
  user_id: string
  content: string
  is_admin: boolean
  created_at: string
}

// Progress calculation helpers
export function calculateProgress(participant: ChallengeParticipant): number {
  if (!participant.start_value || !participant.current_value) return 0
  const change = participant.start_value - participant.current_value

  if (participant.target_type === 'reduce_percent') {
    const percentReduced = (change / participant.start_value) * 100
    return Math.min(100, Math.max(0, (percentReduced / participant.target_value) * 100))
  }

  // reduce_absolute
  return Math.min(100, Math.max(0, (change / participant.target_value) * 100))
}
