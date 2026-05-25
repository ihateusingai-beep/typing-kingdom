/**
 * Storage Manager — localStorage 管理
 */

const StorageManager = {
  PREFIX: 'tk_', // TypeKingdom prefix
  
  /**
   * 保存數據
   */
  set(key, value) {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, data);
      return true;
    } catch (e) {
      console.error('StorageManager: Failed to save', key, e);
      return false;
    }
  },
  
  /**
   * 讀取數據
   */
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(this.PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('StorageManager: Failed to load', key, e);
      return defaultValue;
    }
  },
  
  /**
   * 刪除數據
   */
  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },
  
  /**
   * 清空所有數據
   */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
  
  /**
   * 獲取所有 key
   */
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.PREFIX)) {
        keys.push(key.replace(this.PREFIX, ''));
      }
    }
    return keys;
  },
  
  // === 玩家數據 ===
  PLAYER_KEY: 'player',
  
  savePlayer(player) {
    return this.set(this.PLAYER_KEY, player);
  },
  
  loadPlayer() {
    return this.get(this.PLAYER_KEY, this._defaultPlayer());
  },
  
  _defaultPlayer() {
    return {
      id: 'player_' + Date.now(),
      name: '打字王',
      avatar: 'hero',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      settings: {
        difficulty: 3,
        soundEnabled: true,
        fontSize: 'medium',
        theme: 'fantasy',
      },
      progress: {
        currentWorld: 1,
        currentLevel: 1,
        totalStars: 0,
        totalCoins: 0,
        completedLevels: [],
      },
      stats: {
        totalQuestions: 0,
        correctAnswers: 0,
        totalTime: 0,
        longestStreak: 0,
        bestWPM: 0,
      },
      badges: [],
    };
  },
  
  // === 進度數據 ===
  PROGRESS_KEY: 'progress',
  
  saveProgress(progress) {
    return this.set(this.PROGRESS_KEY, progress);
  },
  
  loadProgress() {
    return this.get(this.PROGRESS_KEY, {
      completedLevels: [],
      totalStars: 0,
      totalCoins: 0,
    });
  },
  
  // === 設置 ===
  SETTINGS_KEY: 'settings',
  
  saveSettings(settings) {
    return this.set(this.SETTINGS_KEY, settings);
  },
  
  loadSettings() {
    return this.get(this.SETTINGS_KEY, {
      soundEnabled: true,
      fontSize: 'medium',
      theme: 'fantasy',
      difficulty: 3,
    });
  },
  
  // === 導出/導入 ===
  exportAll() {
    const data = {};
    this.getAllKeys().forEach(key => {
      data[key] = this.get(key);
    });
    return JSON.stringify(data, null, 2);
  },
  
  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      Object.keys(data).forEach(key => {
        this.set(key, data[key]);
      });
      return true;
    } catch (e) {
      console.error('StorageManager: Import failed', e);
      return false;
    }
  },
};

export { StorageManager };