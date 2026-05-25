# TypeQuest Kingdom - SPEC v5.1

## Concept & Vision

打字王國是一個融合 RPG 元素的打字學習遊戲，玩家扮演勇敢的打字見習法師，在魔法王國中通過打字修煉，最終成為打字大師。遊戲核心是自適應難度引擎 + 10種遊戲模式，讓學習打字變得有趣且有效率。

## 系統架構

### 核心系統（已實現）

| 系統 | 檔案 | 功能 |
|------|------|------|
| EventBus | index.html | 事件驅動通訊 |
| StateMachine | index.html | 狀態管理（HOME/MENU/PLAYING/COMPLETE） |
| AdaptiveEngine | index.html | 自適應難度 1-5 級 |
| TypeEngine | index.html | 打字引擎、題目管理 |
| AudioSystem | index.html | Web Audio API 音效 |
| ProgressTracker | index.html | localStorage 進度保存 |
| StorageManager | index.html | 存儲封裝 |

### 缺失系統（需實現）

| 系統 | 功能 |
|------|------|
| ScoreSystem | 評級（S/A/B/C/D/F）、WPM、準確率 |
| ComboSystem | 連擊計數、里程碑獎勵、能量條 |
| SkillSystem | 技能樹、被動技能、大招 |
| GameModeManager | 10種遊戲模式切換 |

## 10種遊戲模式

### 1. 基礎關卡模式（Foundation Mode）✅
- 線性關卡結構，從易到難
- 題目：倉頡基礎 L1-L3、水果王國、動物王國、日常用語

### 2. 限時挑戰模式（Time Attack）
- 60/90/120秒計時
- 尽可能多答對題目
- 分數 = 正確題數 × Combo倍數

### 3. 詞彙學習模式（Vocabulary Mode）
- 先展示完整詞彙和倉頡碼
- 3秒記憶時間
- 然後消失，玩家回憶輸入

### 4. 速打模式（Sprint Mode）
- 50題連續
- 追求最短時間完成
- 顯示 WPM（每分鐘字數）

### 5. 挑戰模式（Challenge Mode）
- 特定條件：例如「全對」「10連擊」「90%準確率」
- 完成挑戰解鎖成就徽章

### 6. 練習模式（Practice Mode）
- 無計時、無評級
- 無限提示
- 可選擇特定題目類型

### 7. 對戰模式（VS Mode）⚠️ TODO
- 雙人同屏對戰（sharing keyboard）
- 先答對者得分

### 8. 故事模式（Story Mode）⚠️ TODO
- 結合敘事的情景打字
- 例如：「打敗哥布林需要輸入攻擊咒語」

### 9. Boss 模式（Boss Mode）⚠️ TODO
- 多階段Boss戰
- 每階段有不同題目難度
- HP 血條系統

### 10. 自由練習模式（Free Mode）⚠️ TODO
- 自訂題目集
- 可上傳自定義詞庫

## 題庫結構

```json
{
  "cangjie-l1": [{ "text": "日", "code": "A", "hint": "日字部首" }],
  "cangjie-l2": [...],
  "cangjie-l3": [...],
  "fruits-l1": [...],
  "animals-l1": [...],
  "daily-l1": [...]
}
```

## 評級系統

| 等級 | 準確率 | 描述 |
|------|--------|------|
| S | ≥95% | 大師級 |
| A | ≥90% | 優秀 |
| B | ≥80% | 良好 |
| C | ≥70% | 及格 |
| D | ≥60% | 仍需努力 |
| F | <60% | 再接再厲 |

## Combo System

| Combo 數 | 顯示 |
|---------|------|
| 5+ | 🔥 熱辣辣！ |
| 10+ | 💥 火力全開！ |
| 20+ | ⚡ 雷神之怒！ |
| 30+ | 🌟 傳奇！ |

## 自適應難度

| 等級 | 名稱 | 時限 | 提示層數 |
|------|------|------|---------|
| 1 | 輕鬆 | 無 | 3 |
| 2 | 簡單 | 20s | 2 |
| 3 | 普通 | 15s | 1 |
| 4 | 困難 | 10s | 0 |
| 5 | 專家 | 5s | 0 |

## 部署

- GitHub: https://github.com/ihateusingai-beep/typing-kingdom
- Pages: https://ihateusingai-beep.github.io/typing-kingdom/

## Changelog

### v5.1 (2026-05-26)
- 新增animals-l1、daily-l1題庫
- 實現限時挑戰、詞彙學習、速打、挑戰、練習模式
- 新增Combo System視覺化
- 新增評分系統鉤子