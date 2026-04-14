# 競技場好友制 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 競技場改為「邀請好友自動成圈」模式，以個人目標達成百分比排名，不需建立挑戰。

**Architecture:** 沿用現有 `fa_groups` + `fa_group_members` 作為好友關係基礎（不需新表）。Arena API 改為查詢同一群組的所有成員，以各人 `target_weight` vs 最新體重計算進度 %。移除挑戰創建 UI，改為純好友排行榜。

**Tech Stack:** Next.js App Router, Supabase (SSR + Service Role), TypeScript, Tailwind CSS

---

## 現有資料結構說明

```
fa_groups        → id, name, creator_id, invite_token
fa_group_members → group_id, user_id, joined_at
fa_users         → id, name, avatar_url, target_weight, height_cm, ...
fa_health_records → user_id, date, weight, body_fat, ...
```

好友圈定義：
- A 創建群組 → B 透過連結加入 → A、B 互為好友（同一群組）
- B 再創建群組邀請 C → B、C 互為好友，A 看不到 C（符合需求）

進度計算：
```
start_weight = 該用戶最早的 health_record.weight
current_weight = 該用戶最新的 health_record.weight
target_weight = fa_users.target_weight
progress % = (start - current) / (start - target) * 100
上限 100%，下限 0%
```

---

## 檔案清單

| 動作 | 路徑 | 說明 |
|------|------|------|
| 修改 | `src/app/api/arena/ranking/route.ts` | 改為好友圈查詢 + 進度計算 |
| 修改 | `src/components/challenge/challenge-hub.tsx` | 移除挑戰創建，改為好友排行榜 UI |
| 修改 | `src/app/(main)/profile/page.tsx` | 加入競技場顯示開關 |
| DB Migration | Supabase Dashboard SQL | 加 `show_in_arena` 欄位 |

---

## Task 1：Supabase DB Migration

**Files:**
- SQL 在 Supabase Dashboard > SQL Editor 執行

- [ ] **Step 1: 在 Supabase Dashboard 執行以下 SQL**

```sql
-- 加入競技場顯示開關（預設開啟）
ALTER TABLE fa_users
ADD COLUMN IF NOT EXISTS show_in_arena boolean NOT NULL DEFAULT true;
```

- [ ] **Step 2: 確認欄位存在**

到 Supabase Dashboard > Table Editor > fa_users，確認看到 `show_in_arena` 欄位，預設值 true。

- [ ] **Step 3: Commit（僅記錄，SQL 不進 git）**

```bash
git commit --allow-empty -m "db: fa_users 加入 show_in_arena 欄位"
```

---

## Task 2：Arena API 改為好友圈查詢

**Files:**
- Modify: `src/app/api/arena/ranking/route.ts`

- [ ] **Step 1: 完整替換 route.ts**

```typescript
// src/app/api/arena/ranking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // 取得當前登入用戶
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ participants: [] })

    const supabase = await createServiceRoleSupabase()

    // 找到這個用戶參與的所有群組 ID（身為 creator 或 member）
    const { data: createdGroups } = await supabase
      .from('fa_groups')
      .select('id')
      .eq('creator_id', user.id)

    const { data: joinedGroups } = await supabase
      .from('fa_group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const groupIds = [
      ...(createdGroups ?? []).map(g => g.id),
      ...(joinedGroups ?? []).map(g => g.group_id),
    ]

    if (groupIds.length === 0) {
      return NextResponse.json({ participants: [] })
    }

    // 取得這些群組的所有成員（含 creator）
    const { data: members } = await supabase
      .from('fa_group_members')
      .select('user_id')
      .in('group_id', groupIds)

    // 加入 creators（他們可能不在 fa_group_members）
    const { data: creators } = await supabase
      .from('fa_groups')
      .select('creator_id')
      .in('id', groupIds)

    const allUserIds = Array.from(new Set([
      user.id, // 自己也要顯示
      ...(members ?? []).map(m => m.user_id),
      ...(creators ?? []).map(c => c.creator_id),
    ]))

    // 取得用戶資料（含 target_weight、show_in_arena）
    const { data: users } = await supabase
      .from('fa_users')
      .select('id, name, avatar_url, target_weight, show_in_arena')
      .in('id', allUserIds)
      .eq('show_in_arena', true)

    if (!users || users.length === 0) {
      return NextResponse.json({ participants: [] })
    }

    const visibleUserIds = users.map(u => u.id)

    // 取每人最早體重（起始點）
    const { data: firstRecords } = await supabase
      .from('fa_health_records')
      .select('user_id, weight, date')
      .in('user_id', visibleUserIds)
      .not('weight', 'is', null)
      .order('date', { ascending: true })

    // 取每人最新體重
    const { data: latestRecords } = await supabase
      .from('fa_health_records')
      .select('user_id, weight, date')
      .in('user_id', visibleUserIds)
      .not('weight', 'is', null)
      .order('date', { ascending: false })

    // 建立 map：userId → 最早/最新體重
    const firstWeight: Record<string, number> = {}
    const latestWeight: Record<string, number> = {}
    for (const r of firstRecords ?? []) {
      if (r.user_id && r.weight && !firstWeight[r.user_id]) {
        firstWeight[r.user_id] = r.weight
      }
    }
    for (const r of latestRecords ?? []) {
      if (r.user_id && r.weight && !latestWeight[r.user_id]) {
        latestWeight[r.user_id] = r.weight
      }
    }

    // 計算每人進度 %
    const participants = users.map(u => {
      const start = firstWeight[u.id] ?? null
      const current = latestWeight[u.id] ?? start
      const target = u.target_weight

      let progress = 0
      if (start && current !== null && target && start !== target) {
        const reduced = start - current
        const needed = start - target
        progress = needed > 0
          ? Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
          : 0
      }

      return {
        userId: u.id,
        name: u.name,
        avatar: u.avatar_url,
        currentWeight: current,
        targetWeight: target,
        progress,
        isMe: u.id === user.id,
      }
    }).sort((a, b) => b.progress - a.progress)

    return NextResponse.json({ participants })
  } catch (err) {
    console.error('[Arena] ranking error:', err)
    return NextResponse.json({ participants: [] })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/arena/ranking/route.ts
git commit -m "feat: arena API 改為好友圈查詢，以個人目標達成 % 排名"
```

---

## Task 3：競技場 UI 重設計

**Files:**
- Modify: `src/components/challenge/challenge-hub.tsx`

- [ ] **Step 1: 完整替換 challenge-hub.tsx**

```typescript
// src/components/challenge/challenge-hub.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Participant {
  userId: string
  name: string
  avatar: string | null
  progress: number
  isMe: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function ChallengeHub() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/arena/ranking')
      .then(r => r.json())
      .then(data => {
        setParticipants(data.participants ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-900">🏛️ 體重競技場</h1>
        <p className="text-gray-400 text-sm mt-1">以個人目標達成率競技，公平出發</p>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">載入中...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12 px-6">
            <span className="text-5xl">🏟️</span>
            <h2 className="text-lg font-bold text-gray-800 mt-3">還沒有競技夥伴</h2>
            <p className="text-gray-400 text-sm mt-2">邀請朋友加入，一起在競技場上比拼！</p>
            <Link
              href="/invite"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow text-sm"
            >
              📤 邀請朋友
            </Link>
          </div>
        ) : (
          <>
            {participants.map((p, i) => (
              <div
                key={p.userId}
                className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 ${p.isMe ? 'bg-emerald-50/60' : ''}`}
              >
                {/* Rank */}
                <div className="text-xl w-8 text-center shrink-0">
                  {i < 3 ? MEDALS[i] : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-600 font-bold text-sm">{(p.name || '?').charAt(0)}</span>
                  )}
                </div>

                {/* Name + Progress bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {p.name}{p.isMe ? ' (我)' : ''}
                    </span>
                    <span className="text-sm font-black text-emerald-600 ml-2 shrink-0">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Invite more */}
            <div className="px-5 py-4 text-center border-t border-gray-50">
              <Link
                href="/invite"
                className="inline-block px-5 py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-2xl text-sm hover:bg-emerald-100 transition"
              >
                📤 邀請更多朋友加入
              </Link>
            </div>
          </>
        )}
      </div>

      {/* 競技規則說明 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <p className="text-xs text-amber-700 font-medium">⚔️ 競技規則</p>
        <p className="text-xs text-amber-600 mt-1">
          排名依據「個人目標達成率」— 每個人從自己的起始體重出發，達成自己設定的目標越多，排名越高。公平競技，各憑努力！
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/challenge/challenge-hub.tsx
git commit -m "feat: 競技場 UI 改為好友排行榜，以目標達成 % 顯示，移除挑戰創建"
```

---

## Task 4：個人頁面加入競技場顯示開關

**Files:**
- Modify: `src/app/(main)/profile/page.tsx`

- [ ] **Step 1: 在 profile 頁面找到設定表單，加入 `show_in_arena` toggle**

在 profile 頁面的表單儲存區塊中加入：

```typescript
// 在 handleSave 函數中，確保 show_in_arena 包含在 update payload：
await supabase
  .from('fa_users')
  .update({
    // ... 其他欄位
    show_in_arena: showInArena,  // 新增
  })
  .eq('id', user.id)
```

在 state 初始化加入：
```typescript
const [showInArena, setShowInArena] = useState(user.show_in_arena ?? true)
```

在表單 UI 加入 toggle（放在儲存按鈕上方）：
```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
  <div>
    <p className="text-sm font-medium text-gray-800">顯示在競技場</p>
    <p className="text-xs text-gray-400 mt-0.5">關閉後朋友看不到你的排名</p>
  </div>
  <button
    type="button"
    onClick={() => setShowInArena(v => !v)}
    className={`w-12 h-6 rounded-full transition-colors relative ${showInArena ? 'bg-emerald-500' : 'bg-gray-300'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showInArena ? 'translate-x-6' : 'translate-x-0.5'}`} />
  </button>
</div>
```

- [ ] **Step 2: 更新 User 型別（types/index.ts）**

```typescript
// 在 User interface 加入：
show_in_arena?: boolean
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(main)/profile/page.tsx src/types/index.ts
git commit -m "feat: 個人設定加入競技場顯示開關"
```

---

## Task 5：邀請頁面微調

**Files:**
- Modify: `src/app/(main)/invite/page.tsx`

- [ ] **Step 1: 加入說明文字，告知朋友加入後會自動出現在競技場**

在邀請頁面分享按鈕下方加入說明：

```tsx
<p className="text-xs text-gray-400 mt-3 text-center">
  🏛️ 朋友加入後自動成為你的競技場夥伴
</p>
```

- [ ] **Step 2: Commit + Push**

```bash
git add src/app/(main)/invite/page.tsx
git commit -m "feat: 邀請頁面加入競技場說明"
git push
```

---

## 驗證清單

- [ ] 進入競技場，若無群組成員 → 顯示「還沒有競技夥伴」+ 邀請按鈕
- [ ] 邀請朋友加入群組後，競技場出現朋友排行
- [ ] 自己的排行列有「(我)」標示 + 淺綠底色
- [ ] 排名 1-3 顯示 🥇🥈🥉
- [ ] 進度條寬度對應達成 %
- [ ] profile 關閉「顯示在競技場」→ 該用戶從好友的競技場消失
- [ ] 未設定目標體重的用戶顯示 0%

---

## 不在本次範圍

- 連續打卡天數顯示（可後續加）
- 競技場內聊天功能（已移除）
- 跨群組合併（不需要，符合設計）
