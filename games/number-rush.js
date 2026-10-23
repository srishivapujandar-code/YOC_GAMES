/**
 * YOC GAMES - Game 4: Number Rush & Emoji Mystery
 * 3-Level fast-paced reflex sequence + emoji rebus decoding challenge.
 * Level 1: Speed Scout (Numbers 1 to 12)
 * Level 2: Grid Master (Numbers 1 to 20)
 * Level 3: Emoji Decoders (3 Visual Rebus Riddles)
 */
import { sound } from '../audio.js';

export const RUSH_LEVELS = [
  {
    level: 1,
    name: "Speed Scout (1 to 12)",
    type: "numbers",
    totalNumbers: 12,
    cols: 4,
    timeLimit: 45,
    ptsPerUnit: 10,
    maxBonus: 40
  },
  {
    level: 2,
    name: "Grid Master (1 to 20)",
    type: "numbers",
    totalNumbers: 20,
    cols: 5,
    timeLimit: 60,
    ptsPerUnit: 8,
    maxBonus: 40
  },
  {
    level: 3,
    name: "Emoji Decoders (3 Clues)",
    type: "emojis",
    clues: [
      { clue: "🌧️ + 🌈", answer: "Rainbow", options: ["Rainbow", "Thunderstorm", "Sunshine", "Snowfall"] },
      { clue: "🐝 + 🍯", answer: "Honey", options: ["Butter", "Honey", "Candy", "Flower"] },
      { clue: "🧠 + 🌩️", answer: "Brainstorm", options: ["Thunder", "Brainstorm", "Dream", "Idea"] }
    ],
    timeLimit: 60,
    ptsPerUnit: 50,
    maxBonus: 50
  }
];

export class NumberRushGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.announce = options.announce || (() => {});

    this.currentLevelIndex = 0;
    this.levelScores = [0, 0, 0];
    this.totalScore = 0;

    // Current level dynamic state
    this.targetNumber = 1;
    this.totalNumbers = 12;
    this.emojiIdx = 0;
    this.timeRemaining = 45;
    this.timer = null;
    this.isLevelActive = false;
    this.isCompleted = false;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper rush-game">
        <header class="game-header">
          <div class="game-header-info">
            <span class="game-tag">GAME 04</span>
            <h2 class="game-headline">Number Rush & Emoji Mystery</h2>
            <p class="game-desc">A progressive reflex and logic test across 3 levels: scout 1–12, master 1–20, then decode visual emoji rebuses.</p>
          </div>
          <div class="game-badge-chip" id="rush-phase-badge">LEVEL 1/3: Speed Scout (1 to 12)</div>
        </header>

        <!-- Stats Grid -->
        <div class="hud-stats-grid" role="region" aria-label="Game 4 Statistics">
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⏱</span>
            <span class="hud-stat-label">Time Remaining</span>
            <strong class="hud-stat-val timer-val" id="rush-timer">00:45</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">🎯</span>
            <span class="hud-stat-label">Current Target</span>
            <strong class="hud-stat-val target-badge" id="rush-target-badge">Find: 1</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⭐</span>
            <span class="hud-stat-label">Game 4 Score (g4)</span>
            <strong class="hud-stat-val score-highlight" id="rush-score">0</strong>
          </div>
        </div>

        <!-- Level Indicator Dots -->
        <div class="cb-panel-header" style="margin-bottom: 14px;">
          <div>
            <h3 id="rush-arena-title">Level 1: Speed Scout (1 to 12)</h3>
            <p class="text-muted text-sm" id="rush-arena-desc">Tap numbers 1 to 12 rapidly in ascending order.</p>
          </div>
          <div class="rush-round-dots" aria-label="Game 4 Level Progress">
            <span class="dot-indicator active" id="rush-dot-1">1</span>
            <span class="dot-indicator" id="rush-dot-2">2</span>
            <span class="dot-indicator" id="rush-dot-3">3</span>
          </div>
        </div>

        <!-- Main Arena Container -->
        <div class="rush-arena-box" id="rush-arena">
          <!-- Numbers Panel (Levels 1 & 2) -->
          <div class="rush-phase-panel" id="phase-numbers">
            <div class="number-grid-container" id="number-grid" style="--rush-cols: 4;"></div>
          </div>

          <!-- Emoji Mystery Panel (Level 3) -->
          <div class="rush-phase-panel hidden" id="phase-emojis">
            <div class="emoji-mystery-card">
              <div class="emoji-display" id="emoji-clue-box">🌧️ + 🌈</div>
              <div class="emoji-options-grid" id="emoji-options"></div>
            </div>
          </div>

          <div id="rush-feedback-msg" class="rush-feedback-banner" role="status" aria-live="polite">
            Find and tap number 1 to begin!
          </div>
        </div>

        <!-- Level Completion / Transition Modal -->
        <dialog id="rush-modal" class="yoc-dialog">
          <div class="dialog-content">
            <div class="dialog-icon" id="rush-modal-icon">🎉</div>
            <h3 id="rush-modal-title">Level 1 Completed!</h3>
            <p class="text-muted" id="rush-modal-desc">Incredible reflexes! You solved Level 1.</p>
            
            <div class="dialog-stat-box">
              <span class="dialog-stat-label">Level Score Earned</span>
              <strong class="dialog-stat-number" id="rush-modal-score">+0 pts</strong>
            </div>

            <div class="dialog-footer">
              <button class="btn btn-primary full-width" id="rush-modal-finish-btn" type="button">
                Advance to Level 2 (Grid Master 1–20) →
              </button>
            </div>
          </div>
        </dialog>
      </div>
    `;

    this.bindEvents();
    this.initLevel(0);
  }

  bindEvents() {
    const finishBtn = this.container.querySelector('#rush-modal-finish-btn');
    finishBtn.addEventListener('click', () => {
      this.container.querySelector('#rush-modal').close();

      if (this.currentLevelIndex < RUSH_LEVELS.length - 1) {
        this.currentLevelIndex++;
        this.initLevel(this.currentLevelIndex);
      } else {
        this.announce(`Game 4 completed all 3 levels! Final Score: ${this.totalScore}`);
        this.onComplete(this.totalScore, {
          levelScores: this.levelScores
        });
      }
    });
  }

  initLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    const cfg = RUSH_LEVELS[levelIndex];

    this.timeRemaining = cfg.timeLimit;
    this.isLevelActive = true;
    this.updateHUD();
    this.updateLevelDots();

    const badge = this.container.querySelector('#rush-phase-badge');
    const title = this.container.querySelector('#rush-arena-title');
    const desc = this.container.querySelector('#rush-arena-desc');
    const pNumbers = this.container.querySelector('#phase-numbers');
    const pEmojis = this.container.querySelector('#phase-emojis');
    const fb = this.container.querySelector('#rush-feedback-msg');

    badge.textContent = `LEVEL ${cfg.level}/3: ${cfg.name}`;
    title.textContent = `Level ${cfg.level}: ${cfg.name}`;

    if (cfg.type === 'numbers') {
      pNumbers.classList.remove('hidden');
      pEmojis.classList.add('hidden');
      desc.textContent = `Tap numbers 1 to ${cfg.totalNumbers} in ascending order as fast as possible!`;
      fb.textContent = `Find and tap number 1 to begin!`;
      fb.className = 'rush-feedback-banner';

      this.initNumberGrid(cfg.totalNumbers, cfg.cols);
    } else {
      pNumbers.classList.add('hidden');
      pEmojis.classList.remove('hidden');
      desc.textContent = `Decode all 3 emoji rebus riddles by selecting the correct concept!`;
      fb.textContent = `Select the word represented by the emoji equation.`;
      fb.className = 'rush-feedback-banner';

      this.emojiIdx = 0;
      this.loadEmojiQuestion();
    }

    this.startTimer();
  }

  initNumberGrid(total, cols) {
    this.targetNumber = 1;
    this.totalNumbers = total;

    const grid = this.container.querySelector('#number-grid');
    grid.style.setProperty('--rush-cols', cols);
    grid.innerHTML = '';

    // Shuffle 1..total
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    numbers.forEach(num => {
      const btn = document.createElement('button');
      btn.className = `num-tile ${num === 1 ? 'next-target' : ''}`;
      btn.textContent = num;
      btn.type = 'button';
      btn.dataset.num = num;
      btn.setAttribute('aria-label', `Number ${num}`);

      btn.addEventListener('click', () => this.handleNumberClick(btn, num));
      grid.appendChild(btn);
    });

    this.container.querySelector('#rush-target-badge').textContent = `Find: ${this.targetNumber}`;
  }

  handleNumberClick(btn, num) {
    if (!this.isLevelActive) return;

    if (num === this.targetNumber) {
      sound.playStep(num);
      btn.classList.add('found');
      btn.classList.remove('next-target');
      btn.disabled = true;

      const cfg = RUSH_LEVELS[this.currentLevelIndex];
      this.levelScores[this.currentLevelIndex] += cfg.ptsPerUnit;
      this.totalScore = this.levelScores.reduce((a, b) => a + b, 0);
      this.container.querySelector('#rush-score').textContent = this.totalScore;

      this.targetNumber++;

      if (this.targetNumber > this.totalNumbers) {
        // Level Numbers Solved!
        this.completeCurrentLevel();
      } else {
        this.container.querySelector('#rush-target-badge').textContent = `Find: ${this.targetNumber}`;
        const nextBtn = this.container.querySelector(`.num-tile[data-num="${this.targetNumber}"]`);
        if (nextBtn) nextBtn.classList.add('next-target');
      }
    } else {
      sound.playInvalid();
      btn.classList.add('wrong-shake');
      setTimeout(() => btn.classList.remove('wrong-shake'), 400);
      const feedback = this.container.querySelector('#rush-feedback-msg');
      feedback.textContent = `Incorrect! Look for ${this.targetNumber}.`;
      feedback.className = 'rush-feedback-banner warning';
    }
  }

  loadEmojiQuestion() {
    const cfg = RUSH_LEVELS[2]; // Level 3
    if (this.emojiIdx >= cfg.clues.length) {
      this.completeCurrentLevel();
      return;
    }

    const q = cfg.clues[this.emojiIdx];
    this.container.querySelector('#emoji-clue-box').textContent = q.clue;
    this.container.querySelector('#rush-target-badge').textContent = `Riddle ${this.emojiIdx + 1} / ${cfg.clues.length}`;

    const optGrid = this.container.querySelector('#emoji-options');
    optGrid.innerHTML = '';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary emoji-opt-btn';
      btn.textContent = opt;
      btn.type = 'button';

      btn.addEventListener('click', () => {
        if (!this.isLevelActive) return;

        if (opt === q.answer) {
          sound.playValidPlacement();
          btn.classList.add('btn-success');

          this.levelScores[2] += cfg.ptsPerUnit;
          this.totalScore = this.levelScores.reduce((a, b) => a + b, 0);
          this.container.querySelector('#rush-score').textContent = this.totalScore;

          const fb = this.container.querySelector('#rush-feedback-msg');
          fb.textContent = `✓ Correct! "${q.clue}" is indeed "${q.answer}"!`;
          fb.className = 'rush-feedback-banner success';

          setTimeout(() => {
            this.emojiIdx++;
            this.loadEmojiQuestion();
          }, 500);
        } else {
          sound.playInvalid();
          btn.classList.add('wrong-shake');
          const fb = this.container.querySelector('#rush-feedback-msg');
          fb.textContent = `Not quite right! Try another option.`;
          fb.className = 'rush-feedback-banner warning';
        }
      });

      optGrid.appendChild(btn);
    });
  }

  completeCurrentLevel(timeout = false) {
    this.isLevelActive = false;
    clearInterval(this.timer);

    const cfg = RUSH_LEVELS[this.currentLevelIndex];
    let levelGained = this.levelScores[this.currentLevelIndex];

    if (!timeout) {
      sound.playVictory();
      const timeBonus = Math.min(cfg.maxBonus, Math.max(0, Math.floor(this.timeRemaining * 1.5)));
      this.levelScores[this.currentLevelIndex] += timeBonus;
      levelGained = this.levelScores[this.currentLevelIndex];
      this.totalScore = this.levelScores.reduce((a, b) => a + b, 0);
      this.container.querySelector('#rush-score').textContent = this.totalScore;
    } else {
      sound.playInvalid();
    }

    this.onProgress({
      level: this.currentLevelIndex + 1,
      levelScore: levelGained,
      score: this.totalScore
    });

    // Show Level Completion Dialog
    const dialog = this.container.querySelector('#rush-modal');
    const modalIcon = this.container.querySelector('#rush-modal-icon');
    const modalTitle = this.container.querySelector('#rush-modal-title');
    const modalDesc = this.container.querySelector('#rush-modal-desc');
    const modalScore = this.container.querySelector('#rush-modal-score');
    const finishBtn = this.container.querySelector('#rush-modal-finish-btn');

    modalIcon.textContent = timeout ? '⏱' : '🎉';
    modalScore.textContent = `+${levelGained} pts (Level ${this.currentLevelIndex + 1} / 3)`;

    if (this.currentLevelIndex === 0) {
      modalTitle.textContent = timeout ? 'Level 1 Time Expired' : 'Level 1: Speed Scout Mastered!';
      modalDesc.textContent = timeout
        ? 'Time ran out! Moving to Level 2 (Grid Master 1–20).'
        : 'Superb reflex speed! You successfully scouted 1 to 12.';
      finishBtn.textContent = 'Advance to Level 2 (Grid Master 1–20) →';
    } else if (this.currentLevelIndex === 1) {
      modalTitle.textContent = timeout ? 'Level 2 Time Expired' : 'Level 2: Grid Master Cleared!';
      modalDesc.textContent = timeout
        ? 'Time ran out! Advancing to Level 3 (Emoji Decoders).'
        : 'Outstanding focus! All 20 numbers found in record time.';
      finishBtn.textContent = 'Advance to Level 3 (Emoji Decoders) →';
    } else {
      modalTitle.textContent = timeout ? 'Game 4 Time Expired' : 'Game 4 Completed! All 3 Levels Solved!';
      modalDesc.textContent = `All 4 games complete! Total Game 4 Score: ${this.totalScore} pts.`;
      finishBtn.textContent = 'Proceed to Final Score & Submit 🏆';
    }

    dialog.showModal();
  }

  updateLevelDots() {
    for (let i = 1; i <= 3; i++) {
      const dot = this.container.querySelector(`#rush-dot-${i}`);
      if (!dot) continue;
      dot.className = 'dot-indicator';
      if (i === this.currentLevelIndex + 1) {
        dot.classList.add('active');
      } else if (i < this.currentLevelIndex + 1) {
        dot.classList.add('completed');
      }
    }
  }

  updateHUD() {
    const timerEl = this.container.querySelector('#rush-timer');
    const m = Math.floor(this.timeRemaining / 60);
    const s = this.timeRemaining % 60;
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    timerEl.classList.remove('urgent');
    this.container.querySelector('#rush-score').textContent = this.totalScore;
  }

  startTimer() {
    clearInterval(this.timer);
    const timerEl = this.container.querySelector('#rush-timer');

    this.timer = setInterval(() => {
      if (!this.isLevelActive) {
        clearInterval(this.timer);
        return;
      }

      this.timeRemaining--;
      const m = Math.floor(this.timeRemaining / 60);
      const s = this.timeRemaining % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      if (this.timeRemaining <= 10) {
        timerEl.classList.add('urgent');
      }

      if (this.timeRemaining <= 0) {
        this.completeCurrentLevel(true);
      }
    }, 1000);
  }

  destroy() {
    clearInterval(this.timer);
    this.isLevelActive = false;
    this.isCompleted = true;
  }
}
