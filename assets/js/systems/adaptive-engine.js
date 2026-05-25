/**
 * Adaptive Difficulty Engine — 自適應難度引擎
 * 實時根據學生狀態自動調整難度
 */

import { EventBus, EVENTS } from './event-bus.js';

// 難度級別
const DIFFICULTY_LEVELS = {
  1: { name: '輕鬆', timeLimit: null, hintLevel: 3, questionLength: 'char', comboReq: 3 },
  2: { name: '簡單', timeLimit: 20, hintLevel: 2, questionLength: 'word', comboReq: 5 },
  3: { name: '普通', timeLimit: 15, hintLevel: 1, questionLength: 'short-sentence', comboReq: 7 },
  4: { name: '困難', timeLimit: 10, hintLevel: 0, questionLength: 'sentence', comboReq: 10 },
  5: { name: '專家', timeLimit: 5, hintLevel: 0, questionLength: 'long-sentence', comboReq: 15 },
};

// 觸發條件閾值
const THRESHOLDS = {
  ACCURACY_LOW: 0.6,      // 太難：準確率 < 60%
  ACCURACY_HIGH: 0.95,    // 太易：準確率 > 95%
  WPM_HIGH: 30,          // 太易：WPM > 30
  FATIGUE_SIGNALS: 3,     // 疲勞：速度下降超過3題
  MAX_ANSWER_TIME: 15000, // 疲勞：答題時間 > 15秒
  FRUSTRATION: 70,        // 挫折：frustration > 70
  ENGAGEMENT: 80,        // 專注：投入度 > 80
  CONSECUTIVE_ERRORS: 3,  // 太難：連續3題錯誤
  CONSECUTIVE_SUCCESS: 5, // 太易：連續5題正確
};

// 滑動窗口大小
const WINDOW_SIZE = 10;

const AdaptiveEngine = {
  // 當前難度級別 (1-5)
  currentLevel: 3,
  
  // 學生表現追蹤
  metrics: {
    // 滑動窗口
    recentAccuracy: [],      // [true, false, true, ...]
    recentTimes: [],        // [2000, 3000, ...] ms
    recentWPM: [],          // [25, 30, ...]
    
    // 連續計數
    consecutiveErrors: 0,
    consecutiveSuccess: 0,
    consecutiveSlow: 0,
    
    // 情緒指標
    frustrationLevel: 0,
    engagementLevel: 50,
    
    // 狀態
    currentStrategy: null,
    lastAdjustment: null,
  },
  
  // 難度配置
  difficultyLevels: DIFFICULTY_LEVELS,
  
  // 閾值配置
  thresholds: THRESHOLDS,
  
  /**
   * 記錄答題結果
   */
  recordAnswer({ correct, time, wpm }) {
    const now = Date.now();
    
    // 添加到滑動窗口
    this.metrics.recentAccuracy.push(correct);
    this.metrics.recentTimes.push(time);
    if (wpm) this.metrics.recentWPM.push(wpm);
    
    // 限制窗口大小
    if (this.metrics.recentAccuracy.length > WINDOW_SIZE) {
      this.metrics.recentAccuracy.shift();
    }
    if (this.metrics.recentTimes.length > WINDOW_SIZE) {
      this.metrics.recentTimes.shift();
    }
    if (this.metrics.recentWPM.length > WINDOW_SIZE) {
      this.metrics.recentWPM.shift();
    }
    
    // 更新連續計數
    if (correct) {
      this.metrics.consecutiveErrors = 0;
      this.metrics.consecutiveSuccess++;
    } else {
      this.metrics.consecutiveErrors++;
      this.metrics.consecutiveSuccess = 0;
    }
    
    // 檢測疲勞信號
    if (time > THRESHOLDS.MAX_ANSWER_TIME) {
      this.metrics.consecutiveSlow++;
    } else {
      this.metrics.consecutiveSlow = 0;
    }
    
    // 計算挫折程度（基於連續錯誤）
    this.metrics.frustrationLevel = Math.min(100, this.metrics.consecutiveErrors * 20);
    
    // 計算投入程度（基於連續正確）
    this.metrics.engagementLevel = Math.min(100, this.metrics.consecutiveSuccess * 10);
    
    // 自動調整（每題後檢查）
    this._checkAndAdapt();
  },
  
  /**
   * 記錄錯誤（擴展用）
   */
  handleWrongAnswer(attempts = 1) {
    this.metrics.consecutiveErrors += attempts;
    this.metrics.consecutiveSuccess = 0;
    this.metrics.frustrationLevel = Math.min(100, this.metrics.consecutiveErrors * 20);
  },
  
  /**
   * 內部：檢查並調整難度
   */
  _checkAndAdapt() {
    const summary = this.computeSummary();
    
    // 太難
    if (summary.accuracy < THRESHOLDS.ACCURACY_LOW || 
        this.metrics.consecutiveErrors >= THRESHOLDS.CONSECUTIVE_ERRORS) {
      this._adapt('too-hard');
      return;
    }
    
    // 太易
    if (summary.accuracy > THRESHOLDS.ACCURACY_HIGH && 
        this.metrics.consecutiveSuccess >= THRESHOLDS.CONSECUTIVE_SUCCESS &&
        summary.avgWPM > THRESHOLDS.WPM_HIGH) {
      this._adapt('too-easy');
      return;
    }
    
    // 疲勞
    if (this.metrics.consecutiveSlow >= THRESHOLDS.FATIGUE_SIGNALS ||
        this._isSlowingDown()) {
      this._adapt('fatigue');
      return;
    }
    
    // 挫折
    if (this.metrics.frustrationLevel > THRESHOLDS.FRUSTRATION) {
      this._adapt('frustration');
      return;
    }
  },
  
  /**
   * 內部：執行調整策略
   */
  _adapt(strategy) {
    // 防止重複調整
    if (this.metrics.currentStrategy === strategy) return;
    if (strategy !== 'fatigue' && strategy !== 'frustration' && 
        this.metrics.lastAdjustment && Date.now() - this.metrics.lastAdjustment < 5000) {
      return; // 5秒內不調整
    }
    
    const previousLevel = this.currentLevel;
    
    switch (strategy) {
      case 'too-hard':
        // 太難：降低難度
        this.currentLevel = Math.max(1, this.currentLevel - 1);
        break;
      case 'too-easy':
        // 太易：提高難度
        this.currentLevel = Math.min(5, this.currentLevel + 1);
        break;
      case 'fatigue':
        // 疲勞：維持難度但調整參數
        this._applyFatigueStrategy();
        break;
      case 'frustration':
        // 挫折：立即降低難度
        this.currentLevel = Math.max(1, this.currentLevel - 2);
        break;
    }
    
    // 更新策略記錄
    this.metrics.currentStrategy = strategy;
    this.metrics.lastAdjustment = Date.now();
    
    // 如果難度有變化，發布事件
    if (previousLevel !== this.currentLevel) {
      EventBus.emit(EVENTS.DIFFICULTY_CHANGE, {
        from: previousLevel,
        to: this.currentLevel,
        strategy,
        metrics: this.getMetrics(),
      });
    } else if (strategy === 'fatigue' || strategy === 'frustration') {
      // 特殊策略也發布事件
      EventBus.emit(EVENTS.DIFFICULTY_ADJUST, {
        strategy,
        metrics: this.getMetrics(),
      });
    }
  },
  
  /**
   * 內部：應用疲勞策略
   */
  _applyFatigueStrategy() {
    this.metrics.currentStrategy = 'fatigue';
    EventBus.emit(EVENTS.DIFFICULTY_ADJUST, {
      strategy: 'fatigue',
      action: 'extend-time',
      amount: 5,
      metrics: this.getMetrics(),
    });
  },
  
  /**
   * 內部：檢測是否在放慢
   */
  _isSlowingDown() {
    if (this.metrics.recentTimes.length < 5) return false;
    
    const recent = this.metrics.recentTimes;
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // 如果後半段平均時間顯著增加，認為在放慢
    return avgSecond > avgFirst * 1.3;
  },
  
  /**
   * 計算總結
   */
  computeSummary() {
    const acc = this.metrics.recentAccuracy;
    const times = this.metrics.recentTimes;
    const wpm = this.metrics.recentWPM;
    
    return {
      accuracy: acc.length > 0 
        ? acc.filter(x => x).length / acc.length 
        : 1,
      avgTime: times.length > 0 
        ? times.reduce((a, b) => a + b, 0) / times.length 
        : 0,
      avgWPM: wpm.length > 0 
        ? wpm.reduce((a, b) => a + b, 0) / wpm.length 
        : 0,
      streak: this.metrics.consecutiveSuccess,
    };
  },
  
  /**
   * 獲取當前難度配置
   */
  getCurrentDifficulty() {
    return {
      level: this.currentLevel,
      ...DIFFICULTY_LEVELS[this.currentLevel],
    };
  },
  
  /**
   * 獲取所有難度級別
   */
  getDifficultyLevels() {
    return { ...DIFFICULTY_LEVELS };
  },
  
  /**
   * 獲取監控指標
   */
  getMetrics() {
    return {
      ...this.metrics,
      summary: this.computeSummary(),
    };
  },
  
  /**
   * 手動設置難度
   */
  setLevel(level) {
    const prev = this.currentLevel;
    this.currentLevel = Math.max(1, Math.min(5, level));
    
    if (prev !== this.currentLevel) {
      EventBus.emit(EVENTS.DIFFICULTY_CHANGE, {
        from: prev,
        to: this.currentLevel,
        strategy: 'manual',
        metrics: this.getMetrics(),
      });
    }
  },
  
  /**
   * 重置指標
   */
  reset() {
    this.metrics.recentAccuracy = [];
    this.metrics.recentTimes = [];
    this.metrics.recentWPM = [];
    this.metrics.consecutiveErrors = 0;
    this.metrics.consecutiveSuccess = 0;
    this.metrics.consecutiveSlow = 0;
    this.metrics.frustrationLevel = 0;
    this.metrics.engagementLevel = 50;
    this.metrics.currentStrategy = null;
    this.metrics.lastAdjustment = null;
  },
};

// 監聽打字事件
EventBus.on(EVENTS.QUESTION_CORRECT, ({ time, wpm }) => {
  AdaptiveEngine.recordAnswer({ correct: true, time, wpm });
});

EventBus.on(EVENTS.QUESTION_WRONG, ({ time }) => {
  AdaptiveEngine.recordAnswer({ correct: false, time });
});

export { AdaptiveEngine, DIFFICULTY_LEVELS, THRESHOLDS };