/**
 * YOC GAMES - Universal Web Audio Synthesizer
 * Zero-dependency procedural sound engine for all 4 games.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = typeof localStorage !== 'undefined' ? localStorage.getItem('yoc_sound_muted') === 'true' : false;
    this.initGestureListener();
  }

  initGestureListener() {
    if (typeof document === 'undefined') return;
    const unlock = () => {
      this.ensureContext();
      ['click', 'keydown', 'pointerdown'].forEach(evt => {
        document.removeEventListener(evt, unlock);
      });
    };
    ['click', 'keydown', 'pointerdown'].forEach(evt => {
      document.addEventListener(evt, unlock, { passive: true });
    });
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yoc_sound_muted', this.muted);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.1, delay = 0) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // AudioContext might be blocked or unavailable
      }
    }, delay * 1000);
  }

  vibrate(pattern = 15) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  playClick() {
    this.vibrate(12);
    this.playTone(600, 'sine', 0.04, 0.05);
  }

  playStep(index = 1) {
    this.vibrate(15);
    const base = 320 + Math.min(index * 14, 380);
    this.playTone(base, 'triangle', 0.06, 0.08);
  }

  playCheckpoint(num = 1) {
    this.vibrate(25);
    const base = 440 + (num * 35);
    this.playTone(base, 'sine', 0.14, 0.12);
    this.playTone(base * 1.5, 'sine', 0.18, 0.08, 0.05);
  }

  playValidPlacement() {
    this.vibrate(20);
    this.playTone(523.25, 'sine', 0.08, 0.12);
    this.playTone(659.25, 'sine', 0.12, 0.12, 0.06);
    this.playTone(783.99, 'sine', 0.18, 0.14, 0.12);
  }

  playInvalid() {
    this.vibrate([40, 50, 40]);
    this.playTone(180, 'sawtooth', 0.15, 0.12);
    this.playTone(140, 'sawtooth', 0.2, 0.15, 0.08);
  }

  playHint() {
    this.playTone(659.25, 'sine', 0.1, 0.1);
    this.playTone(880.00, 'sine', 0.15, 0.12, 0.08);
  }

  playCodeCheck(allCorrect = false) {
    if (allCorrect) {
      this.playVictory();
    } else {
      this.playTone(440, 'triangle', 0.09, 0.08);
      this.playTone(550, 'triangle', 0.12, 0.08, 0.06);
    }
  }

  playVictory() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.25, 0.14, idx * 0.09);
    });
    setTimeout(() => {
      this.playTone(880, 'sine', 0.5, 0.18);
      this.playTone(1108.73, 'sine', 0.55, 0.15, 0.05);
    }, 400);
  }
}

export const sound = new SoundEngine();
