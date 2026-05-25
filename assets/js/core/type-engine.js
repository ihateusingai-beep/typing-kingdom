/**
 * Type Engine — 打字引擎
 * 核心遊戲邏輯
 */

import { EventBus, EVENTS } from '../systems/event-bus.js';
import { AdaptiveEngine } from '../systems/adaptive-engine.js';
import { ProgressTracker } from '../systems/progress-tracker.js';
import { AudioSystem } from './audio-system.js';

const TypeEngine = {
  // 當前題目
  currentQuestion: null,
  currentIndex: 0,
  questions: [],
  
  // 計時
  questionStartTime: 0,
  totalTime: 0,
  
  // 狀態
  isPlaying: false,
  isPaused: false,
  
  // 難度
  difficulty: 3,
  
  /**
   * 初始化關卡
   */
  initLevel(questions, difficulty = 3) {
    this.questions = [...questions];
    this.currentIndex = 0;
    this.difficulty = difficulty;
    this.isPlaying = true;
    this.isPaused = false;
    
    // 根據難度過濾/排序題目
    this._prepareQuestions();
    
    // 顯示第一題
    this._showNextQuestion();
  },
  
  /**
   * 準備題目
   */
  _prepareQuestions() {
    // 按難度排序
    const sorted = this.questions.sort((a, b) => {
      if (a.difficulty && b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return 0;
    });
    
    // 根據難度級別選擇
    const targetLength = this._getTargetLength();
    const filtered = sorted.filter(q => {
      const len = q.text?.length || q.code?.length || 1;
      return len <= targetLength + 2;
    });
    
    this.questions = filtered.length > 0 ? filtered : sorted.slice(0, 10);
  },
  
  /**
   * 獲取目標長度
   */
  _getTargetLength() {
    switch (AdaptiveEngine.currentLevel) {
      case 1: return 1;   // 單字符
      case 2: return 2;   // 詞彙
      case 3: return 4;   // 短句
      case 4: return 8;   // 長句
      case 5: return 15;  // 文章
      default: return 4;
    }
  },
  
  /**
   * 顯示下一題
   */
  _showNextQuestion() {
    if (this.currentIndex >= this.questions.length) {
      // 關卡完成
      this._onLevelComplete();
      return;
    }
    
    this.currentQuestion = this.questions[this.currentIndex];
    this.questionStartTime = Date.now();
    
    EventBus.emit(EVENTS.QUESTION_SHOW, {
      question: this.currentQuestion,
      index: this.currentIndex,
      total: this.questions.length,
      difficulty: AdaptiveEngine.getCurrentDifficulty(),
    });
  },
  
  /**
   * 檢查答案
   */
  checkAnswer(input) {
    if (!this.isPlaying || this.isPaused) return null;
    
    const now = Date.now();
    const time = now - this.questionStartTime;
    const expected = this.currentQuestion?.code || this.currentQuestion?.text || '';
    const correct = input.toUpperCase() === expected.toUpperCase();
    
    // 計算 WPM
    const wpm = this._calculateWPM(expected.length, time);
    
    if (correct) {
      this._handleCorrect(time, wpm);
    } else {
      this._handleWrong(time);
    }
    
    return { correct, expected, time, wpm };
  },
  
  /**
   * 計算 WPM
   */
  _calculateWPM(charCount, timeMs) {
    const minutes = timeMs / 60000;
    if (minutes <= 0) return 0;
    return Math.round(charCount / 5 / minutes); // 標準：5字符 = 1 word
  },
  
  /**
   * 處理正確答案
   */
  _handleCorrect(time, wpm) {
    AudioSystem.correct();
    
    const result = ProgressTracker.recordCorrect(wpm);
    
    EventBus.emit(EVENTS.QUESTION_CORRECT, {
      question: this.currentQuestion,
      time,
      wpm,
      streak: result.streak,
    });
    
    // 自適應引擎記錄
    AdaptiveEngine.recordAnswer({ correct: true, time, wpm });
    
    this.currentIndex++;
    this._showNextQuestion();
  },
  
  /**
   * 處理錯誤答案
   */
  _handleWrong(time) {
    AudioSystem.wrong();
    
    ProgressTracker.recordWrong();
    
    EventBus.emit(EVENTS.QUESTION_WRONG, {
      question: this.currentQuestion,
      time,
      attempts: 1,
    });
    
    // 自適應引擎記錄
    AdaptiveEngine.handleWrongAnswer(1);
  },
  
  /**
   * 關卡完成
   */
  _onLevelComplete() {
    this.isPlaying = false;
    this.totalTime = Date.now() - ProgressTracker.session.startTime;
    
    const summary = ProgressTracker.endSession();
    
    EventBus.emit(EVENTS.LEVEL_COMPLETE, {
      totalQuestions: this.questions.length,
      ...summary,
    });
    
    AudioSystem.levelUp();
  },
  
  /**
   * 關卡失敗
   */
  _onLevelFailed() {
    this.isPlaying = false;
    
    EventBus.emit(EVENTS.LEVEL_FAILED, {});
    
    AudioSystem.lose();
  },
  
  /**
   * 暫停
   */
  pause() {
    this.isPaused = true;
    EventBus.emit(EVENTS.GAME_PAUSE, {});
  },
  
  /**
   * 恢復
   */
  resume() {
    this.isPaused = false;
    this.questionStartTime = Date.now(); // 重設計時
    EventBus.emit(EVENTS.GAME_RESUME, {});
  },
  
  /**
   * 停止遊戲
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.questions = [];
    this.currentQuestion = null;
  },
  
  /**
   * 獲取進度
   */
  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.questions.length,
      percentage: this.questions.length > 0 
        ? Math.round((this.currentIndex / this.questions.length) * 100)
        : 0,
    };
  },
  
  /**
   * 獲取當前題目
   */
  getCurrentQuestion() {
    return this.currentQuestion;
  },
  
  /**
   * 是否在遊戲中
   */
  isActive() {
    return this.isPlaying && !this.isPaused;
  },
};

export { TypeEngine };