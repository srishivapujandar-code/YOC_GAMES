/**
 * YOC GAMES - Game 3: Zip Logic Challenge
 * Inspired by LinkedIn Zip puzzles.
 * Connect numbered checkpoints sequentially to create a complete continuous Hamiltonian path.
 */
import { sound } from '../audio.js';

export const ZIP_PUZZLES = {
  1: {
    id: 1,
    name: "Cadet (4×4)",
    difficulty: "EASY",
    rows: 4,
    cols: 4,
    totalCells: 16,
    baseMarks: 100,
    timeLimitSeconds: 120,
    maxBonusMarks: 50,
    checkpoints: [
      { r: 0, c: 0, num: 1 },
      { r: 2, c: 1, num: 2 },
      { r: 3, c: 1, num: 3 },
      { r: 2, c: 3, num: 4 },
      { r: 1, c: 3, num: 5 },
      { r: 0, c: 1, num: 6 }
    ],
    solution: [
      [0, 0], [1, 0], [1, 1], [2, 1],
      [2, 0], [3, 0], [3, 1], [3, 2],
      [3, 3], [2, 3], [2, 2], [1, 2],
      [1, 3], [0, 3], [0, 2], [0, 1]
    ]
  },
  2: {
    id: 2,
    name: "Navigator (5×5)",
    difficulty: "MEDIUM",
    rows: 5,
    cols: 5,
    totalCells: 25,
    baseMarks: 200,
    timeLimitSeconds: 180,
    maxBonusMarks: 100,
    checkpoints: [
      { r: 0, c: 0, num: 1 },
      { r: 0, c: 1, num: 2 },
      { r: 0, c: 3, num: 3 },
      { r: 2, c: 2, num: 4 },
      { r: 2, c: 1, num: 5 },
      { r: 3, c: 0, num: 6 },
      { r: 4, c: 2, num: 7 },
      { r: 3, c: 4, num: 8 },
      { r: 2, c: 3, num: 9 },
      { r: 0, c: 4, num: 10 }
    ],
    solution: [
      [0, 0], [1, 0], [1, 1], [0, 1], [0, 2],
      [0, 3], [1, 3], [1, 2], [2, 2], [3, 2],
      [3, 1], [2, 1], [2, 0], [3, 0], [4, 0],
      [4, 1], [4, 2], [4, 3], [4, 4], [3, 4],
      [3, 3], [2, 3], [2, 4], [1, 4], [0, 4]
    ]
  },
  3: {
    id: 3,
    name: "Grandmaster (6×6)",
    difficulty: "HARD",
    rows: 6,
    cols: 6,
    totalCells: 36,
    baseMarks: 250,
    timeLimitSeconds: 240,
    maxBonusMarks: 100,
    checkpoints: [
      { r: 0, c: 0, num: 1 },
      { r: 1, c: 1, num: 2 },
      { r: 0, c: 3, num: 3 },
      { r: 1, c: 5, num: 4 },
      { r: 1, c: 3, num: 5 },
      { r: 2, c: 2, num: 6 },
      { r: 3, c: 4, num: 7 },
      { r: 3, c: 5, num: 8 },
      { r: 5, c: 5, num: 9 },
      { r: 4, c: 4, num: 10 },
      { r: 5, c: 2, num: 11 },
      { r: 5, c: 1, num: 12 },
      { r: 4, c: 0, num: 13 },
      { r: 3, c: 1, num: 14 },
      { r: 1, c: 0, num: 15 }
    ],
    solution: [
      [0, 0], [0, 1], [1, 1], [1, 2], [0, 2], [0, 3],
      [0, 4], [0, 5], [1, 5], [1, 4], [1, 3], [2, 3],
      [2, 2], [3, 2], [3, 3], [3, 4], [2, 4], [2, 5],
      [3, 5], [4, 5], [5, 5], [5, 4], [4, 4], [4, 3],
      [5, 3], [5, 2], [4, 2], [4, 1], [5, 1], [5, 0],
      [4, 0], [3, 0], [3, 1], [2, 1], [2, 0], [1, 0]
    ]
  }
};

export class ZipGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.announce = options.announce || (() => {});

    this.levelId = 1;
    this.levelMarks = [0, 0, 0];
    this.totalMarks = 0;
    this.puzzle = ZIP_PUZZLES[this.levelId];
    this.path = []; // [[r, c], ...]
    this.nextCheckpointNum = 2;
    this.isDragging = false;
    this.isCompleted = false;
    this.undoCount = 0;
    this.elapsedSeconds = 0;
    this.timer = null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper zip-game">
        <header class="game-header">
          <div class="game-header-info">
            <span class="game-tag">GAME 03</span>
            <h2 class="game-headline">Zip Logic Challenge</h2>
            <p class="game-desc">Connect numbered checkpoints 1 → 2 → ... covering all grid squares in a continuous path.</p>
          </div>
          <div class="game-badge-chip" id="zip-level-badge">${this.puzzle.name}</div>
        </header>

        <!-- Stats Grid -->
        <div class="hud-stats-grid" role="region" aria-label="Game 3 Statistics">
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⏱</span>
            <span class="hud-stat-label">Time</span>
            <strong class="hud-stat-val timer-val" id="zip-timer">00:00</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⚡</span>
            <span class="hud-stat-label">Coverage</span>
            <strong class="hud-stat-val" id="zip-coverage">1 / ${this.puzzle.totalCells} cells</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">🎯</span>
            <span class="hud-stat-label">Next Target</span>
            <strong class="hud-stat-val target-badge" id="zip-target">2</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⭐</span>
            <span class="hud-stat-label">Game 3 Marks (g3)</span>
            <strong class="hud-stat-val score-highlight" id="zip-score">0</strong>
          </div>
        </div>

        <!-- Main Zip Area -->
        <div class="zip-arena-wrapper">
          <div class="zip-controls-bar">
            <div class="zip-level-selector">
              <button class="btn btn-sm ${this.levelId === 1 ? 'btn-primary' : 'btn-secondary'}" id="zip-btn-lvl1" type="button">Level 1 (4×4)</button>
              <button class="btn btn-sm ${this.levelId === 2 ? 'btn-primary' : 'btn-secondary'}" id="zip-btn-lvl2" type="button">Level 2 (5×5)</button>
              <button class="btn btn-sm ${this.levelId === 3 ? 'btn-primary' : 'btn-secondary'}" id="zip-btn-lvl3" type="button">Level 3 (6×6)</button>
            </div>
            <div class="zip-action-btns">
              <button class="btn btn-secondary btn-sm" id="zip-btn-undo" type="button">↩ Undo</button>
              <button class="btn btn-secondary btn-sm" id="zip-btn-hint" type="button">💡 Hint</button>
              <button class="btn btn-secondary btn-sm" id="zip-btn-reset" type="button">↺ Reset</button>
            </div>
          </div>

          <!-- Board Container with Canvas Line Overlay -->
          <div class="zip-board-outer" id="zip-board-container">
            <div class="zip-grid" id="zip-grid"></div>
            <canvas class="zip-line-canvas" id="zip-line-canvas"></canvas>
          </div>

          <div id="zip-feedback-msg" class="zip-feedback-banner" role="status" aria-live="polite">
            Drag or click adjacent squares from checkpoint 1 towards checkpoint 2.
          </div>
        </div>

        <!-- Victory Modal -->
        <dialog id="zip-modal" class="yoc-dialog">
          <div class="dialog-content">
            <div class="dialog-icon">⚡</div>
            <h3>Zip Path Complete!</h3>
            <p class="text-muted">You covered every cell on the board in perfect sequential order!</p>
            
            <div class="dialog-stat-box">
              <span class="dialog-stat-label">Total Game 3 Marks</span>
              <strong class="dialog-stat-number" id="zip-modal-score">+0 Marks</strong>
            </div>

            <div class="dialog-footer">
              <button class="btn btn-primary full-width" id="zip-modal-finish-btn" type="button">
                Complete Game 3 & Proceed →
              </button>
            </div>
          </div>
        </dialog>
      </div>
    `;

    this.initLevel(this.levelId);
    this.bindEvents();
    this.startTimer();
  }

  initLevel(lvlId) {
    this.levelId = lvlId;
    this.puzzle = ZIP_PUZZLES[lvlId];
    this.isCompleted = false;
    this.undoCount = 0;
    this.elapsedSeconds = 0;

    // Start path at checkpoint 1
    const startCp = this.puzzle.checkpoints.find(cp => cp.num === 1);
    this.path = [[startCp.r, startCp.c]];
    this.nextCheckpointNum = 2;

    this.buildGridDOM();
    this.updateHUD();
    this.renderPath();
  }

  buildGridDOM() {
    const grid = this.container.querySelector('#zip-grid');
    grid.style.setProperty('--zip-rows', this.puzzle.rows);
    grid.style.setProperty('--zip-cols', this.puzzle.cols);
    grid.innerHTML = '';

    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'zip-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `zip-cell-${r}-${c}`;

        const cp = this.puzzle.checkpoints.find(p => p.r === r && p.c === c);
        if (cp) {
          const badge = document.createElement('div');
          badge.className = 'zip-checkpoint-badge';
          badge.textContent = cp.num;
          badge.id = `zip-cp-${cp.num}`;
          cell.appendChild(badge);
        }

        grid.appendChild(cell);
      }
    }

    // Resize canvas
    this.resizeCanvas();
  }

  resizeCanvas() {
    const canvas = this.container.querySelector('#zip-line-canvas');
    const board = this.container.querySelector('#zip-board-container');
    if (!canvas || !board) return;

    const rect = board.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    this.dpr = dpr;
  }

  bindEvents() {
    const board = this.container.querySelector('#zip-board-container');
    const undoBtn = this.container.querySelector('#zip-btn-undo');
    const hintBtn = this.container.querySelector('#zip-btn-hint');
    const resetBtn = this.container.querySelector('#zip-btn-reset');
    const finishBtn = this.container.querySelector('#zip-modal-finish-btn');
    const lvl1Btn = this.container.querySelector('#zip-btn-lvl1');
    const lvl2Btn = this.container.querySelector('#zip-btn-lvl2');
    const lvl3Btn = this.container.querySelector('#zip-btn-lvl3');

    undoBtn.addEventListener('click', () => this.undoMove());
    hintBtn.addEventListener('click', () => this.useHint());
    resetBtn.addEventListener('click', () => this.resetLevel());

    lvl1Btn.addEventListener('click', () => {
      this.initLevel(1);
      this.updateLevelButtons();
    });

    lvl2Btn.addEventListener('click', () => {
      this.initLevel(2);
      this.updateLevelButtons();
    });

    if (lvl3Btn) {
      lvl3Btn.addEventListener('click', () => {
        this.initLevel(3);
        this.updateLevelButtons();
      });
    }

    finishBtn.addEventListener('click', () => {
      this.container.querySelector('#zip-modal').close();
      if (this.levelId < 3) {
        this.initLevel(this.levelId + 1);
        this.updateLevelButtons();
      } else {
        this.announce(`Game 3 Zip Challenge complete all 3 levels! Final Marks: ${this.totalMarks}`);
        this.onComplete(this.totalMarks, { levelMarks: this.levelMarks });
      }
    });

    // Pointer events on board
    board.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', () => this.handlePointerUp());
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.renderPath();
    });
  }

  getCellFromPoint(clientX, clientY) {
    const grid = this.container.querySelector('#zip-grid');
    if (!grid) return null;

    const cells = grid.querySelectorAll('.zip-cell');
    for (const cell of cells) {
      const rect = cell.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return {
          r: parseInt(cell.dataset.row, 10),
          c: parseInt(cell.dataset.col, 10)
        };
      }
    }
    return null;
  }

  handlePointerDown(e) {
    if (this.isCompleted) return;
    if (e.cancelable) e.preventDefault();
    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    this.isDragging = true;
    this.tryAddOrRetractCell(cell.r, cell.c);
  }

  handlePointerMove(e) {
    if (!this.isDragging || this.isCompleted) return;
    if (e.cancelable) e.preventDefault();
    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    this.tryAddOrRetractCell(cell.r, cell.c);
  }

  handlePointerUp() {
    this.isDragging = false;
  }

  tryAddOrRetractCell(r, c) {
    if (this.path.length === 0) return;
    const last = this.path[this.path.length - 1];

    // Same cell, do nothing
    if (last[0] === r && last[1] === c) return;

    // Check if cell is in previous path (backtrack retraction)
    const existingIdx = this.path.findIndex(([pr, pc]) => pr === r && pc === c);
    if (existingIdx >= 0) {
      // Retract path to this cell
      sound.playClick();
      this.path = this.path.slice(0, existingIdx + 1);
      this.recalculateNextCheckpoint();
      this.renderPath();
      this.updateHUD();
      return;
    }

    // Must be orthogonal neighbor (Manhattan distance = 1)
    const dist = Math.abs(last[0] - r) + Math.abs(last[1] - c);
    if (dist !== 1) return;

    // Check checkpoint constraint: cannot step on a checkpoint unless it is next in order
    const cpOnCell = this.puzzle.checkpoints.find(cp => cp.r === r && cp.c === c);
    if (cpOnCell) {
      if (cpOnCell.num !== this.nextCheckpointNum) {
        // Wrong checkpoint order!
        sound.playInvalid();
        this.container.querySelector('#zip-feedback-msg').textContent = 
          `Checkpoint ${cpOnCell.num} cannot be reached yet! Target is Checkpoint ${this.nextCheckpointNum}.`;
        return;
      }
      // Reached next checkpoint!
      sound.playCheckpoint(cpOnCell.num);
      this.nextCheckpointNum++;
    } else {
      sound.playStep(this.path.length);
    }

    this.path.push([r, c]);
    this.renderPath();
    this.updateHUD();
    this.checkWinCondition();
  }

  recalculateNextCheckpoint() {
    let nextNum = 2;
    for (const [pr, pc] of this.path) {
      const cp = this.puzzle.checkpoints.find(p => p.r === pr && p.c === pc);
      if (cp && cp.num === nextNum) {
        nextNum++;
      }
    }
    this.nextCheckpointNum = nextNum;
  }

  renderPath() {
    const canvas = this.container.querySelector('#zip-line-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const board = this.container.querySelector('#zip-board-container');
    const boardRect = board.getBoundingClientRect();

    // Mark visited cells in DOM
    const allCells = this.container.querySelectorAll('.zip-cell');
    allCells.forEach(cell => cell.classList.remove('visited', 'path-head'));

    if (this.path.length === 0) return;

    // Highlight visited cells
    this.path.forEach(([r, c], idx) => {
      const cellEl = this.container.querySelector(`#zip-cell-${r}-${c}`);
      if (cellEl) {
        cellEl.classList.add('visited');
        if (idx === this.path.length - 1) {
          cellEl.classList.add('path-head');
        }
      }
    });

    // Draw glowing neon path line
    const dpr = this.dpr || window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 12;

    this.path.forEach(([r, c], idx) => {
      const cellEl = this.container.querySelector(`#zip-cell-${r}-${c}`);
      if (!cellEl) return;
      const rect = cellEl.getBoundingClientRect();
      const x = rect.left - boardRect.left + rect.width / 2;
      const y = rect.top - boardRect.top + rect.height / 2;

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.restore();
  }

  updateHUD() {
    const coverageEl = this.container.querySelector('#zip-coverage');
    coverageEl.textContent = `${this.path.length} / ${this.puzzle.totalCells} cells`;

    const targetEl = this.container.querySelector('#zip-target');
    const maxCp = Math.max(...this.puzzle.checkpoints.map(c => c.num));
    if (this.nextCheckpointNum > maxCp) {
      targetEl.textContent = "Fill Remaining Squares!";
      targetEl.style.color = "#10b981";
    } else {
      targetEl.textContent = `Checkpoint ${this.nextCheckpointNum}`;
      targetEl.style.color = "#00f2fe";
    }

    const marks = this.calculateEstimatedMarks();
    this.container.querySelector('#zip-score').textContent = marks;

    this.onProgress({
      cellsCovered: this.path.length,
      totalCells: this.puzzle.totalCells,
      estimatedMarks: marks
    });
  }

  calculateEstimatedMarks() {
    const base = Math.floor((this.path.length / this.puzzle.totalCells) * this.puzzle.baseMarks);
    return Math.max(0, base);
  }

  calculateFinalMarks() {
    const base = this.puzzle.baseMarks;
    const timeBonus = Math.max(0, Math.floor(((this.puzzle.timeLimitSeconds - this.elapsedSeconds) / this.puzzle.timeLimitSeconds) * this.puzzle.maxBonusMarks));
    const efficiencyBonus = this.undoCount === 0 ? 25 : Math.max(0, 15 - this.undoCount * 3);
    return base + timeBonus + efficiencyBonus;
  }

  updateLevelButtons() {
    const badge = this.container.querySelector('#zip-level-badge');
    if (badge) badge.textContent = `LEVEL ${this.levelId}/3: ${this.puzzle.name}`;

    for (let i = 1; i <= 3; i++) {
      const btn = this.container.querySelector(`#zip-btn-lvl${i}`);
      if (btn) {
        btn.className = this.levelId === i ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
      }
    }
  }

  checkWinCondition() {
    const maxCp = Math.max(...this.puzzle.checkpoints.map(c => c.num));
    const allCheckpointsReached = this.nextCheckpointNum > maxCp;
    const allCellsFilled = this.path.length === this.puzzle.totalCells;

    if (allCheckpointsReached && allCellsFilled) {
      this.isCompleted = true;
      clearInterval(this.timer);
      sound.playVictory();

      const finalMarks = this.calculateFinalMarks();
      this.levelMarks[this.levelId - 1] = finalMarks;
      this.totalMarks = this.levelMarks.reduce((a, b) => a + b, 0);
      this.container.querySelector('#zip-score').textContent = this.totalMarks;

      const dialog = this.container.querySelector('#zip-modal');
      this.container.querySelector('#zip-modal-score').textContent = `+${finalMarks} Marks (Level ${this.levelId} / 3)`;

      const finishBtn = this.container.querySelector('#zip-modal-finish-btn');
      if (this.levelId < 3) {
        finishBtn.textContent = `Advance to Level ${this.levelId + 1} →`;
      } else {
        finishBtn.textContent = `Complete Game 3 & Proceed to Game 4 →`;
      }
      dialog.showModal();
    }
  }

  undoMove() {
    if (this.path.length <= 1) return;
    sound.playClick();
    this.undoCount++;
    this.path.pop();
    this.recalculateNextCheckpoint();
    this.renderPath();
    this.updateHUD();
  }

  useHint() {
    if (this.isCompleted) return;
    sound.playHint();
    const sol = this.puzzle.solution;
    const currentLen = this.path.length;

    if (currentLen < sol.length) {
      const nextStep = sol[currentLen];
      this.tryAddOrRetractCell(nextStep[0], nextStep[1]);
    }
  }

  resetLevel() {
    sound.playClick();
    this.initLevel(this.levelId);
  }

  startTimer() {
    clearInterval(this.timer);
    const timerEl = this.container.querySelector('#zip-timer');

    this.timer = setInterval(() => {
      if (this.isCompleted) {
        clearInterval(this.timer);
        return;
      }
      this.elapsedSeconds++;
      const m = Math.floor(this.elapsedSeconds / 60);
      const s = this.elapsedSeconds % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  destroy() {
    clearInterval(this.timer);
    this.isCompleted = true;
  }
}
