/**
 * YOC GAMES - Game 1: Code Breaker
 * Logic deduction challenge. Players crack secret multi-digit codes using position/value clues.
 */
import { sound } from '../audio.js';

export class CodeBreakerGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.announce = options.announce || (() => {});

    this.roundSettings = [
      { name: "Easy", digits: 3, maxAttempts: 6, seconds: 120, maxScore: 100 },
      { name: "Medium", digits: 4, maxAttempts: 8, seconds: 150, maxScore: 150 },
      { name: "Hard", digits: 5, maxAttempts: 10, seconds: 180, maxScore: 200 }
    ];

    this.roundIndex = 0;
    this.secretCode = "";
    this.attempts = 0;
    this.timeLeft = 0;
    this.hintsUsed = 0;
    this.roundPoints = 0;
    this.roundScores = [];
    this.timer = null;
    this.roundActive = false;
    this.guessHistory = [];

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper cb-game">
        <header class="game-header">
          <div class="game-header-info">
            <span class="game-tag">GAME 01</span>
            <h2 class="game-headline">Code Breaker Challenge</h2>
            <p class="game-desc">Deduce the secret code using logic and color-coded feedback clues.</p>
          </div>
          <div class="game-badge-chip" id="cb-level-badge">ROUND 1: EASY</div>
        </header>

        <!-- Stats Grid -->
        <div class="hud-stats-grid" role="region" aria-label="Game 1 Statistics">
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⏱</span>
            <span class="hud-stat-label">Time Remaining</span>
            <strong class="hud-stat-val timer-val" id="cb-timer" aria-live="polite">02:00</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">🎯</span>
            <span class="hud-stat-label">Attempts</span>
            <strong class="hud-stat-val" id="cb-attempts">0 / 6</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⭐</span>
            <span class="hud-stat-label">Game 1 Score (g1)</span>
            <strong class="hud-stat-val score-highlight" id="cb-total-score">0</strong>
          </div>
        </div>

        <!-- Main Challenge Arena -->
        <div class="cb-arena-panel">
          <div class="cb-panel-header">
            <div>
              <h3 id="cb-round-title">Round 1: 3-Digit Code</h3>
              <p class="text-muted text-sm" id="cb-round-instruction">Enter 3 distinct digits between 0 and 9.</p>
            </div>
            <div class="cb-round-dots" aria-label="Round progress">
              <span class="dot-indicator active" id="cb-dot-0">1</span>
              <span class="dot-indicator" id="cb-dot-1">2</span>
              <span class="dot-indicator" id="cb-dot-2">3</span>
            </div>
          </div>

          <!-- Code Input Row -->
          <div class="cb-input-zone">
            <label for="cb-guess-input" class="sr-only">Enter secret code guess</label>
            <input 
              type="text" 
              id="cb-guess-input" 
              class="cb-large-input" 
              placeholder="•••" 
              inputmode="numeric" 
              maxlength="3" 
              autocomplete="off"
              aria-label="Code guess input"
              aria-describedby="cb-feedback-msg"
            />
            
            <div class="cb-action-buttons">
              <button class="btn btn-primary btn-glow" id="cb-btn-check" type="button">
                <span>Check Code</span> ↵
              </button>
              <button class="btn btn-secondary" id="cb-btn-hint" type="button" title="Reveal one correct digit (-10 points)">
                💡 Hint (-10 pts)
              </button>
            </div>
          </div>

          <!-- Virtual Keypad for ease of touch / mouse play -->
          <div class="cb-keypad" role="group" aria-label="Numeric Keypad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `
              <button class="keypad-btn" type="button" data-val="${n}">${n}</button>
            `).join('')}
            <button class="keypad-btn keypad-special" type="button" id="cb-key-back">⌫</button>
            <button class="keypad-btn keypad-special keypad-clear" type="button" id="cb-key-clear">C</button>
          </div>

          <!-- Live Feedback Message -->
          <div id="cb-feedback-msg" class="cb-feedback-banner" role="status" aria-live="polite">
            Enter your first guess above and press Check Code.
          </div>

          <!-- Clue Legend -->
          <div class="cb-legend" aria-hidden="true">
            <div class="legend-item"><span class="badge-dot dot-green"></span> <b>Correct Position</b></div>
            <div class="legend-item"><span class="badge-dot dot-yellow"></span> <b>Misplaced Digit</b></div>
            <div class="legend-item"><span class="badge-dot dot-gray"></span> <b>Not in Code</b></div>
          </div>

          <!-- Guess History -->
          <div class="cb-history-box">
            <div class="history-header">
              <h4>Previous Guesses</h4>
              <span id="cb-history-count" class="text-muted text-sm">0 guesses</span>
            </div>
            <div id="cb-history-list" class="cb-history-list" role="log" aria-label="History of previous guesses">
              <div class="empty-state-muted">No guesses made yet for this round.</div>
            </div>
          </div>
        </div>

        <!-- Round Completion / Victory Modal -->
        <dialog id="cb-modal" class="yoc-dialog">
          <div class="dialog-content">
            <div class="dialog-icon" id="cb-modal-icon">🎉</div>
            <h3 id="cb-modal-title">Round Complete!</h3>
            <p id="cb-modal-desc" class="text-muted"></p>
            
            <div class="dialog-stat-box">
              <span class="dialog-stat-label">Points Earned This Round</span>
              <strong class="dialog-stat-number" id="cb-modal-pts">+0</strong>
            </div>

            <p class="text-sm text-muted">Secret Code was: <b id="cb-modal-code" class="highlight-code">---</b></p>
            
            <div class="dialog-footer">
              <button class="btn btn-primary full-width" id="cb-modal-next-btn" type="button">
                Next Round →
              </button>
            </div>
          </div>
        </dialog>
      </div>
    `;

    this.bindEvents();
    this.startRound(0);
  }

  bindEvents() {
    const input = this.container.querySelector('#cb-guess-input');
    const checkBtn = this.container.querySelector('#cb-btn-check');
    const hintBtn = this.container.querySelector('#cb-btn-hint');
    const backBtn = this.container.querySelector('#cb-key-back');
    const clearBtn = this.container.querySelector('#cb-key-clear');
    const modalNextBtn = this.container.querySelector('#cb-modal-next-btn');

    checkBtn.addEventListener('click', () => this.checkGuess());
    hintBtn.addEventListener('click', () => this.useHint());

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.checkGuess();
      }
    });

    // Keypad numbers
    this.container.querySelectorAll('.keypad-btn[data-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const settings = this.roundSettings[this.roundIndex];
        if (input.value.length < settings.digits) {
          input.value += btn.dataset.val;
          input.focus();
        }
      });
    });

    backBtn.addEventListener('click', () => {
      sound.playClick();
      input.value = input.value.slice(0, -1);
      input.focus();
    });

    clearBtn.addEventListener('click', () => {
      sound.playClick();
      input.value = '';
      input.focus();
    });

    modalNextBtn.addEventListener('click', () => {
      const dialog = this.container.querySelector('#cb-modal');
      dialog.close();
      if (this.roundIndex < this.roundSettings.length - 1) {
        this.startRound(this.roundIndex + 1);
      } else {
        this.finishAllRounds();
      }
    });
  }

  generateSecret(length) {
    let code = "";
    while (code.length < length) {
      const digit = Math.floor(Math.random() * 10).toString();
      if (!code.includes(digit)) {
        code += digit;
      }
    }
    return code;
  }

  startRound(idx) {
    clearInterval(this.timer);
    this.roundIndex = idx;
    const s = this.roundSettings[this.roundIndex];

    this.secretCode = this.generateSecret(s.digits);
    this.attempts = 0;
    this.hintsUsed = 0;
    this.roundPoints = 0;
    this.timeLeft = s.seconds;
    this.roundActive = true;
    this.guessHistory = [];

    // UI Updates
    const badge = this.container.querySelector('#cb-level-badge');
    badge.textContent = `ROUND ${idx + 1}: ${s.name.toUpperCase()}`;

    const title = this.container.querySelector('#cb-round-title');
    title.textContent = `Round ${idx + 1}: ${s.digits}-Digit Code (${s.name})`;

    const inst = this.container.querySelector('#cb-round-instruction');
    inst.textContent = `Enter ${s.digits} distinct digits. Maximum ${s.maxAttempts} attempts. Max score: ${s.maxScore} pts.`;

    const input = this.container.querySelector('#cb-guess-input');
    input.value = '';
    input.maxLength = s.digits;
    input.placeholder = '•'.repeat(s.digits);
    input.disabled = false;
    input.focus();

    const attemptsEl = this.container.querySelector('#cb-attempts');
    attemptsEl.textContent = `0 / ${s.maxAttempts}`;

    const feedback = this.container.querySelector('#cb-feedback-msg');
    feedback.textContent = `Round ${idx + 1} started! Guess the secret ${s.digits}-digit code.`;
    feedback.className = 'cb-feedback-banner';

    this.container.querySelector('#cb-history-list').innerHTML = 
      '<div class="empty-state-muted">No guesses made yet for this round.</div>';
    this.container.querySelector('#cb-history-count').textContent = '0 guesses';

    // Dot indicators
    for (let i = 0; i < 3; i++) {
      const dot = this.container.querySelector(`#cb-dot-${i}`);
      if (dot) {
        dot.classList.toggle('active', i === idx);
        dot.classList.toggle('completed', i < idx);
      }
    }

    this.announce(`Round ${idx + 1}: ${s.name} mode started. ${s.digits} digits to guess.`);
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timer);
    const timerEl = this.container.querySelector('#cb-timer');

    this.timer = setInterval(() => {
      if (!this.roundActive) {
        clearInterval(this.timer);
        return;
      }

      this.timeLeft--;
      const m = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

      if (this.timeLeft <= 10) {
        timerEl.classList.add('urgent');
      } else {
        timerEl.classList.remove('urgent');
      }

      if (this.timeLeft <= 0) {
        this.endRound(false, "Time expired!");
      }
    }, 1000);
  }

  evaluateGuess(guess) {
    let correctPos = 0;
    let correctDigit = 0;

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === this.secretCode[i]) {
        correctPos++;
      } else if (this.secretCode.includes(guess[i])) {
        correctDigit++;
      }
    }

    return {
      correctPos,
      correctDigit,
      incorrect: guess.length - correctPos - correctDigit
    };
  }

  checkGuess() {
    if (!this.roundActive) return;

    const s = this.roundSettings[this.roundIndex];
    const input = this.container.querySelector('#cb-guess-input');
    const guess = input.value.trim();
    const feedback = this.container.querySelector('#cb-feedback-msg');

    if (guess.length !== s.digits || !/^\d+$/.test(guess)) {
      sound.playInvalid();
      feedback.textContent = `Please enter exactly ${s.digits} numerical digits.`;
      feedback.className = 'cb-feedback-banner warning';
      input.focus();
      return;
    }

    if (new Set(guess).size !== guess.length) {
      sound.playInvalid();
      feedback.textContent = `All digits must be unique (no duplicate digits).`;
      feedback.className = 'cb-feedback-banner warning';
      input.focus();
      return;
    }

    this.attempts++;
    this.container.querySelector('#cb-attempts').textContent = `${this.attempts} / ${s.maxAttempts}`;

    const evalClues = this.evaluateGuess(guess);
    this.addHistoryRow(guess, evalClues);

    if (guess === this.secretCode) {
      // Calculate score with time bonus
      sound.playCodeCheck(true);
      const timeBonus = Math.floor((this.timeLeft / s.seconds) * 25);
      const basePoints = Math.max(20, s.maxScore - (this.attempts - 1) * 6 - this.hintsUsed * 10);
      this.roundPoints = Math.min(s.maxScore, basePoints + timeBonus);

      this.endRound(true, `Brilliant! Code cracked in ${this.attempts} attempt${this.attempts > 1 ? 's' : ''}!`);
      return;
    }

    sound.playCodeCheck(false);
    feedback.textContent = `${evalClues.correctPos} in correct position, ${evalClues.correctDigit} correct digits in wrong spot.`;
    feedback.className = 'cb-feedback-banner';
    this.announce(`Guess ${guess}: ${evalClues.correctPos} correct position, ${evalClues.correctDigit} misplaced.`);

    input.value = '';
    input.focus();

    if (this.attempts >= s.maxAttempts) {
      this.endRound(false, "Used all maximum attempts!");
    }
  }

  addHistoryRow(guess, clues) {
    this.guessHistory.push({ guess, clues });
    const list = this.container.querySelector('#cb-history-list');

    if (this.guessHistory.length === 1) {
      list.innerHTML = '';
    }

    const row = document.createElement('div');
    row.className = 'cb-history-row';

    const numSpan = document.createElement('span');
    numSpan.className = 'history-code';
    numSpan.textContent = guess;

    const badges = document.createElement('div');
    badges.className = 'history-badges';

    for (let i = 0; i < clues.correctPos; i++) {
      const b = document.createElement('span');
      b.className = 'badge-chip chip-green';
      b.textContent = '● Correct';
      badges.appendChild(b);
    }
    for (let i = 0; i < clues.correctDigit; i++) {
      const b = document.createElement('span');
      b.className = 'badge-chip chip-yellow';
      b.textContent = '● Misplaced';
      badges.appendChild(b);
    }
    for (let i = 0; i < clues.incorrect; i++) {
      const b = document.createElement('span');
      b.className = 'badge-chip chip-gray';
      b.textContent = '✕ Wrong';
      badges.appendChild(b);
    }

    row.appendChild(numSpan);
    row.appendChild(badges);
    list.prepend(row);

    this.container.querySelector('#cb-history-count').textContent = 
      `${this.guessHistory.length} guess${this.guessHistory.length > 1 ? 'es' : ''}`;
  }

  useHint() {
    if (!this.roundActive) return;
    const s = this.roundSettings[this.roundIndex];
    const feedback = this.container.querySelector('#cb-feedback-msg');

    if (this.hintsUsed >= s.digits - 1) {
      sound.playInvalid();
      feedback.textContent = "Maximum available hints reached for this round.";
      feedback.className = 'cb-feedback-banner warning';
      return;
    }

    sound.playHint();
    const pos = this.hintsUsed;
    this.hintsUsed++;

    feedback.textContent = `💡 Hint revealed: Digit ${pos + 1} is "${this.secretCode[pos]}" (-10 points penalty applied).`;
    feedback.className = 'cb-feedback-banner info';
    this.announce(`Hint: Digit at position ${pos + 1} is ${this.secretCode[pos]}.`);
  }

  endRound(won, msg) {
    this.roundActive = false;
    clearInterval(this.timer);

    const s = this.roundSettings[this.roundIndex];
    if (!won) {
      this.roundPoints = 0;
      sound.playInvalid();
    }

    this.roundScores.push({
      round: this.roundIndex + 1,
      name: s.name,
      score: this.roundPoints,
      won,
      attempts: this.attempts,
      code: this.secretCode
    });

    const totalScore = this.roundScores.reduce((acc, r) => acc + r.score, 0);
    this.container.querySelector('#cb-total-score').textContent = totalScore;

    // Open Modal
    const dialog = this.container.querySelector('#cb-modal');
    this.container.querySelector('#cb-modal-icon').textContent = won ? '🎉' : '⏱';
    this.container.querySelector('#cb-modal-title').textContent = won ? 'Code Cracked!' : 'Round Ended';
    this.container.querySelector('#cb-modal-desc').textContent = msg;
    this.container.querySelector('#cb-modal-pts').textContent = `+${this.roundPoints} pts`;
    this.container.querySelector('#cb-modal-code').textContent = this.secretCode;

    const nextBtn = this.container.querySelector('#cb-modal-next-btn');
    if (this.roundIndex < this.roundSettings.length - 1) {
      nextBtn.textContent = `Advance to Round ${this.roundIndex + 2} →`;
    } else {
      nextBtn.textContent = `Complete Game 1 & Proceed →`;
    }

    this.onProgress({
      roundIndex: this.roundIndex,
      roundPoints: this.roundPoints,
      totalG1Score: totalScore
    });

    dialog.showModal();
    this.announce(`Round ${this.roundIndex + 1} finished. Earned ${this.roundPoints} points.`);
  }

  finishAllRounds() {
    clearInterval(this.timer);
    const finalG1Score = this.roundScores.reduce((acc, r) => acc + r.score, 0);
    this.announce(`Game 1 Code Breaker completed! Final Game 1 Score: ${finalG1Score} points.`);
    this.onComplete(finalG1Score, this.roundScores);
  }

  destroy() {
    clearInterval(this.timer);
    this.roundActive = false;
  }
}
