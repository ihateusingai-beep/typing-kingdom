/**
 * State Machine — 狀態機
 * 清晰定義遊戲流程，防止意外狀態轉換
 */

import { EventBus, EVENTS } from './event-bus.js';

const StateMachine = {
  // 當前狀態
  currentState: 'IDLE',
  
  // 狀態歷史（用於調試）
  history: [],
  
  // 狀態定義
  states: {
    IDLE: {
      description: '初始畫面',
      transitions: ['to LOGIN'],
    },
    LOGIN: {
      description: '登入/選擇角色',
      transitions: ['to MAIN_MENU'],
    },
    MAIN_MENU: {
      description: '主選單',
      transitions: ['to WORLD_MAP', 'to SELF_LEARNING', 'to ADVENTURE', 'to SETTINGS', 'to ADMIN'],
    },
    WORLD_MAP: {
      description: '世界地圖',
      transitions: ['to PLAYING', 'to MAIN_MENU'],
    },
    SELF_LEARNING: {
      description: '自學模式',
      transitions: ['to PLAYING', 'to MAIN_MENU'],
    },
    ADVENTURE: {
      description: '冒險模式章節選單',
      transitions: ['to WORLD_MAP', 'to PLAYING'],
    },
    PLAYING: {
      description: '遊戲中',
      transitions: ['to LEVEL_COMPLETE', 'to GAME_OVER', 'to PAUSED', 'to MAIN_MENU'],
    },
    PAUSED: {
      description: '暫停',
      transitions: ['to PLAYING', 'to MAIN_MENU'],
    },
    LEVEL_COMPLETE: {
      description: '關卡完成',
      transitions: ['to WORLD_MAP', 'to PLAYING', 'to MAIN_MENU'],
    },
    GAME_OVER: {
      description: '遊戲結束',
      transitions: ['to PLAYING', 'to MAIN_MENU'],
    },
    SETTINGS: {
      description: '設置頁面',
      transitions: ['to MAIN_MENU'],
    },
    ADMIN: {
      description: 'Admin管理',
      transitions: ['to MAIN_MENU'],
    },
  },
  
  // 允許的狀態轉換
  allowedTransitions: {
    IDLE: ['LOGIN'],
    LOGIN: ['MAIN_MENU'],
    MAIN_MENU: ['WORLD_MAP', 'SELF_LEARNING', 'ADVENTURE', 'SETTINGS', 'ADMIN'],
    WORLD_MAP: ['PLAYING', 'MAIN_MENU'],
    SELF_LEARNING: ['PLAYING', 'MAIN_MENU'],
    ADVENTURE: ['WORLD_MAP', 'PLAYING'],
    PLAYING: ['LEVEL_COMPLETE', 'GAME_OVER', 'PAUSED', 'MAIN_MENU'],
    PAUSED: ['PLAYING', 'MAIN_MENU'],
    LEVEL_COMPLETE: ['WORLD_MAP', 'PLAYING', 'MAIN_MENU'],
    GAME_OVER: ['PLAYING', 'MAIN_MENU'],
    SETTINGS: ['MAIN_MENU'],
    ADMIN: ['MAIN_MENU'],
  },
  
  // 轉換狀態
  transition(to) {
    const from = this.currentState;
    const allowed = this.allowedTransitions[from] || [];
    
    if (!allowed.includes(to)) {
      console.warn(`StateMachine: Invalid transition ${from} → ${to}`);
      return false;
    }
    
    // 記錄歷史
    this.history.push({ from, to, timestamp: Date.now() });
    if (this.history.length > 50) this.history.shift(); // 最多50條
    
    // 更新狀態
    this.currentState = to;
    
    // 發布事件
    EventBus.emit(EVENTS.STATE_CHANGE, { from, to });
    
    return true;
  },
  
  // 獲取當前狀態
  getState() {
    return this.currentState;
  },
  
  // 獲取可用轉換
  getAvailableTransitions() {
    return this.allowedTransitions[this.currentState] || [];
  },
  
  // 獲取狀態描述
  getStateDescription(state = this.currentState) {
    return this.states[state]?.description || '未知狀態';
  },
  
  // 是否處於遊戲中
  isPlaying() {
    return this.currentState === 'PLAYING';
  },
  
  // 重置
  reset() {
    this.currentState = 'IDLE';
    this.history = [];
    EventBus.emit(EVENTS.STATE_CHANGE, { from: null, to: 'IDLE' });
  },
  
  // 獲取歷史
  getHistory() {
    return [...this.history];
  },
};

export { StateMachine };