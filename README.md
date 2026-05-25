# 速成打字王國 — TypeQuest Kingdom v5.0

打字學習遊戲平台 | 純前端 + localStorage

## 📁 目錄結構

```
typing-kingdom/
├── index.html              # 玩家端主頁（單一HTML）
├── data/
│   ├── questions.json      # 題庫
│   └── levels.json         # 關卡配置
├── assets/
│   └── js/
│       ├── core/           # 核心引擎
│       │   ├── type-engine.js      # 打字引擎
│       │   ├── score-system.js     # 評分系統
│       │   ├── audio-system.js    # 音效系統
│       │   └── animation-system.js # 動畫系統
│       └── systems/       # 系統模組
│           ├── event-bus.js        # 事件匯流排
│           ├── state-machine.js     # 狀態機
│           ├── adaptive-engine.js  # 自適應難度引擎
│           ├── progress-tracker.js # 進度追蹤
│           └── storage-manager.js  # 存儲管理
├── SPEC.md                # 規格文檔
└── README.md
```

## 🎮 遊戲模式

1. **冒險模式** - 世界地圖 + 關卡挑戰
2. **自學模式** - 自由選擇章節練習
3. **聽打模式** - 語音朗讀題目
4. **速打模式** -限時挑戰
5. **對戰模式** - 雙人對戰
6. **單字模式** - 詞彙集中訓練
7. **文章模式** - 段落打字
8. **對話模式** - 角色扮演對話
9. **挑戰模式** - Boss關卡
10. **故事模式** - 剧情打字

## 🔧 核心系統

- Event Bus（事件驅動通訊）
- State Machine（狀態機）
- Adaptive Engine（自適應難度）
- Progress Tracker（進度追蹤）
- Storage Manager（localStorage）

## 🚀 部署

```bash
# 克隆到 GitHub Pages
git clone https://github.com/ihateusingai-beep/typing-kingdom.git
cd typing-kingdom
# 推送到 GitHub 即自動部署
```

## 📌 版本

| 版本 | 日期 | 更新 |
|------|------|------|
| v5.0 | 2026-05-25 | 全新模組化架構，10種遊戲模式 |

---

*設計: 正常化、遊戲化、易擴展*