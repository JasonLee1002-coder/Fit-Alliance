# Fit-Alliance AWS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Fit-Alliance from Vercel+Supabase to AWS EC2 (poc.mcstation.ai/fit), replacing Supabase auth with NextAuth.js and Supabase DB with EC2 shared PostgreSQL, while adding P0/P1/P2 UX features.

**Architecture:** NextAuth.js v5 (Auth.js) handles Google OAuth with JWT sessions. Drizzle ORM connects to existing `omnicore-postgres` Docker container (new `fitalliance` DB). App runs as PM2 process on port 3003 under Nginx subpath `/fit`. basePath='/fit' set in next.config.ts so all routes and assets auto-prefix correctly.

**Tech Stack:** Next.js 16, NextAuth.js v5, Drizzle ORM + pg driver, EC2 PostgreSQL (shared), PM2, GitHub Actions, Nginx (subpath proxy)

**⚠️ EC2 Safety Rules:**
- ONLY add `location /fit {}` to Nginx — do NOT edit any existing location blocks
- ONLY create `fitalliance` database in existing postgres container — do NOT touch other databases
- ONLY start a new PM2 process on port 3003 — verify port is free first
- ONLY use shared Redis with key prefix `fa:` — do NOT flush or modify other keys

---

## File Map

### New Files
- `src/lib/auth.ts` — NextAuth config (providers, callbacks, JWT)
- `src/lib/db.ts` — Drizzle + pg pool connection
- `src/drizzle/schema.ts` — All table definitions (replaces Supabase types)
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `ecosystem.config.js` — PM2 process config
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD
- `src/components/checkin/checkin-success.tsx` — Confetti + achievement animation (P1)
- `src/components/dashboard/weight-trend-chart.tsx` — Recharts trend + prediction (P1)
- `src/lib/prediction.ts` — Linear regression for weight prediction (P1)
- `src/components/arena/rank-badge.tsx` — Rank change indicator (+3/−1) (P2)

### Delete Files
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/ai/food-recognize/route.ts`
- `src/app/(main)/meals/` (entire folder)
- `src/components/meals/` (entire folder)

### Modify Files
- `next.config.ts` — add basePath, output standalone
- `src/middleware.ts` — replace Supabase with NextAuth auth()
- `src/app/(auth)/login/page.tsx` — replace supabase.auth.signInWithOAuth with signIn('google')
- `src/app/(auth)/profile-setup/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/(main)/layout.tsx` — replace Supabase with auth()
- `src/app/(main)/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/(main)/profile/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/(main)/coach/page.tsx` — replace Supabase with auth()
- `src/app/(main)/records/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/(main)/challenge/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/(main)/invite/page.tsx` — replace Supabase with auth()
- `src/app/(main)/report/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/(main)/arena/member/[userId]/page.tsx` — replace Supabase with auth()
- `src/app/join/page.tsx` — replace Supabase with auth() + Drizzle
- `src/app/api/ai/coach/route.ts` — replace Supabase with auth() + Drizzle
- `src/app/api/ai/broadcaster/route.ts` — replace Supabase with auth() + Drizzle
- `src/app/api/ai/encourage/route.ts` — replace Supabase + enhance (P1)
- `src/app/api/ai/greeting/route.ts` — replace Supabase with auth() + Drizzle
- `src/app/api/arena/diagnose/route.ts` — replace Supabase with auth() + Drizzle
- `src/app/api/arena/member-records/route.ts` — replace Supabase with auth() + Drizzle
- `src/app/api/arena/ranking/route.ts` — replace Supabase + add rank change (P2)
- `src/app/api/upload/route.ts` — replace Supabase with auth()
- `src/components/dashboard/daily-checkin.tsx` — redesign confirmation card (P0)
- `src/components/shared/user-metric-card.tsx` — replace Supabase with Drizzle
- `src/app/(main)/page.tsx` — add trend chart + checkin success animation (P1)
- `src/types/index.ts` — extend with Achievement type

---

## PHASE 1 — EC2 Infrastructure (do this on EC2 via SSM)

### Task 1: Create fitalliance Database on EC2

**Files:** EC2 only, no local code changes

- [ ] **Step 1: Connect to EC2 via SSM**

```bash
aws --profile mcs ssm start-session --target i-0edcfd5786837c7b0 --region ap-northeast-1
```

- [ ] **Step 2: Verify port 3003 is free**

```bash
ss -tlnp | grep 3003
```
Expected: no output (port free)

- [ ] **Step 3: Enter postgres container and create fitalliance DB**

```bash
docker exec -it omnicore-postgres psql -U postgres
```

Inside psql:
```sql
CREATE DATABASE fitalliance;
\c fitalliance
-- Verify connection
SELECT current_database();
-- Expected: fitalliance
\q
```

- [ ] **Step 4: Note the postgres password**

```bash
docker inspect omnicore-postgres | grep -A5 POSTGRES_PASSWORD
```
Save the password — needed for DATABASE_URL.

- [ ] **Step 5: Create .env.production on EC2**

```bash
mkdir -p /home/jason/fit-alliance
cat > /home/jason/fit-alliance/.env.production << 'EOF'
NEXTAUTH_URL=https://poc.mcstation.ai/fit
NEXTAUTH_SECRET=REPLACE_WITH_OPENSSL_OUTPUT
GOOGLE_CLIENT_ID=80548308247-REPLACE_WITH_REAL_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=REPLACE_WITH_REAL_SECRET
DATABASE_URL=postgresql://postgres:REPLACE_WITH_POSTGRES_PASSWORD@localhost:5432/fitalliance
AWS_ACCESS_KEY_ID=AKIA4M4I3DP56YHMQZK6
AWS_SECRET_ACCESS_KEY=REPLACE_WITH_SECRET
GEMINI_API_KEY=AIzaSyCwjpRH53rNAbrOn7Lt2cAn_jc4CDn5sf4
REDIS_URL=redis://localhost:6379
PORT=3003
NODE_ENV=production
EOF
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Paste output into .env.production NEXTAUTH_SECRET value.

---

### Task 2: Configure Nginx for /fit subpath

**Files:** EC2 Nginx config only

- [ ] **Step 1: Find the Nginx config file for poc.mcstation.ai**

```bash
docker exec omnicore-nginx cat /etc/nginx/conf.d/default.conf | grep -n "poc.mcstation.ai" | head -5
# OR
docker exec omnicore-nginx ls /etc/nginx/conf.d/
```

- [ ] **Step 2: View existing config to find safe insertion point**

```bash
docker exec omnicore-nginx cat /etc/nginx/conf.d/default.conf | grep -n "location" | head -20
```
Expected: see existing location blocks (e.g., `/sara`, `/dolibarr`)

- [ ] **Step 3: Add /fit location block (append to existing config, DO NOT edit existing blocks)**

```bash
# Copy config out, add block, copy back
docker cp omnicore-nginx:/etc/nginx/conf.d/default.conf /tmp/nginx-default.conf
```

Add this block to the server{} section, after the existing location blocks:
```nginx
location /fit {
    proxy_pass http://host.docker.internal:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

```bash
docker cp /tmp/nginx-default.conf omnicore-nginx:/etc/nginx/conf.d/default.conf
docker exec omnicore-nginx nginx -t
# Expected: syntax is ok / test is successful
docker exec omnicore-nginx nginx -s reload
```

---

### Task 3: Add GitHub Deploy Secret

**Files:** GitHub repo settings (UI action)

- [ ] **Step 1: Generate SSH deploy key on EC2**

```bash
ssh-keygen -t ed25519 -C "fit-alliance-deploy" -f /home/jason/.ssh/fit_alliance_deploy -N ""
cat /home/jason/.ssh/fit_alliance_deploy.pub >> /home/jason/.ssh/authorized_keys
cat /home/jason/.ssh/fit_alliance_deploy  # copy private key
```

- [ ] **Step 2: Add secrets to GitHub repo (JasonLee1002-coder/Fit-Alliance)**

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
- `EC2_SSH_KEY` = private key content from step 1
- `EC2_HOST` = `13.112.14.121`
- `EC2_USER` = `jason`

---

## PHASE 2 — Install Dependencies & Core Auth Setup

### Task 4: Install New Packages

**Files:** `package.json`

- [ ] **Step 1: Install NextAuth v5, pg driver**

```bash
cd C:\Users\JasonLee\claude_code_projects\Fit-Alliance
npm install next-auth@beta pg @types/pg
```

- [ ] **Step 2: Verify installation**

```bash
cat package.json | grep -E "next-auth|\"pg\""
```
Expected: `"next-auth": "^5.x.x"`, `"pg": "^8.x.x"`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add next-auth and pg dependencies for AWS migration"
```

---

### Task 5: Write Drizzle Schema

**Files:**
- Create: `src/drizzle/schema.ts`

- [ ] **Step 1: Create schema file**

```typescript
// src/drizzle/schema.ts
import { pgTable, uuid, text, boolean, numeric, integer, timestamp, jsonb, date } from 'drizzle-orm/pg-core'

export const faUsers = pgTable('fa_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  gender: text('gender'),
  birthday: text('birthday'),
  heightCm: numeric('height_cm'),
  targetWeight: numeric('target_weight'),
  targetDate: text('target_date'),
  currentPhase: text('current_phase'),
  profileCompleted: boolean('profile_completed').notNull().default(false),
  role: text('role').notNull().default('user'),
  showInArena: boolean('show_in_arena').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faHealthRecords = pgTable('fa_health_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  date: date('date').notNull(),
  weight: numeric('weight'),
  bodyFat: numeric('body_fat'),
  muscleMass: numeric('muscle_mass'),
  visceralFat: numeric('visceral_fat'),
  boneMass: numeric('bone_mass'),
  bmr: numeric('bmr'),
  bmi: numeric('bmi'),
  screenshotUrl: text('screenshot_url'),
  aiOcrResult: jsonb('ai_ocr_result'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faDailyLogs = pgTable('fa_daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  date: date('date').notNull(),
  waterMl: integer('water_ml'),
  bowelCount: integer('bowel_count'),
  exerciseNote: text('exercise_note'),
  mood: integer('mood'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faChallenges = pgTable('fa_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  creatorId: uuid('creator_id').notNull().references(() => faUsers.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  prizeDescription: text('prize_description'),
  status: text('status').notNull().default('upcoming'),
  inviteToken: text('invite_token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faChallengeParticipants = pgTable('fa_challenge_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id').notNull().references(() => faChallenges.id),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  targetType: text('target_type').notNull(),
  targetValue: numeric('target_value').notNull(),
  startValue: numeric('start_value'),
  currentValue: numeric('current_value'),
  personalGoal: text('personal_goal'),
  joinedAt: timestamp('joined_at').defaultNow(),
})

export const faGroups = pgTable('fa_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  creatorId: uuid('creator_id').notNull().references(() => faUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faGroupMembers = pgTable('fa_group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => faGroups.id),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  joinedAt: timestamp('joined_at').defaultNow(),
})

export const faGroupMessages = pgTable('fa_group_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id').notNull().references(() => faChallenges.id),
  userId: uuid('user_id'),
  content: text('content').notNull(),
  isAi: boolean('is_ai').notNull().default(false),
  senderName: text('sender_name').notNull(),
  senderAvatar: text('sender_avatar'),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faMemberRelationships = pgTable('fa_member_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').notNull().references(() => faUsers.id),
  toUserId: uuid('to_user_id').notNull().references(() => faUsers.id),
  label: text('label'),
})

export const faNotifications = pgTable('fa_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  read: boolean('read').notNull().default(false),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faDevReports = pgTable('fa_dev_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  type: text('type').notNull(),
  description: text('description').notNull(),
  screenshotUrls: jsonb('screenshot_urls'),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faDevReportReplies = pgTable('fa_dev_report_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => faDevReports.id),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  content: text('content').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const faCoachConversations = pgTable('fa_coach_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => faUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const faCoachMessages = pgTable('fa_coach_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => faCoachConversations.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  messageType: text('message_type').notNull().default('text'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

- [ ] **Step 2: Commit**

```bash
git add src/drizzle/schema.ts
git commit -m "feat: add Drizzle schema for all fa_* tables"
```

---

### Task 6: Write DB Connection

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create db.ts**

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/drizzle/schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

export const db = drizzle(pool, { schema })
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add Drizzle db connection for EC2 PostgreSQL"
```

---

### Task 7: Write NextAuth Config

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create auth.ts**

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { faUsers } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      // Upsert user into fa_users
      const existing = await db
        .select({ id: faUsers.id, profileCompleted: faUsers.profileCompleted })
        .from(faUsers)
        .where(eq(faUsers.email, user.email))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(faUsers).values({
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          avatarUrl: user.image ?? null,
          profileCompleted: false,
        })
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token.profileCompleted !== undefined) {
        (session.user as any).profileCompleted = token.profileCompleted
      }
      return session
    },
    async jwt({ token, user, trigger }) {
      if (user?.email || trigger === 'update') {
        const email = user?.email ?? token.email
        if (email) {
          const dbUser = await db
            .select({ id: faUsers.id, profileCompleted: faUsers.profileCompleted })
            .from(faUsers)
            .where(eq(faUsers.email, email as string))
            .limit(1)
          if (dbUser[0]) {
            token.sub = dbUser[0].id
            token.profileCompleted = dbUser[0].profileCompleted
          }
        }
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // After sign in, check profile completion
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
```

- [ ] **Step 2: Extend NextAuth session types**

Create `src/types/next-auth.d.ts`:

```typescript
// src/types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      profileCompleted?: boolean
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/types/next-auth.d.ts
git commit -m "feat: add NextAuth config with Google OAuth and Drizzle user upsert"
```

---

### Task 8: NextAuth Route Handler + next.config.ts

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create NextAuth route handler**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

- [ ] **Step 2: Update next.config.ts with basePath**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/fit',
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'transtep-rd.s3.ap-northeast-1.amazonaws.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Update middleware to use NextAuth**

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req as any
  const isLoggedIn = !!session?.user

  const protectedPaths = ['/', '/meals', '/coach', '/records', '/challenge', '/invite', '/report', '/profile', '/admin']
  const isProtected = protectedPaths.some(path =>
    nextUrl.pathname === path || nextUrl.pathname.startsWith(path + '/')
  )
  const publicPaths = ['/login', '/register', '/join', '/api']
  const isPublic = publicPaths.some(path =>
    nextUrl.pathname === path || nextUrl.pathname.startsWith(path + '/')
  )

  if (!isLoggedIn && isProtected && !isPublic) {
    const loginUrl = nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    const homeUrl = nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth next.config.ts src/middleware.ts
git commit -m "feat: add NextAuth route handler, set basePath=/fit, update middleware"
```

---

## PHASE 3 — Migrate Supabase → Drizzle (Auth Routes & Pages)

### Task 9: Update Login Page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Replace supabase.auth.signInWithOAuth with NextAuth signIn**

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import WebViewWarning, { isInAppWebView } from '@/components/shared/webview-warning'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showWebViewWarning] = useState(() => isInAppWebView())

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {showWebViewWarning && <WebViewWarning />}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-orange-200/20 blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 yuzu-slide-up">
          <div className="mb-5 yuzu-float">
            <img src="/char-coaches.png" alt="Fit Alliance" className="w-56 h-56 drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">瘦身減肥競技場</h1>
          <p className="text-gray-400 text-lg font-light">一起變瘦，一起變強</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-white/60 yuzu-pop-in">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">歡迎加入</h2>
              <p className="text-gray-400 text-sm mt-1">用 Google 帳號快速開始</p>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-700 font-semibold hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? '登入中...' : '以 Google 帳號登入'}
            </button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">登入即表示你同意我們的服務條款與隱私政策</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { img: '/char-coaches.png', label: 'AI 教練', delay: '0.1s' },
            { img: '/nav3d-challenge-sm.png', label: '聯盟挑戰', delay: '0.2s' },
            { img: '/nav3d-challenge-sm.png', label: '進度追蹤', delay: '0.3s' },
          ].map(item => (
            <div key={item.label} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/60 yuzu-health-card yuzu-slide-up" style={{ animationDelay: item.delay }}>
              <img src={item.img} alt="" className="w-10 h-10 mx-auto mb-1.5" />
              <div className="text-xs font-medium text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "feat: replace Supabase OAuth with NextAuth signIn in login page"
```

---

### Task 10: Delete Supabase Files + Migrate API Auth Pattern

**Files:**
- Delete: `src/lib/supabase/` (entire folder)
- Delete: `src/app/api/auth/callback/route.ts`
- Delete: `src/app/api/ai/food-recognize/route.ts`

- [ ] **Step 1: Delete Supabase lib folder**

```bash
rm -rf src/lib/supabase
rm src/app/api/auth/callback/route.ts
rm src/app/api/ai/food-recognize/route.ts
```

- [ ] **Step 2: Delete meals folder**

```bash
rm -rf "src/app/(main)/meals"
rm -rf src/components/meals
```

- [ ] **Step 3: Commit deletions**

```bash
git add -A
git commit -m "chore: remove Supabase lib, food-recognize API, and meals feature"
```

---

### Task 11: Migrate All API Routes to NextAuth + Drizzle

**The pattern to apply in every API route:**

Replace:
```typescript
// OLD — remove these imports
import { createServiceRoleSupabase } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// OLD — remove this auth block
const cookieStore = await cookies()
const supabaseUser = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
)
const { data: { user } } = await supabaseUser.auth.getUser()
if (!user) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

const supabase = await createServiceRoleSupabase()
```

With:
```typescript
// NEW
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import * as schema from '@/drizzle/schema'
import { eq, and, inArray, desc, isNotNull } from 'drizzle-orm'

const session = await auth()
if (!session?.user?.id) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })
const userId = session.user.id
```

Replace Supabase queries with Drizzle equivalents:
```typescript
// Supabase: supabase.from('fa_users').select('id, name').eq('id', userId).single()
// Drizzle:
const [user] = await db.select({ id: schema.faUsers.id, name: schema.faUsers.name })
  .from(schema.faUsers).where(eq(schema.faUsers.id, userId)).limit(1)

// Supabase: supabase.from('fa_health_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100)
// Drizzle:
const records = await db.select().from(schema.faHealthRecords)
  .where(eq(schema.faHealthRecords.userId, userId))
  .orderBy(desc(schema.faHealthRecords.date)).limit(100)

// Supabase: supabase.from('fa_groups').select('id').eq('creator_id', userId)
// Drizzle:
const groups = await db.select({ id: schema.faGroups.id })
  .from(schema.faGroups).where(eq(schema.faGroups.creatorId, userId))

// Supabase: supabase.from('fa_users').select('user_id').in('group_id', groupIds)
// Drizzle:
const members = await db.select({ userId: schema.faGroupMembers.userId })
  .from(schema.faGroupMembers).where(inArray(schema.faGroupMembers.groupId, groupIds))

// Supabase: supabase.from('fa_health_records').select(...).not('weight', 'is', null)
// Drizzle:
.where(and(eq(...), isNotNull(schema.faHealthRecords.weight)))

// Supabase INSERT: supabase.from('fa_users').insert({ id: userId, email, name })
// Drizzle:
await db.insert(schema.faUsers).values({ email, name, avatarUrl })

// Supabase UPDATE: supabase.from('fa_users').update({ name }).eq('id', userId)
// Drizzle:
await db.update(schema.faUsers).set({ name }).where(eq(schema.faUsers.id, userId))
```

- [ ] **Step 1: Migrate `src/app/api/arena/ranking/route.ts`**

Apply the auth pattern above. Replace all `supabase.from(...)` calls with Drizzle equivalents using `schema.faGroups`, `schema.faGroupMembers`, `schema.faMemberRelationships`, `schema.faChallengeParticipants`, `schema.faUsers`, `schema.faHealthRecords`.

Key query translations for this file:
```typescript
// groups
const createdGroups = await db.select({ id: schema.faGroups.id })
  .from(schema.faGroups).where(eq(schema.faGroups.creatorId, userId))
const joinedGroups = await db.select({ groupId: schema.faGroupMembers.groupId })
  .from(schema.faGroupMembers).where(eq(schema.faGroupMembers.userId, userId))

// members
const members = await db.select({ userId: schema.faGroupMembers.userId })
  .from(schema.faGroupMembers).where(inArray(schema.faGroupMembers.groupId, groupIds))

// relationships
const relFrom = await db.select({ toUserId: schema.faMemberRelationships.toUserId, label: schema.faMemberRelationships.label })
  .from(schema.faMemberRelationships).where(eq(schema.faMemberRelationships.fromUserId, userId))

// challenge participants
const myChallenges = await db.select({ challengeId: schema.faChallengeParticipants.challengeId })
  .from(schema.faChallengeParticipants).where(eq(schema.faChallengeParticipants.userId, userId))

// health records (latest weight per user)
const latestRecords = await db.select({
  userId: schema.faHealthRecords.userId,
  weight: schema.faHealthRecords.weight,
  date: schema.faHealthRecords.date,
})
  .from(schema.faHealthRecords)
  .where(and(
    inArray(schema.faHealthRecords.userId, allUserIds),
    isNotNull(schema.faHealthRecords.weight)
  ))
  .orderBy(desc(schema.faHealthRecords.date))
```

- [ ] **Step 2: Migrate `src/app/api/arena/member-records/route.ts`**

```typescript
// Get profile
const [profile] = await db.select({
  id: schema.faUsers.id, name: schema.faUsers.name,
  avatarUrl: schema.faUsers.avatarUrl, targetWeight: schema.faUsers.targetWeight
}).from(schema.faUsers).where(eq(schema.faUsers.id, targetUserId)).limit(1)

// Get records
const records = await db.select().from(schema.faHealthRecords)
  .where(eq(schema.faHealthRecords.userId, targetUserId))
  .orderBy(desc(schema.faHealthRecords.date)).limit(100)

// Fallback name from relationship
const [rel] = await db.select({ label: schema.faMemberRelationships.label })
  .from(schema.faMemberRelationships)
  .where(and(
    eq(schema.faMemberRelationships.fromUserId, userId),
    eq(schema.faMemberRelationships.toUserId, targetUserId)
  )).limit(1)
```

- [ ] **Step 3: Migrate `src/app/api/arena/diagnose/route.ts`**

Apply the same pattern — replace all supabase queries with Drizzle equivalents.

- [ ] **Step 4: Migrate `src/app/api/upload/route.ts`**

Only auth check needs changing (S3 logic stays):
```typescript
const session = await auth()
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const userId = session.user.id
```

- [ ] **Step 5: Migrate AI routes**

For `src/app/api/ai/coach/route.ts`, `broadcaster/route.ts`, `encourage/route.ts`, `greeting/route.ts`:
- Replace auth check with `auth()` pattern
- Replace user data fetches with Drizzle queries

- [ ] **Step 6: Commit all API route migrations**

```bash
git add src/app/api/
git commit -m "feat: migrate all API routes from Supabase to NextAuth+Drizzle"
```

---

### Task 12: Migrate Pages & Layout

**Files:** All `src/app/(main)/` pages and layout

- [ ] **Step 1: Update `src/app/(main)/layout.tsx`**

Replace Supabase auth with NextAuth:
```typescript
// src/app/(main)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  // profile completion check
  if (!(session.user as any).profileCompleted) redirect('/profile-setup')
  return <>{children}</>
}
```

- [ ] **Step 2: Update each main page**

Pattern for each page that fetches user data:
```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import * as schema from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

const session = await auth()
const userId = session!.user!.id!
const [user] = await db.select().from(schema.faUsers)
  .where(eq(schema.faUsers.id, userId)).limit(1)
```

Apply to: `page.tsx`, `profile/page.tsx`, `records/page.tsx`, `challenge/page.tsx`, `invite/page.tsx`, `report/page.tsx`, `arena/member/[userId]/page.tsx`, `coach/page.tsx`

- [ ] **Step 3: Update profile-setup page**

```typescript
// src/app/(auth)/profile-setup/page.tsx
// Replace supabase.auth.getUser() with auth()
// Replace supabase.from('fa_users').update() with:
await db.update(schema.faUsers)
  .set({ gender, birthday, heightCm: height, profileCompleted: true })
  .where(eq(schema.faUsers.id, userId))
```

- [ ] **Step 4: Update join page**

```typescript
// src/app/join/page.tsx
// Replace supabase with auth() + Drizzle for challenge lookup by invite_token
const [challenge] = await db.select().from(schema.faChallenges)
  .where(eq(schema.faChallenges.inviteToken, token)).limit(1)
```

- [ ] **Step 5: Update shared components**

For `src/components/shared/user-metric-card.tsx` and `src/components/dashboard/daily-checkin.tsx`:
- Replace `createClient()` (browser Supabase) with fetch calls to the API routes (server-side data should come via props or API)

- [ ] **Step 6: Commit all page migrations**

```bash
git add src/app/ src/components/
git commit -m "feat: migrate all pages and components from Supabase to NextAuth+Drizzle"
```

---

### Task 13: Initialize DB Schema on EC2

**Files:** EC2 only (run SQL on fitalliance DB)

- [ ] **Step 1: Generate CREATE TABLE SQL from Drizzle schema**

```bash
# On local machine
npx drizzle-kit generate --dialect postgresql --schema src/drizzle/schema.ts --out /tmp/migrations
```

- [ ] **Step 2: Upload migration SQL to EC2**

```bash
aws --profile mcs s3 cp /tmp/migrations/0000_*.sql s3://transtep-rd/deploy/fitalliance-init.sql --region ap-northeast-1
```

- [ ] **Step 3: Run migration on EC2 via SSM**

```bash
PRESIGNED=$(aws --profile mcs s3 presign s3://transtep-rd/deploy/fitalliance-init.sql --expires-in 600 --region ap-northeast-1)
aws --profile mcs ssm send-command \
  --instance-ids i-0edcfd5786837c7b0 --region ap-northeast-1 \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"curl -fsSL -o /tmp/fitalliance-init.sql '${PRESIGNED}' && docker exec -i omnicore-postgres psql -U postgres -d fitalliance < /tmp/fitalliance-init.sql\"]" \
  --query 'Command.CommandId' --output text
```

- [ ] **Step 4: Verify tables exist**

```bash
aws --profile mcs ssm send-command \
  --instance-ids i-0edcfd5786837c7b0 --region ap-northeast-1 \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"docker exec omnicore-postgres psql -U postgres -d fitalliance -c '\\\\dt'\"]" \
  --query 'Command.CommandId' --output text
```

Expected: list of fa_* tables

---

## PHASE 4 — Deployment Setup

### Task 14: PM2 Config + GitHub Actions

**Files:**
- Create: `ecosystem.config.js`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create PM2 config**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fit-alliance',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/jason/fit-alliance',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3003,
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
  }]
}
```

- [ ] **Step 2: Create GitHub Actions workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to EC2

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/jason/fit-alliance
            git pull origin master
            npm ci --production=false
            npm run build
            cp /home/jason/fit-alliance/.env.production .env.production
            pm2 restart fit-alliance || pm2 start ecosystem.config.js --env production
            pm2 save
```

- [ ] **Step 3: Initial deploy to EC2 (first time)**

```bash
# On EC2 via SSM
cd /home/jason
git clone git@github.com:JasonLee1002-coder/Fit-Alliance.git fit-alliance
cd fit-alliance
npm ci
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 list
```
Expected: `fit-alliance` process running, status online

- [ ] **Step 4: Commit**

```bash
git add ecosystem.config.js .github/workflows/deploy.yml
git commit -m "chore: add PM2 config and GitHub Actions deploy workflow"
```

---

### Task 15: Add Google OAuth Redirect URI

**Action:** Google Cloud Console (browser action)

- [ ] **Step 1: Add redirect URI**

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Find OAuth 2.0 Client → Add authorized redirect URI:

```
https://poc.mcstation.ai/fit/api/auth/callback/google
```

- [ ] **Step 2: Verify login flow works**

Open browser → `https://poc.mcstation.ai/fit/login` → click Google login → verify redirect to `/fit/` after auth

---

## PHASE 5 — P0: UI Cleanup

### Task 16: Redesign Check-in Confirmation Card

**Files:**
- Modify: `src/components/dashboard/daily-checkin.tsx`

Read the current file first, then replace the "expanded metrics inputs" section.

The key change: after AI OCR completes, instead of showing individual `<input>` fields for each metric, show a read-only summary card.

- [ ] **Step 1: Read current daily-checkin.tsx**

```bash
cat src/components/dashboard/daily-checkin.tsx
```

- [ ] **Step 2: Identify the state where AI OCR result is shown (after screenshot upload)**

Find where `ai_ocr_result` is used to populate input fields. That section becomes a read-only display.

- [ ] **Step 3: Replace input fields with confirmation card**

Find the section that renders input fields for weight/body_fat/muscle_mass/etc after OCR and replace with:

```tsx
{ocrResult && (
  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-3">
    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
      <span>✅</span><span>AI 辨識完成</span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: '體重', value: ocrResult.weight, unit: 'kg' },
        { label: '體脂率', value: ocrResult.body_fat, unit: '%' },
        { label: '肌肉量', value: ocrResult.muscle_mass, unit: 'kg' },
        { label: '內臟脂肪', value: ocrResult.visceral_fat, unit: '' },
        { label: '骨質量', value: ocrResult.bone_mass, unit: 'kg' },
        { label: '代謝率', value: ocrResult.bmr, unit: 'kcal' },
      ].filter(item => item.value != null).map(item => (
        <div key={item.label} className="bg-white rounded-xl px-3 py-2">
          <div className="text-xs text-gray-400">{item.label}</div>
          <div className="text-lg font-bold text-gray-800">{item.value} <span className="text-sm font-normal text-gray-400">{item.unit}</span></div>
        </div>
      ))}
    </div>
    <button
      onClick={() => setShowEditMode(true)}
      className="text-xs text-gray-400 underline underline-offset-2"
    >
      修改數值
    </button>
  </div>
)}
{showEditMode && (
  /* existing input fields — only shown when user clicks 修改數值 */
)}
```

Add `showEditMode` state: `const [showEditMode, setShowEditMode] = useState(false)`

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/daily-checkin.tsx
git commit -m "feat(P0): replace OCR input fields with clean confirmation card"
```

---

## PHASE 6 — P1: Check-in Animation + AI Encouragement

### Task 17: Confetti Animation on Check-in Success

**Files:**
- Create: `src/components/checkin/checkin-success.tsx`

- [ ] **Step 1: Create confetti component (CSS-only, no external deps)**

```tsx
// src/components/checkin/checkin-success.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CheckinSuccessProps {
  visible: boolean
  streakDays: number
  encouragement: string
  onClose: () => void
}

const COLORS = ['#00C6AD', '#F5A623', '#7B61FF', '#FF6B6B', '#4ECDC4', '#FFE66D']

function Particle({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, scale: 1 }}
      animate={{ y: 600, opacity: 0, scale: 0.5, rotate: Math.random() * 360 }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeIn' }}
      className="absolute top-0 w-3 h-3 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%` }}
    />
  )
}

export function CheckinSuccess({ visible, streakDays, encouragement, onClose }: CheckinSuccessProps) {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
    }))
  )

  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 4000)
      return () => clearTimeout(t)
    }
  }, [visible, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
              <Particle key={p.id} color={p.color} x={p.x} delay={p.delay} />
            ))}
          </div>
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">
              {streakDays >= 7 ? '🔥' : streakDays >= 3 ? '💪' : '✅'}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">打卡成功！</h2>
            {streakDays > 1 && (
              <div className="text-emerald-600 font-bold text-sm mb-3">
                連續第 {streakDays} 天打卡 🎯
              </div>
            )}
            <p className="text-gray-600 text-sm leading-relaxed">{encouragement}</p>
            <button
              onClick={onClose}
              className="mt-5 w-full bg-emerald-500 text-white rounded-2xl py-3 font-bold hover:bg-emerald-600 transition-colors"
            >
              繼續加油 💪
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Wire into daily-checkin.tsx**

After successful checkin POST, fetch encouragement and show success modal:
```tsx
// After checkin success
const encRes = await fetch('/api/ai/encourage')
const { message, streakDays } = await encRes.json()
setEncouragement(message)
setStreakDays(streakDays)
setShowSuccess(true)
```

Add state: `const [showSuccess, setShowSuccess] = useState(false)`, `const [encouragement, setEncouragement] = useState('')`, `const [streakDays, setStreakDays] = useState(1)`

Add to JSX: `<CheckinSuccess visible={showSuccess} streakDays={streakDays} encouragement={encouragement} onClose={() => setShowSuccess(false)} />`

- [ ] **Step 3: Enhance `/api/ai/encourage` to return streakDays + personalized message**

```typescript
// src/app/api/ai/encourage/route.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import * as schema from '@/drizzle/schema'
import { eq, desc } from 'drizzle-orm'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ message: '加油！', streakDays: 1 })
  const userId = session.user.id

  // Get recent records to calculate streak and trend
  const records = await db.select({
    date: schema.faHealthRecords.date,
    weight: schema.faHealthRecords.weight,
    bodyFat: schema.faHealthRecords.bodyFat,
  })
    .from(schema.faHealthRecords)
    .where(eq(schema.faHealthRecords.userId, userId))
    .orderBy(desc(schema.faHealthRecords.date))
    .limit(14)

  // Calculate streak (consecutive days)
  let streakDays = 1
  const today = new Date().toISOString().split('T')[0]
  const sortedDates = records.map(r => r.date).sort().reverse()
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const curr = new Date(sortedDates[i])
    const prev = new Date(sortedDates[i + 1])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff <= 1.5) streakDays++
    else break
  }

  // Build context for AI
  const latestWeight = records[0]?.weight
  const prevWeight = records[1]?.weight
  const weightChange = latestWeight && prevWeight ? (+latestWeight - +prevWeight).toFixed(1) : null
  const latestBodyFat = records[0]?.bodyFat

  const context = [
    `連續打卡 ${streakDays} 天`,
    latestWeight ? `最新體重 ${latestWeight} kg` : '',
    weightChange ? `比上次${+weightChange < 0 ? '減少' : '增加'} ${Math.abs(+weightChange)} kg` : '',
    latestBodyFat ? `體脂率 ${latestBodyFat}%` : '',
  ].filter(Boolean).join('，')

  const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: `你是一位鼓勵性的健身教練。根據以下用戶數據，給出1-2句個人化的激勵，要帶入具體數字，充滿正能量，繁體中文：\n${context}`,
    maxTokens: 100,
  })

  return NextResponse.json({ message: text.trim(), streakDays })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/checkin/ src/app/api/ai/encourage/route.ts src/components/dashboard/daily-checkin.tsx
git commit -m "feat(P1): add checkin success animation and personalized AI encouragement"
```

---

## PHASE 7 — P1: Weight Trend Chart + AI Prediction

### Task 18: Linear Regression Prediction

**Files:**
- Create: `src/lib/prediction.ts`

- [ ] **Step 1: Create prediction lib**

```typescript
// src/lib/prediction.ts

export interface WeightPoint {
  date: string
  weight: number
}

export interface PredictionResult {
  predictedPoints: { date: string; weight: number }[]
  targetDate: string | null   // ISO date string
  slopePerDay: number         // kg/day (negative = losing weight)
}

/**
 * Linear regression on the last N data points.
 * Returns predicted weights for next 30 days and estimated target date.
 */
export function predictWeight(
  records: WeightPoint[],
  targetWeight: number | null,
  daysAhead = 30
): PredictionResult | null {
  if (records.length < 3) return null

  // Use last 14 points max
  const pts = records.slice(-14)
  const n = pts.length

  // Convert dates to day indices
  const base = new Date(pts[0].date).getTime()
  const xs = pts.map(p => (new Date(p.date).getTime() - base) / 86400000)
  const ys = pts.map(p => p.weight)

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Project from today
  const todayMs = Date.now()
  const todayX = (todayMs - base) / 86400000
  const predictedPoints = Array.from({ length: daysAhead }, (_, i) => {
    const dayX = todayX + i
    const date = new Date(base + dayX * 86400000).toISOString().split('T')[0]
    const weight = Math.max(30, slope * dayX + intercept) // floor at 30kg
    return { date, weight: +weight.toFixed(1) }
  })

  let targetDate: string | null = null
  if (targetWeight && slope < 0) {
    const daysToTarget = (targetWeight - intercept) / slope
    if (daysToTarget > todayX && daysToTarget < todayX + 365) {
      targetDate = new Date(base + daysToTarget * 86400000).toISOString().split('T')[0]
    }
  }

  return { predictedPoints, targetDate, slopePerDay: +slope.toFixed(3) }
}
```

- [ ] **Step 2: Create WeightTrendChart component**

```tsx
// src/components/dashboard/weight-trend-chart.tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { predictWeight, type WeightPoint } from '@/lib/prediction'
import { format, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface WeightTrendChartProps {
  records: WeightPoint[]
  targetWeight: number | null
}

export function WeightTrendChart({ records, targetWeight }: WeightTrendChartProps) {
  if (records.length < 2) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        打卡滿 2 次後開啟趨勢圖
      </div>
    )
  }

  const prediction = predictWeight(records, targetWeight)

  // Merge actual + prediction for chart
  const actualMap = new Map(records.map(r => [r.date, { actual: r.weight }]))
  const predMap = new Map(
    (prediction?.predictedPoints ?? []).map(p => [p.date, { predicted: p.weight }])
  )
  const allDates = Array.from(new Set([...actualMap.keys(), ...predMap.keys()])).sort()
  const data = allDates.map(date => ({
    date,
    label: format(parseISO(date), 'M/d', { locale: zhTW }),
    actual: actualMap.get(date)?.actual ?? null,
    predicted: predMap.get(date)?.predicted ?? null,
  }))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">體重趨勢</h3>
        {prediction?.targetDate && targetWeight && (
          <div className="text-xs text-emerald-600 font-medium">
            預計 {format(parseISO(prediction.targetDate), 'M月d日')} 達到 {targetWeight}kg 🎯
          </div>
        )}
        {records.length < 3 && (
          <div className="text-xs text-gray-400">打卡滿 3 次開啟 AI 預測線</div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: any, name: string) => [
              `${value} kg`,
              name === 'actual' ? '實際體重' : 'AI 預測',
            ]}
            labelFormatter={label => label}
          />
          <Line
            type="monotone" dataKey="actual"
            stroke="#00C6AD" strokeWidth={2.5}
            dot={{ r: 3, fill: '#00C6AD' }}
            connectNulls={false}
          />
          {prediction && records.length >= 3 && (
            <Line
              type="monotone" dataKey="predicted"
              stroke="#9CA3AF" strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />
          )}
          {targetWeight && (
            <ReferenceLine y={targetWeight} stroke="#F5A623" strokeDasharray="4 4" label={{ value: `目標 ${targetWeight}`, position: 'right', fontSize: 10, fill: '#F5A623' }} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-teal-400 inline-block" />實際</span>
        {prediction && records.length >= 3 && <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-gray-300 inline-block border-dashed" />AI 預測</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add WeightTrendChart to records page or home page**

In `src/app/(main)/records/page.tsx` (or `page.tsx`), fetch health records and pass to chart:

```tsx
import { WeightTrendChart } from '@/components/dashboard/weight-trend-chart'

// In server component:
const records = await db.select({ date: schema.faHealthRecords.date, weight: schema.faHealthRecords.weight })
  .from(schema.faHealthRecords)
  .where(and(eq(schema.faHealthRecords.userId, userId), isNotNull(schema.faHealthRecords.weight)))
  .orderBy(asc(schema.faHealthRecords.date))
  .limit(60)

const weightPoints = records.map(r => ({ date: r.date, weight: +r.weight! }))

// In JSX:
<WeightTrendChart records={weightPoints} targetWeight={user.targetWeight ? +user.targetWeight : null} />
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/prediction.ts src/components/dashboard/weight-trend-chart.tsx src/app/
git commit -m "feat(P1): add weight trend chart with AI prediction line"
```

---

## PHASE 8 — P2: Dynamic Leaderboard

### Task 19: Rank Change Badge + Enhanced Ranking API

**Files:**
- Create: `src/components/arena/rank-badge.tsx`
- Modify: `src/app/api/arena/ranking/route.ts`

- [ ] **Step 1: Add rank change calculation to ranking API**

In `/api/arena/ranking`, also fetch last week's records and compute previous rank:

```typescript
// After computing current participants array (sorted by progress desc):
// currentRanks: Map<userId, currentRank (1-based)>
const currentRanks = new Map(participants.map((p, i) => [p.userId, i + 1]))

// Fetch last week's records (7-14 days ago)
const lastWeekRecords = await db.select({
  userId: schema.faHealthRecords.userId,
  weight: schema.faHealthRecords.weight,
  date: schema.faHealthRecords.date,
})
  .from(schema.faHealthRecords)
  .where(and(
    inArray(schema.faHealthRecords.userId, allUserIds),
    isNotNull(schema.faHealthRecords.weight),
    // date between 14 and 7 days ago
    sql`${schema.faHealthRecords.date} >= current_date - interval '14 days'`,
    sql`${schema.faHealthRecords.date} < current_date - interval '7 days'`,
  ))
  .orderBy(desc(schema.faHealthRecords.date))

// Build last week weight map
const lastWeekWeightMap: Record<string, number> = {}
for (const r of lastWeekRecords) {
  if (!lastWeekWeightMap[r.userId]) lastWeekWeightMap[r.userId] = +r.weight!
}

// Compute last week participants (same progress formula) and sort
const lastWeekParticipants = participants.map(p => {
  const lw = lastWeekWeightMap[p.userId] ?? p.currentWeight
  const cb = challengeBaseMap[p.userId]
  let prevProgress = 0
  if (cb && lw !== null) {
    const reduced = cb.start - lw
    const needed = cb.start - cb.target
    if (needed > 0) prevProgress = Math.min(100, Math.max(0, Math.round((reduced / needed) * 100)))
  }
  return { userId: p.userId, prevProgress }
}).sort((a, b) => b.prevProgress - a.prevProgress)

const prevRanks = new Map(lastWeekParticipants.map((p, i) => [p.userId, i + 1]))

// Add rankChange to each participant
const participantsWithRank = participants.map(p => ({
  ...p,
  rank: currentRanks.get(p.userId) ?? 0,
  rankChange: (prevRanks.get(p.userId) ?? currentRanks.get(p.userId) ?? 0) - (currentRanks.get(p.userId) ?? 0),
  // positive = moved up (good), negative = moved down
}))
```

Note: add `import { sql } from 'drizzle-orm'` at top.

- [ ] **Step 2: Create RankBadge component**

```tsx
// src/components/arena/rank-badge.tsx
interface RankBadgeProps {
  rankChange: number
}

export function RankBadge({ rankChange }: RankBadgeProps) {
  if (rankChange === 0) return null
  const isUp = rankChange > 0
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
      {isUp ? '▲' : '▼'}{Math.abs(rankChange)}
    </span>
  )
}
```

- [ ] **Step 3: Add RankBadge to Arena/ranking UI component**

Find the ranking list component (check which component renders participant rows) and add `<RankBadge rankChange={participant.rankChange} />` next to the name.

- [ ] **Step 4: Commit**

```bash
git add src/components/arena/rank-badge.tsx src/app/api/arena/ranking/route.ts
git commit -m "feat(P2): add dynamic rank change badge to leaderboard"
```

---

## PHASE 9 — Final Verification

### Task 20: Full Flow Verification

- [ ] **Step 1: Build succeeds locally**

```bash
npm run build
```
Expected: no TypeScript errors, build completes

- [ ] **Step 2: Verify all Supabase imports are gone**

```bash
grep -r "supabase" src/ --include="*.ts" --include="*.tsx"
```
Expected: no output

- [ ] **Step 3: Push to master to trigger GitHub Actions**

```bash
git push origin master
```
Go to GitHub Actions tab → verify deploy job succeeds

- [ ] **Step 4: Test on EC2**

```
https://poc.mcstation.ai/fit/login
→ click Google Login
→ verify redirect to /fit/ (home page)
→ verify check-in works
→ verify arena page loads
→ verify profile page loads
```

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: post-migration adjustments" && git push origin master
```
