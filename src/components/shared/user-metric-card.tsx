'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HealthRecord, User } from '@/types'

type MetricKey = 'weight' | 'body_fat' | 'muscle_mass' | 'visceral_fat' | 'bone_mass' | 'bmr' | 'bmi'
type StatusType = 'good' | 'high' | 'low' | 'neutral'

interface Status {
  type: StatusType
  message: string
}

interface Props {
  metric: MetricKey
  label: string
  unit: string
  /** Hex color for accent, e.g. '#06b6d4' */
  color: string
  evaluate?: (value: number, profile: User) => Status | null
}

export default function UserMetricCard({ metric, label, unit, color, evaluate }: Props) {
  const [value, setValue] = useState<number | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const [recordRes, profileRes] = await Promise.all([
        supabase
          .from('fa_health_records')
          .select('*')
          .eq('user_id', user.id)
          .not(metric, 'is', null)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('fa_users')
          .select('*')
          .eq('id', user.id)
          .single(),
      ])

      if (recordRes.data) {
        setValue(recordRes.data[metric] as number | null)
        setDate(recordRes.data.date as string)
      }
      if (profileRes.data) {
        setProfile(profileRes.data as User)
      }
      setLoading(false)
    }
    fetchData()
  }, [metric])

  if (loading) {
    return (
      <div className="rounded-3xl border-2 border-gray-200 bg-gray-50 p-5 h-28 animate-pulse" />
    )
  }

  if (value == null) {
    return (
      <div
        className="rounded-3xl border-2 p-5 text-center"
        style={{ borderColor: `${color}40`, background: `${color}08` }}
      >
        <p className="text-sm text-gray-600 mb-2">你還沒有「{label}」的紀錄</p>
        <a
          href="/"
          className="inline-block px-4 py-2 rounded-xl text-white text-sm font-bold"
          style={{ background: color }}
        >
          去打卡 →
        </a>
      </div>
    )
  }

  const status = evaluate && profile ? evaluate(value, profile) : null

  const statusStyles: Record<StatusType, { bg: string; text: string; icon: string }> = {
    good: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅' },
    high: { bg: 'bg-red-100', text: 'text-red-700', icon: '⚠️' },
    low: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📉' },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📊' },
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 p-5 shadow-lg"
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 60%, #ffffff 100%)`,
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: color }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
            style={{ background: color }}
          >
            你的數據
          </span>
          {date && (
            <span className="text-[10px] text-gray-500 font-medium">{date}</span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-black tabular-nums" style={{ color }}>
            {value}
          </span>
          <span className="text-xl font-bold" style={{ color }}>
            {unit}
          </span>
          <span className="text-xs text-gray-500 ml-auto">{label}</span>
        </div>

        {status && (
          <div
            className={`mt-3 px-3 py-2 rounded-xl text-sm font-bold ${statusStyles[status.type].bg} ${statusStyles[status.type].text}`}
          >
            {statusStyles[status.type].icon} {status.message}
          </div>
        )}
      </div>
    </div>
  )
}
