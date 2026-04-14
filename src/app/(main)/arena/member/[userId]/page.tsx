import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordsView from '@/components/dashboard/records-view'
import type { HealthRecord } from '@/types'
import BackToArenaButton from '@/components/arena/back-to-arena-button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function MemberRecordsPage({ params }: Props) {
  const { userId } = await params

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceSupabase = await createServiceRoleSupabase()

  const isMe = user.id === userId

  const [{ data: profile }, { data: records }] = await Promise.all([
    serviceSupabase.from('fa_users').select('id, name, avatar_url, target_weight').eq('id', userId).maybeSingle(),
    serviceSupabase.from('fa_health_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100),
  ])

  let displayName = profile?.name ?? null
  if (!displayName && !isMe) {
    const { data: rel } = await serviceSupabase
      .from('fa_member_relationships')
      .select('label')
      .eq('from_user_id', user.id)
      .eq('to_user_id', userId)
      .maybeSingle()
    displayName = rel?.label ?? '隊友'
  }

  return (
    <div className="space-y-4">
      {/* 立體回競技場按鈕 */}
      <BackToArenaButton />

      {/* Member card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center border-2 border-amber-300 shadow-sm flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-amber-700 text-xl font-bold">{(displayName || '?').charAt(0)}</span>
          )}
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900">
            {isMe ? '我的健康紀錄' : `${displayName} 的健康紀錄`}
          </h1>
          <p className="text-xs text-amber-600">
            {isMe ? '點擊回競技場查看排名 ⚔️' : '競技夥伴 · 共同挑戰中 ⚔️'}
          </p>
        </div>
      </div>

      {(records ?? []).length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">⚖️</div>
          <p className="text-gray-500 text-sm">{displayName} 還沒有健康紀錄</p>
        </div>
      ) : (
        <RecordsView records={(records ?? []) as HealthRecord[]} readOnly />
      )}
    </div>
  )
}
