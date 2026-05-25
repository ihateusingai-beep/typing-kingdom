/**
 * Score System — 評分系統
 */

const ScoreSystem = {
  /**
   * 計算關卡分數
   */
  calculateLevelScore({ correct, wrong, time, maxTime, streak }) {
    const total = correct + wrong;
    const accuracy = total > 0 ? correct / total : 0;
    
    // 基本分
    let score = correct * 100;
    
    // 準確率加成
    score += Math.round(accuracy * 500);
    
    // 時間加成（越快越好）
    if (maxTime && time < maxTime) {
      const timeBonus = Math.round((1 - time / maxTime) * 300);
      score += Math.max(0, timeBonus);
    }
    
    // 連擊加成
    score += streak * 50;
    
    return score;
  },
  
  /**
   * 計算星星數量
   */
  calculateStars(accuracy, thresholds = { star1: 0.6, star2: 0.8, star3: 0.95 }) {
    if (accuracy >= thresholds.star3) return 3;
    if (accuracy >= thresholds.star2) return 2;
    if (accuracy >= thresholds.star1) return 1;
    return 0;
  },
  
  /**
   * 計算 WPM
   */
  calculateWPM(charCount, timeMs) {
    const minutes = timeMs / 60000;
    if (minutes <= 0) return 0;
    return Math.round(charCount / 5 / minutes);
  },
  
  /**
   * 計算字符/分鐘
   */
  calculateCPM(charCount, timeMs) {
    const minutes = timeMs / 60000;
    if (minutes <= 0) return 0;
    return Math.round(charCount / minutes);
  },
  
  /**
   * 評級
   */
  getGrade(accuracy, wpm) {
    if (accuracy >= 0.95 && wpm >= 50) return 'S';
    if (accuracy >= 0.9 && wpm >= 40) return 'A';
    if (accuracy >= 0.8 && wpm >= 30) return 'B';
    if (accuracy >= 0.7 && wpm >= 20) return 'C';
    if (accuracy >= 0.6) return 'D';
    return 'F';
  },
  
  /**
   * 評級顏色
   */
  getGradeColor(grade) {
    const colors = {
      'S': 'text-yellow-400',
      'A': 'text-green-400',
      'B': 'text-blue-400',
      'C': 'text-gray-400',
      'D': 'text-orange-400',
      'F': 'text-red-400',
    };
    return colors[grade] || 'text-gray-400';
  },
  
  /**
   * 計算獎勵金幣
   */
  calculateCoins(stars, streak) {
    let coins = stars * 10;
    coins += Math.floor(streak / 5) * 5;
    return coins;
  },
};

export { ScoreSystem };