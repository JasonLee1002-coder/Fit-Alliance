# Fit-Alliance — Claude Code 設定

## 超級UI 定義
用戶說「超級UI」時，自動套用以下完整組合，不需要再問：
- **shadcn/ui** — 元件庫底座（Button、Skeleton、Card 等）
- **Magic UI** — 動畫元件（NumberTicker、AnimatedGradientText、WordFadeIn）
- **framer-motion** — 頁面入場動畫、交錯淡入、hover 上浮
- **radial-gradient 背景** — 深色主題光暈背景，製造空氣感
- **發光邊框** — 重點卡片 glow border
- **骨架屏（Skeleton）** — 所有資料載入狀態
- **數字動畫（NumberTicker）** — 所有統計數字
- **Zustand** — 全域狀態管理（邏輯與 UI 分離）
- 字型：**Geist Sans**（UI）+ **Geist Mono**（數字/金額）

## 啟動報到
每次新對話開始，主動說：
「✅ Fit-Alliance 已就緒，Superpowers 工作流已啟用。」

## 開發工作流（Superpowers，自動執行）
**只要用戶說要做新功能或修 bug，Claude 自動按順序執行，不需要任何觸發詞：**
1. **Brainstorm** — 先問需求、邊界、設計方向（skill: superpowers:brainstorming）
2. **Plan** — 拆解成可執行任務清單（skill: superpowers:writing-plans）
3. **Execute** — 逐步實作，每步驟驗證（skill: superpowers:executing-plans）
4. **Review** — 完成後對照計畫檢查（skill: superpowers:requesting-code-review）

> ❌ 禁止跳過 Brainstorm 直接寫 code
> ✅ 計畫文件自動存到 `docs/superpowers/plans/`

## 啟動流程
每次開始工作時，自動執行：
1. `git pull` 同步 GitHub 最新代碼
2. 檢查 `REPORTS.md`（如果存在），優先處理 Jason 透過 LINE 回報的問題

## 部署方式
- 推上 GitHub 後 Vercel 自動部署
- 本地不需要跑 dev server，直接雲端驗證

## Git Push 策略
- 合併多個改動再一次 push
- 功能完整才 push，不要每改一行就推

## 待處理回報
每次開始工作時，請先檢查 `REPORTS.md`（如果存在），裡面是 Jason 透過 LINE Yuzu-san 回報的問題，請優先處理。

---

## LINE 通知指令
本專案已安裝 Yuzu-san LINE 通知系統：
- `/notify {訊息}` — 即時通知 Jason
- `/report` — 工作進度報告
- `/ask-boss {問題}` — 需要 Jason 決策時提問

---

## 可用技能（Skills）

| 技能 | 用途 | 觸發時機 |
|------|------|---------|
| `pwa-install` | PWA 安裝引導 | 實作 PWA 安裝流程時 |
| `frontend-design` | 有設計感的 UI | 設計新頁面時 |
| `survey` | 問卷模組 | 會員回饋功能時 |
| `customer-success` | 客戶成功流程 | 設計會員留存機制時 |
