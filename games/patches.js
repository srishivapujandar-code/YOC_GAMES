/**
 * YOC GAMES - Game 2: Patches Puzzle
 * Daily spatial logic game inspired by LinkedIn Games.
 * Partition the grid into colored rectangular/square patches matching clues and shape constraints.
 */
import { sound } from '../audio.js';

export const SHAPE_ICONS = {
  square: '□',
  wide: '⬌',
  tall: '⬍',
  any: '✢'
};

const PATCH_PALETTES = [
  { bg: 'rgba(236, 72, 153, 0.45)', border: '#ec4899', text: '#fff' },
  { bg: 'rgba(59, 130, 246, 0.45)', border: '#3b82f6', text: '#fff' },
  { bg: 'rgba(16, 185, 129, 0.45)', border: '#10b981', text: '#fff' },
  { bg: 'rgba(245, 158, 11, 0.45)', border: '#f59e0b', text: '#fff' },
  { bg: 'rgba(168, 85, 247, 0.45)', border: '#a855f7', text: '#fff' },
  { bg: 'rgba(14, 165, 233, 0.45)', border: '#0ea5e9', text: '#fff' },
  { bg: 'rgba(244, 63, 94, 0.45)', border: '#f43f5e', text: '#fff' },
  { bg: 'rgba(20, 184, 166, 0.45)', border: '#14b8a6', text: '#fff' }
];

const PUZZLE_LEVELS = [
  {
    id: 'patch_1',
    size: 5,
    name: 'Mosaic Meadow',
    timeLimit: 120,
    baseScore: 150,
    patches: [
      { r1: 0, c1: 0, r2: 1, c2: 1, clueR: 0, clueC: 0, shape: 'square' }, // 2x2 = 4
      { r1: 0, c1: 2, r2: 2, c2: 2, clueR: 0, clueC: 2, shape: 'tall' },   // 3x1 = 3
      { r1: 0, c1: 3, r2: 1, c2: 4, clueR: 0, clueC: 4, shape: 'square' }, // 2x2 = 4
      { r1: 2, c1: 0, r2: 2, c2: 1, clueR: 2, clueC: 0, shape: 'wide' },   // 1x2 = 2
      { r1: 2, c1: 3, r2: 3, c2: 4, clueR: 3, clueC: 3, shape: 'square' }, // 2x2 = 4
      { r1: 3, c1: 0, r2: 4, c2: 1, clueR: 4, clueC: 1, shape: 'square' }, // 2x2 = 4
      { r1: 3, c1: 2, r2: 4, c2: 2, clueR: 3, clueC: 2, shape: 'tall' },   // 2x1 = 2
      { r1: 4, c1: 3, r2: 4, c2: 4, clueR: 4, clueC: 4, shape: 'wide' }    // 1x2 = 2
    ]
  },
  {
    id: 'patch_2',
    size: 5,
    name: 'Emerald Ribbon',
    timeLimit: 120,
    baseScore: 150,
    patches: [
      { r1: 0, c1: 0, r2: 0, c2: 3, clueR: 0, clueC: 1, shape: 'wide' },   // 1x4 = 4
      { r1: 0, c1: 4, r2: 2, c2: 4, clueR: 1, clueC: 4, shape: 'tall' },   // 3x1 = 3
      { r1: 1, c1: 0, r2: 2, c2: 1, clueR: 1, clueC: 0, shape: 'square' }, // 2x2 = 4
      { r1: 1, c1: 2, r2: 3, c2: 2, clueR: 2, clueC: 2, shape: 'tall' },   // 3x1 = 3
      { r1: 1, c1: 3, r2: 2, c2: 3, clueR: 2, clueC: 3, shape: 'tall' },   // 2x1 = 2
      { r1: 3, c1: 0, r2: 4, c2: 1, clueR: 4, clueC: 0, shape: 'square' }, // 2x2 = 4
      { r1: 3, c1: 3, r2: 3, c2: 4, clueR: 3, clueC: 4, shape: 'wide' },   // 1x2 = 2
      { r1: 4, c1: 2, r2: 4, c2: 4, clueR: 4, clueC: 3, shape: 'wide' }    // 1x3 = 3
    ]
  },
  {
    id: 'patch_3',
    size: 5,
    name: 'Spring Lattice',
    timeLimit: 120,
    baseScore: 180,
    patches: [
      { r1: 0, c1: 0, r2: 1, c2: 2, clueR: 0, clueC: 1, shape: 'wide' },   // 2x3 = 6
      { r1: 0, c1: 3, r2: 1, c2: 4, clueR: 1, clueC: 4, shape: 'square' }, // 2x2 = 4
      { r1: 2, c1: 0, r2: 4, c2: 0, clueR: 3, clueC: 0, shape: 'tall' },   // 3x1 = 3
      { r1: 2, c1: 1, r2: 3, c2: 2, clueR: 2, clueC: 2, shape: 'square' }, // 2x2 = 4
      { r1: 2, c1: 3, r2: 4, c2: 3, clueR: 3, clueC: 3, shape: 'tall' },   // 3x1 = 3
      { r1: 2, c1: 4, r2: 3, c2: 4, clueR: 2, clueC: 4, shape: 'tall' },   // 2x1 = 2
      { r1: 4, c1: 1, r2: 4, c2: 2, clueR: 4, clueC: 1, shape: 'wide' },   // 1x2 = 2
      { r1: 4, c1: 4, r2: 4, c2: 4, clueR: 4, clueC: 4, shape: 'square' }  // 1x1 = 1
    ]
  }
];

export class PatchesGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.announce = options.announce || (() => {});

    this.levelIndex = 0;
    this.levelScores = [0, 0, 0];
    this.totalScore = 0;
    this.currentPuzzle = PUZZLE_LEVELS[this.levelIndex];
    this.gridSize = this.currentPuzzle.size;

    this.score = 0;
    this.timeRemaining = this.currentPuzzle.timeLimit;
    this.timer = null;
    this.isCompleted = false;

    this.clues = [];
    this.placedPatches = [];
    this.undoStack = [];
    this.colorIdx = 0;

    // Pointer state
    this.isDragging = false;
    this.dragStart = null;
    this.dragCurrent = null;
    this.tapAnchor = null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper patches-game">
        <header class="game-header">
          <div class="game-header-info">
            <span class="game-tag">GAME 02</span>
            <h2 class="game-headline">Patches Spatial Logic</h2>
            <p class="game-desc">Partition the board into non-overlapping colored rectangles satisfying clue size and orientation.</p>
          </div>
          <div class="game-badge-chip" id="pt-level-badge">${this.currentPuzzle.name} (5×5)</div>
        </header>

        <!-- Stats Grid -->
        <div class="hud-stats-grid" role="region" aria-label="Game 2 Statistics">
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⏱</span>
            <span class="hud-stat-label">Time Left</span>
            <strong class="hud-stat-val timer-val" id="pt-timer">02:00</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">🧩</span>
            <span class="hud-stat-label">Patches Placed</span>
            <strong class="hud-stat-val" id="pt-progress">0 / 8</strong>
          </div>
          <div class="hud-stat-card">
            <span class="hud-stat-icon" aria-hidden="true">⭐</span>
            <span class="hud-stat-label">Game 2 Score (g2)</span>
            <strong class="hud-stat-val score-highlight" id="pt-score">0</strong>
          </div>
        </div>

        <!-- Board Arena -->
        <div class="pt-board-wrapper">
          <div class="pt-controls-bar">
            <div class="shape-legend">
              <span class="legend-badge">□ Square (W=H)</span>
              <span class="legend-badge">⬌ Wide (W&gt;H)</span>
              <span class="legend-badge">⬍ Tall (H&gt;W)</span>
              <span class="legend-badge">✢ Any</span>
            </div>

            <div class="pt-action-btns">
              <button class="btn btn-secondary btn-sm" id="pt-btn-undo" type="button" title="Undo last patch">
                ↩ Undo
              </button>
              <button class="btn btn-secondary btn-sm" id="pt-btn-hint" type="button" title="Place a correct patch (-15 pts)">
                💡 Hint
              </button>
              <button class="btn btn-secondary btn-sm" id="pt-btn-reset" type="button" title="Clear board">
                ↺ Reset
              </button>
            </div>
          </div>

          <!-- The Interactive Grid -->
          <div class="pt-grid-outer" id="pt-grid-container">
            <div class="pt-grid" id="pt-grid"></div>
            <!-- Placed Patches Container -->
            <div class="pt-patches-layer" id="pt-patches-layer"></div>
            <!-- Active Drag Preview Overlay -->
            <div class="pt-drag-preview hidden" id="pt-drag-preview">
              <span class="preview-dim-tag" id="pt-preview-tag">2 × 2 = 4</span>
            </div>
          </div>

          <div id="pt-feedback-msg" class="pt-feedback-banner" role="status" aria-live="polite">
            Drag or tap corners to draw a rectangle covering a clue.
          </div>
        </div>

        <!-- Victory Modal -->
        <dialog id="pt-modal" class="yoc-dialog">
          <div class="dialog-content">
            <div class="dialog-icon">🏆</div>
            <h3>Patches Puzzle Solved!</h3>
            <p class="text-muted">You completely quilted the grid with 100% valid rectangular patches!</p>
            
            <div class="dialog-stat-box">
              <span class="dialog-stat-label">Total Game 2 Score</span>
              <strong class="dialog-stat-number" id="pt-modal-score">+0</strong>
            </div>

            <div class="dialog-footer">
              <button class="btn btn-primary full-width" id="pt-modal-finish-btn" type="button">
                Complete Game 2 & Proceed →
              </button>
            </div>
          </div>
        </dialog>
      </div>
    `;

    this.initPuzzle();
    this.bindEvents();
    this.startTimer();
  }

  initPuzzle() {
    this.gridSize = this.currentPuzzle.size;
    this.placedPatches = [];
    this.undoStack = [];
    this.colorIdx = 0;
    this.isCompleted = false;

    // Parse clues from the groundTruth patches
    this.clues = this.currentPuzzle.patches.map((p, idx) => {
      const w = Math.abs(p.c2 - p.c1) + 1;
      const h = Math.abs(p.r2 - p.r1) + 1;
      const area = w * h;
      return {
        id: idx,
        r: p.clueR,
        c: p.clueC,
        area,
        shape: p.shape,
        satisfied: false,
        groundTruth: p
      };
    });

    this.buildGridDOM();
    this.updateStats();
  }

  buildGridDOM() {
    const grid = this.container.querySelector('#pt-grid');
    grid.style.setProperty('--grid-dim', this.gridSize);
    grid.innerHTML = '';

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'pt-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `pt-cell-${r}-${c}`;

        const clue = this.clues.find(item => item.r === r && item.c === c);
        if (clue) {
          const badge = document.createElement('div');
          badge.className = 'pt-clue-badge';
          badge.id = `pt-clue-${clue.id}`;
          badge.innerHTML = `
            <span class="clue-num">${clue.area}</span>
            <span class="clue-icon">${SHAPE_ICONS[clue.shape] || '✢'}</span>
          `;
          badge.title = `Area: ${clue.area}, Shape: ${clue.shape}`;
          cell.appendChild(badge);
        }

        grid.appendChild(cell);
      }
    }

    this.container.querySelector('#pt-patches-layer').innerHTML = '';
  }

  bindEvents() {
    const gridContainer = this.container.querySelector('#pt-grid-container');
    const undoBtn = this.container.querySelector('#pt-btn-undo');
    const hintBtn = this.container.querySelector('#pt-btn-hint');
    const resetBtn = this.container.querySelector('#pt-btn-reset');
    const finishBtn = this.container.querySelector('#pt-modal-finish-btn');

    undoBtn.addEventListener('click', () => this.undoLast());
    hintBtn.addEventListener('click', () => this.useHint());
    resetBtn.addEventListener('click', () => this.resetBoard());

    finishBtn.addEventListener('click', () => {
      this.container.querySelector('#pt-modal').close();
      if (this.levelIndex < PUZZLE_LEVELS.length - 1) {
        this.levelIndex++;
        this.currentPuzzle = PUZZLE_LEVELS[this.levelIndex];
        this.timeRemaining = this.currentPuzzle.timeLimit;
        const badge = this.container.querySelector('#pt-level-badge');
        if (badge) badge.textContent = `LEVEL ${this.levelIndex + 1}/3: ${this.currentPuzzle.name}`;
        this.initPuzzle();
        this.startTimer();
      } else {
        this.announce(`Game 2 Patches completed all 3 levels! Final Score: ${this.totalScore}`);
        this.onComplete(this.totalScore, { levelScores: this.levelScores });
      }
    });

    // Pointer events on grid
    gridContainer.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handlePointerCancel(e));
  }

  getCellFromPoint(clientX, clientY) {
    const grid = this.container.querySelector('#pt-grid');
    if (!grid) return null;

    const cells = grid.querySelectorAll('.pt-cell');
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

    // Check if clicked an existing patch to remove it
    const existingPatchIdx = this.placedPatches.findIndex(p =>
      cell.r >= p.r1 && cell.r <= p.r2 && cell.c >= p.c1 && cell.c <= p.c2
    );

    if (existingPatchIdx >= 0) {
      this.removePatch(existingPatchIdx);
      return;
    }

    this.isDragging = true;
    this.dragStart = cell;
    this.dragCurrent = cell;
    this.showPreview(cell, cell);
  }

  handlePointerMove(e) {
    if (!this.isDragging || !this.dragStart) return;
    if (e.cancelable) e.preventDefault();
    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (cell && (cell.r !== this.dragCurrent.r || cell.c !== this.dragCurrent.c)) {
      this.dragCurrent = cell;
      this.showPreview(this.dragStart, this.dragCurrent);
    }
  }

  handlePointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.hidePreview();

    if (this.dragStart && this.dragCurrent) {
      const r1 = Math.min(this.dragStart.r, this.dragCurrent.r);
      const r2 = Math.max(this.dragStart.r, this.dragCurrent.r);
      const c1 = Math.min(this.dragStart.c, this.dragCurrent.c);
      const c2 = Math.max(this.dragStart.c, this.dragCurrent.c);

      this.placePatchIfValid({ r1, c1, r2, c2 });
    }

    this.dragStart = null;
    this.dragCurrent = null;
  }

  handlePointerCancel() {
    this.isDragging = false;
    this.hidePreview();
    this.dragStart = null;
    this.dragCurrent = null;
  }

  showPreview(c1, c2) {
    const preview = this.container.querySelector('#pt-drag-preview');
    const tag = this.container.querySelector('#pt-preview-tag');
    const grid = this.container.querySelector('#pt-grid');

    const minR = Math.min(c1.r, c2.r);
    const maxR = Math.max(c1.r, c2.r);
    const minC = Math.min(c1.c, c2.c);
    const maxC = Math.max(c1.c, c2.c);

    const w = maxC - minC + 1;
    const h = maxR - minR + 1;
    const area = w * h;

    const cell1 = this.container.querySelector(`#pt-cell-${minR}-${minC}`);
    const cell2 = this.container.querySelector(`#pt-cell-${maxR}-${maxC}`);
    if (!cell1 || !cell2) return;

    const gridRect = grid.getBoundingClientRect();
    const r1Rect = cell1.getBoundingClientRect();
    const r2Rect = cell2.getBoundingClientRect();

    preview.style.left = `${r1Rect.left - gridRect.left}px`;
    preview.style.top = `${r1Rect.top - gridRect.top}px`;
    preview.style.width = `${r2Rect.right - r1Rect.left}px`;
    preview.style.height = `${r2Rect.bottom - r1Rect.top}px`;

    tag.textContent = `${w} × ${h} = ${area}`;
    preview.classList.remove('hidden');
  }

  hidePreview() {
    const preview = this.container.querySelector('#pt-drag-preview');
    if (preview) preview.classList.add('hidden');
  }

  evaluatePlacement(rect) {
    const w = rect.c2 - rect.c1 + 1;
    const h = rect.r2 - rect.r1 + 1;
    const area = w * h;

    // 1. Overlap check with already placed patches
    for (const patch of this.placedPatches) {
      if (
        !(rect.r2 < patch.r1 || rect.r1 > patch.r2 || rect.c2 < patch.c1 || rect.c1 > patch.c2)
      ) {
        return { valid: false, reason: 'Overlaps another placed patch' };
      }
    }

    // 2. Enclosed clues check (Must enclose exactly 1 clue)
    const enclosedClues = this.clues.filter(c =>
      c.r >= rect.r1 && c.r <= rect.r2 && c.c >= rect.c1 && c.c <= rect.c2
    );

    if (enclosedClues.length === 0) {
      return { valid: false, reason: 'Patch must contain exactly one clue' };
    }
    if (enclosedClues.length > 1) {
      return { valid: false, reason: 'Patch contains multiple clues' };
    }

    const clue = enclosedClues[0];

    // 3. Exact area check
    if (area !== clue.area) {
      return { valid: false, reason: `Area is ${area}, but clue requires ${clue.area}` };
    }

    // 4. Shape constraint check
    if (clue.shape === 'square' && w !== h) {
      return { valid: false, reason: 'Clue requires a square (width = height)' };
    }
    if (clue.shape === 'wide' && w <= h) {
      return { valid: false, reason: 'Clue requires a wide rectangle (width > height)' };
    }
    if (clue.shape === 'tall' && h <= w) {
      return { valid: false, reason: 'Clue requires a tall rectangle (height > width)' };
    }

    return { valid: true, clue };
  }

  placePatchIfValid(rect) {
    const evaluation = this.evaluatePlacement(rect);
    const feedback = this.container.querySelector('#pt-feedback-msg');

    if (evaluation.valid) {
      sound.playValidPlacement();
      const palette = PATCH_PALETTES[this.colorIdx % PATCH_PALETTES.length];
      this.colorIdx++;

      const patch = {
        ...rect,
        clueId: evaluation.clue.id,
        palette
      };

      this.placedPatches.push(patch);
      this.undoStack.push({ type: 'add', patch });

      evaluation.clue.satisfied = true;
      const badge = this.container.querySelector(`#pt-clue-${evaluation.clue.id}`);
      if (badge) badge.classList.add('satisfied');

      feedback.textContent = `✓ Valid patch placed! Matches clue "${evaluation.clue.area} ${SHAPE_ICONS[evaluation.clue.shape]}".`;
      feedback.className = 'pt-feedback-banner success';

      this.renderPatchesDOM();
      this.updateStats();
      this.checkWinCondition();
    } else {
      sound.playInvalid();
      feedback.textContent = `✕ ${evaluation.reason}`;
      feedback.className = 'pt-feedback-banner warning';
    }
  }

  renderPatchesDOM() {
    const layer = this.container.querySelector('#pt-patches-layer');
    const grid = this.container.querySelector('#pt-grid');
    const gridRect = grid.getBoundingClientRect();
    layer.innerHTML = '';

    this.placedPatches.forEach((patch, idx) => {
      const cell1 = this.container.querySelector(`#pt-cell-${patch.r1}-${patch.c1}`);
      const cell2 = this.container.querySelector(`#pt-cell-${patch.r2}-${patch.c2}`);
      if (!cell1 || !cell2) return;

      const r1Rect = cell1.getBoundingClientRect();
      const r2Rect = cell2.getBoundingClientRect();

      const el = document.createElement('div');
      el.className = 'pt-placed-patch';
      el.style.left = `${r1Rect.left - gridRect.left}px`;
      el.style.top = `${r1Rect.top - gridRect.top}px`;
      el.style.width = `${r2Rect.right - r1Rect.left}px`;
      el.style.height = `${r2Rect.bottom - r1Rect.top}px`;
      el.style.backgroundColor = patch.palette.bg;
      el.style.borderColor = patch.palette.border;
      el.title = "Click to remove patch";

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removePatch(idx);
      });

      layer.appendChild(el);
    });
  }

  removePatch(idx) {
    if (idx < 0 || idx >= this.placedPatches.length) return;
    sound.playClick();
    const removed = this.placedPatches.splice(idx, 1)[0];
    this.undoStack.push({ type: 'remove', patch: removed });

    const clue = this.clues.find(c => c.id === removed.clueId);
    if (clue) {
      clue.satisfied = false;
      const badge = this.container.querySelector(`#pt-clue-${clue.id}`);
      if (badge) badge.classList.remove('satisfied');
    }

    this.renderPatchesDOM();
    this.updateStats();
    const feedback = this.container.querySelector('#pt-feedback-msg');
    feedback.textContent = "Patch removed.";
    feedback.className = 'pt-feedback-banner';
  }

  undoLast() {
    if (this.undoStack.length === 0) return;
    sound.playClick();
    const action = this.undoStack.pop();

    if (action.type === 'add') {
      const idx = this.placedPatches.indexOf(action.patch);
      if (idx >= 0) {
        this.placedPatches.splice(idx, 1);
        const clue = this.clues.find(c => c.id === action.patch.clueId);
        if (clue) {
          clue.satisfied = false;
          const badge = this.container.querySelector(`#pt-clue-${clue.id}`);
          if (badge) badge.classList.remove('satisfied');
        }
      }
    }

    this.renderPatchesDOM();
    this.updateStats();
  }

  useHint() {
    if (this.isCompleted) return;
    const unsatisfied = this.clues.find(c => !c.satisfied);
    if (!unsatisfied) return;

    sound.playHint();
    const target = unsatisfied.groundTruth;
    this.placePatchIfValid({
      r1: target.r1,
      c1: target.c1,
      r2: target.r2,
      c2: target.c2
    });

    this.score = Math.max(0, this.score - 15);
    this.container.querySelector('#pt-score').textContent = this.score;
  }

  resetBoard() {
    sound.playClick();
    this.placedPatches = [];
    this.undoStack = [];
    this.clues.forEach(c => {
      c.satisfied = false;
      const b = this.container.querySelector(`#pt-clue-${c.id}`);
      if (b) b.classList.remove('satisfied');
    });
    this.renderPatchesDOM();
    this.updateStats();
    this.container.querySelector('#pt-feedback-msg').textContent = "Board cleared. Ready to place patches.";
  }

  startTimer() {
    clearInterval(this.timer);
    const timerEl = this.container.querySelector('#pt-timer');

    this.timer = setInterval(() => {
      if (this.isCompleted) {
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
        clearInterval(this.timer);
        this.checkWinCondition(true);
      }
    }, 1000);
  }

  updateStats() {
    const total = this.clues.length;
    const placed = this.placedPatches.length;
    this.container.querySelector('#pt-progress').textContent = `${placed} / ${total}`;

    // Base score calculation
    const basePts = placed * 20;
    this.score = Math.max(0, basePts);
    this.container.querySelector('#pt-score').textContent = this.score;

    this.onProgress({
      placed,
      total,
      score: this.score
    });
  }

  checkWinCondition(timeout = false) {
    const allCluesSatisfied = this.clues.every(c => c.satisfied);
    const totalCells = this.gridSize * this.gridSize;
    let coveredCells = 0;
    this.placedPatches.forEach(p => {
      coveredCells += (p.r2 - p.r1 + 1) * (p.c2 - p.c1 + 1);
    });

    const isBoardFullyTiled = coveredCells === totalCells;

    if (allCluesSatisfied && isBoardFullyTiled) {
      this.isCompleted = true;
      clearInterval(this.timer);
      sound.playVictory();

      const speedBonus = Math.floor(this.timeRemaining * 1.5);
      const levelScore = this.currentPuzzle.baseScore + speedBonus;
      this.levelScores[this.levelIndex] = levelScore;
      this.totalScore = this.levelScores.reduce((a, b) => a + b, 0);
      this.container.querySelector('#pt-score').textContent = this.totalScore;

      const dialog = this.container.querySelector('#pt-modal');
      this.container.querySelector('#pt-modal-score').textContent = `+${levelScore} pts (Level ${this.levelIndex + 1} / 3)`;

      const finishBtn = this.container.querySelector('#pt-modal-finish-btn');
      if (this.levelIndex < PUZZLE_LEVELS.length - 1) {
        finishBtn.textContent = `Advance to Level ${this.levelIndex + 2} →`;
      } else {
        finishBtn.textContent = `Complete Game 2 & Proceed to Game 3 →`;
      }
      dialog.showModal();
    } else if (timeout) {
      this.isCompleted = true;
      sound.playInvalid();
      this.levelScores[this.levelIndex] = 0;
      this.totalScore = this.levelScores.reduce((a, b) => a + b, 0);

      const dialog = this.container.querySelector('#pt-modal');
      this.container.querySelector('#pt-modal-score').textContent = `0 pts (Time Expired)`;
      const finishBtn = this.container.querySelector('#pt-modal-finish-btn');
      if (this.levelIndex < PUZZLE_LEVELS.length - 1) {
        finishBtn.textContent = `Advance to Level ${this.levelIndex + 2} →`;
      } else {
        finishBtn.textContent = `Complete Game 2 & Proceed to Game 3 →`;
      }
      dialog.showModal();
    }
  }

  destroy() {
    clearInterval(this.timer);
    this.isCompleted = true;
  }
}
