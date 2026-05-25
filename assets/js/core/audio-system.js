/**
 * Audio System — 音效系統
 * Web Audio API 驅動
 */

const AudioSystem = {
  ctx: null,
  enabled: true,
  volume: 0.1,
  
  /**
   * 初始化
   */
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  
  /**
   * 播放音調
   */
  playTone(freq, type = 'sine', duration = 0.2, vol = 0.1, slideTo = null) {
    if (!this.enabled) return;
    this.init();
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    }
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + duration);
  },
  
  /**
   * 播放音效
   */
  correct() {
    this.playTone(880, 'sine', 0.2, this.volume);
    setTimeout(() => this.playTone(1108, 'sine', 0.3, this.volume), 50);
  },
  
  wrong() {
    this.playTone(150, 'triangle', 0.3, this.volume * 1.5, 100);
  },
  
  click() {
    this.playTone(1200, 'sine', 0.03, 0.02);
  },
  
  levelUp() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, this.volume), i * 80);
    });
  },
  
  win() {
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.2, this.volume), i * 120);
    });
  },
  
  lose() {
    [392, 370, 349, 330].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.4, this.volume), i * 300);
    });
  },
  
  coin() {
    this.playTone(1318, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(1975, 'sine', 0.2, 0.05), 80);
  },
  
  powerUp() {
    this.playTone(440, 'sine', 0.1, this.volume);
    setTimeout(() => this.playTone(554, 'sine', 0.1, this.volume), 60);
    setTimeout(() => this.playTone(659, 'sine', 0.2, this.volume), 120);
  },
  
  /**
   * 設置音量
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  },
  
  /**
   * 開/關
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  },
  
  /**
   * 切換
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },
};

export { AudioSystem };