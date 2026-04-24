# Yuzu-san LINE 顧問 — 跨專案 Skill 包

讓任何專案的 Claude Code 都能透過 LINE 顧問（Yuzu-san）發訊息給老闆。

## 快速設定（其他專案）

### Step 1: 複製 env 變數
在專案的 `.env` 加入：
```env
LINE_CHANNEL_ACCESS_TOKEN=你的LINE_TOKEN
OWNER_LINE_USER_ID=你的LINE_USER_ID
PROJECT_DISPLAY_NAME=專案顯示名稱（選填，預設用資料夾名）
```

### Step 2: 複製 skill 檔案
把以下檔案複製到你的專案 `.claude/commands/` 目錄：
- `notify.md` — 發送即時通知
- `report.md` — 自動彙整工作報告
- `ask-boss.md` — 向老闆提問等待決策

```bash
# 快速複製（假設 Yuzu-san 在同層目錄）
mkdir -p .claude/commands
cp ../Yuzu-san/.claude/commands/{notify,report,ask-boss}.md .claude/commands/
```

### Step 3: 在 CLAUDE.md 加入提示（選填）
```markdown
## LINE 通知
本專案可透過 Yuzu-san LINE 顧問發送通知給老闆。
- `/notify {訊息}` — 即時通知
- `/report` — 工作進度報告
- `/ask-boss {問題}` — 需要老闆決策時提問
重要里程碑完成時，主動使用 /notify 通知老闆。
```

## 可用指令

| 指令 | 用途 | 範例 |
|------|------|------|
| `/notify` | 即時通知 | `/notify 部署完成` |
| `/report` | 工作報告 | `/report 今天完成登入功能` |
| `/ask-boss` | 提問決策 | `/ask-boss 要用哪個 DB？` |

## LINE 上看到的效果

```
【MyCoolProject】
部署完成，已上線 production
```

```
【MyCoolProject】需要你的決定

❓ API 要用 REST 還是 GraphQL？

（請直接在 LINE 回覆）
```

## 進階：讓 Claude Code 主動通知

在專案的 CLAUDE.md 加入：
```markdown
## 自動通知規則
- 完成 git push 後，用 /notify 通知老闆
- 遇到無法解決的錯誤，用 /ask-boss 詢問方向
- 每次工作結束前，用 /report 發送進度報告
```
