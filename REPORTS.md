# REPORTS — 待處理清單

> 這裡紀錄 Jason 透過 LINE Yuzu-san 回報或平常提到、但決定**暫時不做**的項目。
> 每次開始工作時優先檢查。

---

## 📋 待處理

### 1. PWA 安裝引導做成 Skill（待實作）
**狀態**：🟡 Pending
**日期**：2026-04-14
**需求**：
把 Fit-Alliance 的 PWA 安裝引導（頂部綠色 banner + 底部彈出教學）做成可複用的 Claude Code skill，之後套用到其他專案只要一句話就能自動安裝。

**建議設計**（待確認）：
- **位置**：`~/.claude/skills/pwa-install-prompt/`（全域）
- **支援範圍**：Next.js App Router + Pages Router
- **自動化行為**：
  - 複製 `pwa-install-prompt.tsx` + `pwa-top-banner.tsx` 到 `src/components/shared/`
  - 安裝 `framer-motion` + `lucide-react`
  - 建立 `public/manifest.webmanifest`
  - 在 `layout.tsx` 插入 `<PwaTopBanner />` 和 `<PwaInstallPrompt />`
- **自動問客製化參數**：
  - App 名稱
  - 主色
  - App icon 路徑
  - 頂部 banner 文字

**相關檔案**：
- `src/components/shared/pwa-install-prompt.tsx`
- `src/components/shared/pwa-top-banner.tsx`
- `public/manifest.webmanifest`

---

### 2. 舊 logo / Splash Screen 顯示錯誤
**狀態**：🔴 Bug
**日期**：2026-04-14
**問題**：
在 Android Chrome 點右上角「⋮」→「執行應用程式」（開啟 Fit Alliance PWA）時，啟動畫面出現**舊的吉祥物角色**（戴綠頭帶、掛哨子的胖胖人物），不是新版的 App icon。

**可能原因**：
- `public/manifest.webmanifest` 裡的 `icons` 指向舊圖
- `SplashScreen` component（`src/components/shared/splash-screen.tsx`）使用舊圖片
- `apple-touch-icon` / `icon-192.png` / `icon-512.png` 還是舊版

**待確認檔案**：
- `public/manifest.webmanifest`
- `public/icon-192.png`、`public/icon-512.png`
- `src/components/shared/splash-screen.tsx`
- `src/app/layout.tsx` 的 `metadata.icons`

**修復方向**：
檢查所有 icon / splash 相關檔案，替換成正確的新版 App icon，並清除 Service Worker 快取確保用戶端更新。
