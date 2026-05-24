# Fit-Alliance — AWS 遷移 + 新功能 Design Spec
**日期：** 2026-05-24  
**版本：** v1.0  
**作者：** CTO OmniCore × Jason

---

## 一、目標

1. 從 Vercel + Supabase 完全遷移至 AWS EC2（Tokyo）
2. 移除食物 AI 辨識功能（含 /meals 頁面 AI 相關部分）
3. 新增 P0/P1/P2 功能提升用戶體驗

---

## 二、架構變更

### 2.1 移除 Supabase（完全脫離）

| 組件 | 現在 | 遷移後 |
|------|------|--------|
| Auth | Supabase OAuth + Cookie Session | NextAuth.js v5 + Google OAuth |
| Database | Supabase PostgreSQL | EC2 Docker PostgreSQL `fitalliance` DB |
| DB Client | `@supabase/ssr` + service role | Drizzle ORM → `localhost:5432` |
| Middleware | Supabase session check | NextAuth `auth()` JWT check |
| Storage | AWS S3 `transtep-rd` | 不動（已在 AWS） |
| Hosting | Vercel | EC2 PM2，port 3003 |
| Domain | Vercel URL | `poc.mcstation.ai/fit`（Nginx subpath，basePath=/fit） |
| CI/CD | Vercel auto-deploy | GitHub Actions → SSH → EC2 |

### 2.2 EC2 資源使用（現有，不新增）

- **PostgreSQL**：`omnicore-postgres` Docker，port 5432，新建 DB `fitalliance`
- **Redis**：`omnicore-redis` Docker，port 6379，key prefix `fa:`
- **Nginx**：現有 reverse proxy，加 vhost `fit.mcstation.ai → localhost:3003`
- **PM2**：新增 process `fit-alliance`，port 3003

### 2.3 Auth 設計（NextAuth.js v5）

```
用戶點「Google 登入」
  → NextAuth signIn('google')
  → Google OAuth 授權
  → NextAuth callback → 建立/更新 fa_users 記錄（EC2 PostgreSQL）
  → JWT session cookie
  → 後續請求：middleware auth() 驗證 JWT
```

- Session 策略：JWT（不需要 DB session adapter）
- User ID：改用 email 作為唯一鍵（Supabase UUID → NextAuth email-based）
- `fa_users` table 保留，`id` 改為 NextAuth 的 `user.id`（UUID v4）

### 2.4 Database 遷移策略

1. 從 Supabase 匯出現有 schema（`pg_dump`）
2. 在 EC2 建立 `fitalliance` database
3. 匯入 schema（不含 Supabase 內建的 auth schema）
4. 現有資料若需要保留：匯出資料行，轉換 user ID 格式後匯入
5. 所有 Drizzle schema 檔案更新對應 EC2 PostgreSQL

### 2.5 影響範圍

**刪除的檔案：**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/ai/food-recognize/route.ts`

**新增的檔案：**
- `src/lib/auth.ts`（NextAuth 設定）
- `src/lib/db.ts`（Drizzle + EC2 PostgreSQL 連線）
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/drizzle/schema.ts`（現有 Supabase tables → Drizzle schema）
- `.github/workflows/deploy.yml`（GitHub Actions CI/CD）
- `ecosystem.config.js`（PM2 設定）

**修改的檔案（共 ~24 個）：**
- `src/middleware.ts` → 換 NextAuth `auth()`
- 所有使用 `createServerSupabase()` 的頁面/API → 換 `auth()` + Drizzle
- 所有使用 `createServiceRoleSupabase()` → 直接用 server-side Drizzle
- `src/app/(auth)/login/page.tsx` → 換 NextAuth `signIn('google')`

### 2.6 環境變數（EC2 `.env.production`）

```env
# Auth
NEXTAUTH_URL=https://fit.mcstation.ai
NEXTAUTH_SECRET=<openssl rand -base64 32>
GOOGLE_CLIENT_ID=<現有 Google OAuth Client ID>
GOOGLE_CLIENT_SECRET=<現有 Google OAuth Client Secret>

# Database
DATABASE_URL=postgresql://postgres:<密碼>@localhost:5432/fitalliance

# AWS S3（不變）
AWS_ACCESS_KEY_ID=AKIA4M4I3DP56YHMQZK6
AWS_SECRET_ACCESS_KEY=<現有>

# AI
GEMINI_API_KEY=AIzaSyCwjpRH53rNAbrOn7Lt2cAn_jc4CDn5sf4

# Redis（共用）
REDIS_URL=redis://localhost:6379

# App
PORT=3003
NODE_ENV=production
```

---

## 三、功能變更

### 3.1 P0 — 移除食物 AI 辨識 + 打卡 UI 清爽化

#### 食物辨識移除
- 刪除 `/api/ai/food-recognize` route
- `/meals` 頁面：**整頁移除**（功能已確認不需要）
- 移除相關 component（camera upload、food result display 等）

#### 打卡確認卡 UI 重設計
**現在的問題：** AI 辨識磅秤截圖後，顯示一堆輸入格（體脂率、BMI、肌肉量…），讓用戶感覺還是在手動填表。

**改後：** AI 辨識完成 → 顯示乾淨的「確認卡」

```
┌──────────────────────────────┐
│  ✅ AI 辨識完成               │
│  ─────────────────────────   │
│  體重      87.95 kg          │
│  體脂率    27.86 %           │
│  肌肉量    60.78 kg          │
│  內臟脂肪  11.5              │
│  骨質量    3.31 kg           │
│                               │
│  📅 2026/05/24   [修改數值]  │
│                               │
│  [⚡ 立即打卡]               │
└──────────────────────────────┘
```

- 移除所有 `<input>` 欄位
- 數值以只讀方式顯示（大字體、有色彩區分）
- 「修改數值」小按鈕點進去才展開編輯模式
- 移除「說明→」按鈕（這些說明頁面保留，但不在打卡流程中顯示）

### 3.2 P1 — 打卡動畫 + AI 個人化激勵

#### 打卡動畫
打卡成功後觸發：
1. **撒花動畫**：confetti 粒子從上方落下（用 canvas 或 CSS animation）
2. **成就卡彈出**：顯示連續打卡天數、本週進度
3. **徽章解鎖**（條件觸發）：
   - 「首次打卡」🏅
   - 「連續 7 天」🔥
   - 「體重下降 1kg」📉
   - 「體脂突破新低」💪

#### AI 個人化激勵（不是通用語）
打卡後，呼叫 `/api/ai/encourage` 取得個人化訊息：

**現有 API 已存在**（`src/app/api/ai/encourage/route.ts`）— 確認並強化

輸入：用戶最近 7 天數據（體重趨勢、連續天數、vs 目標）  
輸出：1-2 句個人化激勵，帶入具體數字

範例輸出：「你昨天體脂 27.86%，比上週低了 0.3%，繼續 5 天你會突破 27%！」

### 3.3 P1 — 體重趨勢圖 + AI 預測線

位置：首頁或 `/records` 頁面

**元件設計（Recharts，已安裝）：**
- 折線圖：過去 30 天體重實際數值
- 虛線：AI 計算的線性預測（基於近 14 天趨勢）
- X 軸：日期，Y 軸：體重（kg）
- 標記點：每次打卡，hover 顯示當天完整數據
- 預測文字：「照這個趨勢，你預計 6/15 達到 85kg 目標」

**AI 預測邏輯：**
- 取近 14 天有效打卡記錄
- 線性回歸計算每日平均變化率
- 投射到目標體重，算出預計達標日期
- 若數據不足 3 筆：不顯示預測線，顯示「打卡滿 3 次後開啟預測」

### 3.4 P2 — 動態排行榜

**現有排行榜問題：** 靜態分數，沒有動態感

**改後：**
- 每人名字旁顯示「↑3」或「↓1」（本週相對上週排名變化）
- 名次變動用顏色區分：綠色上升、紅色下降、灰色持平
- 動畫：榜單載入時，各名次依序從下往上 fade in
- 「你的排名」卡固定釘在用戶視角最上方（即使排名第 8）

---

## 四、CI/CD 設計

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - SSH to EC2 (AWS SSM 或 SSH key)
      - cd /home/jason/fit-alliance
      - git pull origin master
      - npm ci
      - npm run build
      - pm2 restart fit-alliance
```

---

## 五、執行順序

```
Phase 1（遷移，約 2-3 天）
  ├─ 建立 EC2 fitalliance DB + schema
  ├─ 實作 NextAuth + Drizzle
  ├─ 修改 24 個 Supabase 引用檔案
  ├─ 設定 Nginx vhost
  ├─ 設定 PM2 + GitHub Actions
  └─ 驗證：登入、打卡、Arena 全流程

Phase 2（P0 功能，約 0.5 天）
  ├─ 移除食物 AI 辨識
  └─ 打卡確認卡 UI 重設計

Phase 3（P1 功能，約 1.5 天）
  ├─ 打卡動畫 + 成就徽章
  ├─ AI 個人化激勵強化
  └─ 趨勢圖 + AI 預測線

Phase 4（P2 功能，約 1 天）
  └─ 動態排行榜
```

---

## 六、風險與對策

| 風險 | 對策 |
|------|------|
| Supabase schema 不完整 | 先 dump 完整 schema，對照 Drizzle 重建 |
| NextAuth user ID 與舊 Supabase UUID 不同 | 以 email 作唯一鍵，重新關聯 |
| EC2 PostgreSQL 密碼未知 | 請 Mozo 提供或 reset（`omnicore-postgres` container） |
| Google OAuth redirect URI | 需在 Google Console 加 `https://fit.mcstation.ai/api/auth/callback/google` |
| feedbites 共用 Supabase | Fit-Alliance 遷走後不影響 feedbites，獨立運作 |
| Port 3003 衝突 | MASTER_CONTEXT 確認未佔用；部署前再確認 `ss -tlnp | grep 3003` |
