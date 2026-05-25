/**
 * Progress Tracker — 進度追蹤
 * 追蹤玩家統計數據、成就、連擊
 */

import { EventBus, EVENTS } from './event-bus.js';
import { StorageManager } from './storage-manager.js';

const ProgressTracker = {
  // 當前玩家進度
  player: null,
  
  // 當前關卡統計
  session: {
    correctCount: 0,
    wrongCount: 0,
    startTime: 0,
    endTime: 0,
    streak: 0,
    maxStreak: 0,
  },
  
  /**
   * 初始化玩家
   */
  init() {
    this.player = StorageManager.loadPlayer();
    return this.player;
  },
  
  /**
   * 開始新會話
   */
  startSession() {
    this.session = {
      correctCount: 0,
      wrongCount: 0,
      startTime: Date.now(),
      endTime: 0,
      streak: 0,
      maxStreak: 0,
    };
  },
  
  /**
   * 結束會話
   */
  endSession() {
    this.session.endTime = Date.now();
    
    // 更新玩家統計
    if (this.player) {
      this.player.lastActive = new Date().toISOString();
      this.player.stats.totalQuestions += this.session.correctCount + this.session.wrongCount;
      this.player.stats.totalTime += this.session.endTime - this.session.startTime;
      if (this.session.maxStreak > this.player.stats.longestStreak) {
        this.player.stats.longestStreak = this.session.maxStreak;
      }
      StorageManager.savePlayer(this.player);
    }
    
    return this.getSessionSummary();
  },
  
  /**
   * 記錄正確答題
   */
  recordCorrect(wpm = 0) {
    this.session.correctCount++;
    this.session.streak++;
    if (this.session.streak > this.session.maxStreak) {
      this.session.maxStreak = this.session.streak;
    }
    
    // 更新玩家準確率
    if (this.player) {
      const total = this.session.correctCount + this.session.wrongCount;
      this.player.stats.correctAnswers += 1;
      if (wpm > this.player.stats.bestWPM) {
        this.player.stats.bestWPM = wpm;
      }
    }
    
    EventBus.emit(EVENTS.STREAK_UPDATE, { 
      streak: this.session.streak,
      maxStreak: this.session.maxStreak 
    });
    
    return { streak: this.session.streak };
  },
  
  /**
   * 記錄錯誤答題
   */
  recordWrong() {
    this.session.wrongCount++;
    this.session.streak = 0;
    return { streak: 0 };
  },
  
  /**
   * 完成關卡
   */
  completeLevel(levelId, stars, score, time) {
    if (!this.player) return;
    
    // 檢查是否已完成
    const existing = this.player.progress.completedLevels.find(l => l.levelId === levelId);
    
    const levelData = {
      levelId,
      stars,
      score,
      time,
      completedAt: new Date().toISOString(),
    };
    
    if (existing) {
      // 更新最高分
      if (score > existing.score) {
        existing.score = score;
        existing.stars = stars;
        existing.time = time;
        existing.completedAt = levelData.completedAt;
      }
    } else {
      this.player.progress.completedLevels.push(levelData);
      this.player.progress.totalStars += stars;
    }
    
    StorageManager.savePlayer(this.player);
    
    return levelData;
  },
  
  /**
   * 獲取會話摘要
   */
  getSessionSummary() {
    const total = this.session.correctCount + this.session.wrongCount;
    return {
      correct: this.session.correctCount,
      wrong: this.session.wrongCount,
      total,
      accuracy: total > 0 ? this.session.correctCount / total : 0,
      duration: this.session.endTime - this.session.startTime,
      maxStreak: this.session.maxStreak,
    };
  },
  
  /**
   * 獲取玩家數據
   */
  getPlayer() {
    return this.player;
  },
  
  /**
   * 獲取玩家統計
   */
  getStats() {
    return this.player?.stats || {};
  },
  
  /**
   * 獲取玩家進度
   */
  getProgress() {
    return this.player?.progress || {};
  },
  
  /**
   * 更新玩家名稱
   */
  updateName(name) {
    if (this.player) {
      this.player.name = name;
      StorageManager.savePlayer(this.player);
    }
  },
  
  /**
   * 添加徽章
   */
  addBadge(badgeId) {
    if (!this.player) return false;
    
    if (!this.player.badges.includes(badgeId)) {
      this.player.badges.push(badgeId);
      StorageManager.savePlayer(this.player);
      EventBus.emit(EVENTS.BADGE_UNLOCK, { badgeId });
    }
    return true;
  },
  
  /**
   * 檢查是否擁有徽章
   */
  hasBadge(badgeId) {
    return this.player?.badges?.includes(badgeId) || false;
  },
  
  /**
   * 獲取所有徽章
   */
  getBadges() {
    return this.player?.badges || [];
  },
  
  /**
   * 重置玩家數據
   */
  resetPlayer() {
    this.player = StorageManager._defaultPlayer();
    StorageManager.savePlayer(this.player);
  },
};

export { ProgressTracker };