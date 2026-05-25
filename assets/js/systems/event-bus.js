/**
 * Event Bus — 事件匯流排
 * 所有模組透過事件通訊，完全解耦
 */

const EventBus = {
  // 監聽者列表
  listeners: new Map(),
  
  // 訂閱事件
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // 返回取消訂閱函數
    return () => this.off(event, callback);
  },
  
  // 訂閱一次
  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  },
  
  // 發佈事件
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`EventBus error in "${event}":`, e);
        }
      });
    }
  },
  
  // 取消訂閱
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  },
  
  // 訂閱多個事件
  onMany(events, callback) {
    const unsubs = events.map(e => this.on(e, callback));
    return () => unsubs.forEach(u => u());
  },
  
  // 清空所有監聽
  clear() {
    this.listeners.clear();
  },
  
  // 調試用
  getListeners(event) {
    return this.listeners.has(event) 
      ? Array.from(this.listeners.get(event)) 
      : [];
  }
};

// 預設事件列表
const EVENTS = {
  // 遊戲事件
  GAME_START: 'game:start',
  GAME_END: 'game:end',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  
  // 打字事件
  QUESTION_SHOW: 'question:show',
  QUESTION_CORRECT: 'question:correct',
  QUESTION_WRONG: 'question:wrong',
  QUESTION_TIMEOUT: 'question:timeout',
  
  // 進度事件
  LEVEL_START: 'level:start',
  LEVEL_COMPLETE: 'level:complete',
  LEVEL_FAILED: 'level:failed',
  
  // 難度事件
  DIFFICULTY_ADJUST: 'difficulty:adjust',
  DIFFICULTY_CHANGE: 'difficulty:change',
  
  // 成就事件
  BADGE_UNLOCK: 'badge:unlock',
  STREAK_UPDATE: 'streak:update',
  
  // 狀態事件
  STATE_CHANGE: 'state:change',
  SETTINGS_CHANGE: 'settings:change',
  
  // 主題/語言事件
  THEME_CHANGE: 'theme:change',
  LANGUAGE_CHANGE: 'language:change',
};

export { EventBus, EVENTS };