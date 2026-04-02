import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MealTracker from '@/components/meals/meal-tracker'

export const dynamic = 'force-dynamic'

export default async function MealsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: todayMeals } = await supabase
    .from('fa_meal_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('created_at', { ascending: true })

  const { data: recentMeals } = await supabase
    .from('fa_meal_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(20)

  return (
    <MealTracker
      userId={user.id}
      todayMeals={todayMeals ?? []}
      recentMeals={recentMeals ?? []}
    />
  )
}
