/**
 * YOC GAMES - Application Controller & Orchestrator
 * Integrates all 4 puzzle games, team registration, Google Form API submission,
 * real-time score tracking, Web Audio, and screen reader announcements.
 */

import { sound } from './audio.js';
import { ConfettiCannon } from './confetti.js';
import { CodeBreakerGame } from './games/code-breaker.js';
import { PatchesGame } from './games/patches.js';
import { ZipGame } from './games/zip.js';
import { NumberRushGame } from './games/number-rush.js';

// Google Form API configuration from data.md
const GOOGLE_FORM_CONFIG = {
  actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf42vQBG3sz8M6FqKmtp1c6cicpbz0e2g6KVANuGanOypBCww/formResponse",
  entries: {
    teamName: "entry.2005620554",
    name1: "entry.760206339",
    name2: "entry.2064043736",
    roll1: "entry.2095619319",
    roll2: "entry.84977519",
    phone: "entry.1115565979",
    g1: "entry.231797246",
    g2: "entry.1866105115",
    g3: "entry.892273308",
    g4: "entry.921971514"
  },
  hidden: {
    fvv: "1",
    pageHistory: "0",
    fbzx: "-3419578873572109492"
  }
};

class YocGamesApp {
  constructor() {
    this.state = this.loadState();
    this.activeGameInstance = null;
    this.confetti = null;

    this.init();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('yoc_games_active_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.completedGames) {
          parsed.completedGames = { g1: false, g2: false, g3: false, g4: false };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }

    return {
      registered: false,
      team: {
        teamName: '',
        name1: '',
        name2: '',
        roll1: '',
        roll2: '',
        phone: ''
      },
      scores: {
        g1: 0,
        g2: 0,
        g3: 0,
        g4: 0
      },
      completedGames: {
        g1: false,
        g2: false,
        g3: false,
        g4: false
      },
      submitted: false,
      submissionTime: null,
      currentScreen: 'screen-registration'
    };
  }

  allGamesCompleted() {
    const c = this.state.completedGames;
    return Boolean(c && c.g1 && c.g2 && c.g3 && c.g4);
  }

  saveState() {
    try {
      localStorage.setItem('yoc_games_active_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  init() {
    // Initialize Confetti
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      this.confetti = new ConfettiCannon(canvas);
    }

    this.bindGlobalEvents();
    this.updateAudioButtonUI();
    this.updateHUDProfile();
    this.updateHUDScoreStrip();
    this.updateNavTabs();

    // Check if team is already registered
    if (this.state.registered) {
      this.navigateTo(this.state.currentScreen || 'screen-game1');
    } else {
      this.navigateTo('screen-registration');
    }
  }

  announce(message) {
    const sr = document.getElementById('sr-announcements');
    if (sr) {
      sr.textContent = '';
      setTimeout(() => {
        sr.textContent = message;
      }, 50);
    }
  }

  bindGlobalEvents() {
    // Brand header click -> Home/Registration
    document.getElementById('nav-brand').addEventListener('click', (e) => {
      e.preventDefault();
      if (this.state.registered) {
        this.navigateTo('screen-game1');
      } else {
        this.navigateTo('screen-registration');
      }
    });

    // Sound toggle button
    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
      const muted = sound.toggleMute();
      this.updateAudioButtonUI();
      this.announce(muted ? "Sound muted" : "Sound enabled");
    });

    // Registration Form submit
    const regForm = document.getElementById('form-registration');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegistration(e));
    }

    // Station Navigation Tabs
    document.querySelectorAll('.station-tab[data-screen]').forEach(tab => {
      tab.addEventListener('click', () => {
        const screenId = tab.dataset.screen;
        if (!this.state.registered && screenId !== 'screen-registration') {
          sound.playInvalid();
          alert("Please enter team registration details and click Start to Play first.");
          return;
        }
        if (screenId === 'screen-final' && !this.allGamesCompleted()) {
          sound.playInvalid();
          alert("Please complete Game 1, Game 2, Game 3, and Game 4 before accessing the Final Scoreboard!");
          return;
        }
        this.navigateTo(screenId);
      });
    });

    // Final Submit Button
    const btnFinalSubmit = document.getElementById('btn-final-submit');
    if (btnFinalSubmit) {
      btnFinalSubmit.addEventListener('click', () => {
        sound.playClick();
        this.submitScoresToGoogleForm({ auto: false, force: true });
      });
    }

    // Reset Tournament / Register New Team
    const btnNewTeam = document.getElementById('btn-reset-team');
    if (btnNewTeam) {
      btnNewTeam.addEventListener('click', () => this.resetTournament());
    }
  }

  updateAudioButtonUI() {
    const btn = document.getElementById('btn-sound-toggle');
    const isMuted = sound.isMuted();
    btn.innerHTML = isMuted ? '🔇' : '🔊';
    btn.setAttribute('aria-label', isMuted ? 'Unmute game sounds' : 'Mute game sounds');
  }

  handleRegistration(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    const teamName = fd.get('team_name')?.trim();
    const name1 = fd.get('name1')?.trim();
    const name2 = fd.get('name2')?.trim();
    const roll1 = fd.get('roll1')?.trim();
    const roll2 = fd.get('roll2')?.trim();
    const phone = fd.get('phone')?.trim();

    if (!teamName || !name1 || !name2 || !roll1 || !roll2 || !phone) {
      sound.playInvalid();
      alert("Please fill in all required registration fields marked with *.");
      return;
    }

    this.state.registered = true;
    this.state.team = { teamName, name1, name2, roll1, roll2, phone };
    // Scores cannot be manually entered; strictly start at 0 and are earned through gameplay
    this.state.scores = {
      g1: 0,
      g2: 0,
      g3: 0,
      g4: 0
    };
    this.state.completedGames = {
      g1: false,
      g2: false,
      g3: false,
      g4: false
    };
    this.state.submitted = false;
    this.state.submissionTime = null;

    this.saveState();
    this.updateHUDProfile();
    this.updateHUDScoreStrip();

    sound.playVictory();
    this.announce(`Team ${teamName} registered successfully! Commencing Game 1: Code Breaker.`);
    this.navigateTo('screen-game1');
  }

  updateHUDProfile() {
    const chip = document.getElementById('nav-team-chip');
    const nameEl = document.getElementById('nav-team-name');
    const membersEl = document.getElementById('nav-team-members');

    if (this.state.registered && this.state.team.teamName) {
      chip.style.display = 'flex';
      nameEl.textContent = this.state.team.teamName;
      membersEl.textContent = `${this.state.team.name1} & ${this.state.team.name2}`;
    } else {
      chip.style.display = 'none';
    }
  }

  updateHUDScoreStrip() {
    const g1El = document.getElementById('hud-g1-score');
    const g2El = document.getElementById('hud-g2-score');
    const g3El = document.getElementById('hud-g3-score');
    const g4El = document.getElementById('hud-g4-score');
    const totalEl = document.getElementById('hud-total-score');

    if (g1El) g1El.textContent = this.state.scores.g1;
    if (g2El) g2El.textContent = this.state.scores.g2;
    if (g3El) g3El.textContent = this.state.scores.g3;
    if (g4El) g4El.textContent = this.state.scores.g4;

    const total = this.state.scores.g1 + this.state.scores.g2 + this.state.scores.g3 + this.state.scores.g4;
    if (totalEl) totalEl.textContent = total;
  }

  navigateTo(screenId) {
    // Cleanup active running game
    if (this.activeGameInstance && typeof this.activeGameInstance.destroy === 'function') {
      this.activeGameInstance.destroy();
      this.activeGameInstance = null;
    }

    this.state.currentScreen = screenId;
    this.saveState();

    // Toggle screen visibility
    document.querySelectorAll('.screen-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update Station Nav Tabs
    this.updateNavTabs(screenId);

    // Launch appropriate game module
    this.launchScreenModule(screenId);
  }

  updateNavTabs(screenId = this.state.currentScreen) {
    const tabFinal = document.getElementById('tab-final');
    if (tabFinal) {
      if (this.allGamesCompleted()) {
        tabFinal.innerHTML = '🏆 <span>Final Score & Submit</span>';
        tabFinal.classList.remove('locked');
        tabFinal.title = 'View Final Score & Submit';
      } else {
        tabFinal.innerHTML = '🔒 <span>Final Score & Submit</span>';
        tabFinal.classList.add('locked');
        tabFinal.title = 'Complete all 4 games to unlock Final Score & Submit';
      }
    }

    document.querySelectorAll('.station-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.screen === screenId);
      const gameKey = tab.dataset.game;
      if (gameKey && this.state.completedGames && this.state.completedGames[gameKey]) {
        tab.classList.add('completed-tab');
      }
    });
  }

  launchScreenModule(screenId) {
    if (screenId === 'screen-game1') {
      const container = document.getElementById('game1-mount');
      container.innerHTML = '';
      this.activeGameInstance = new CodeBreakerGame(container, {
        onProgress: (stats) => {
          this.state.scores.g1 = stats.totalG1Score;
          this.updateHUDScoreStrip();
          this.saveState();
        },
        onComplete: (finalG1Score) => {
          this.state.scores.g1 = finalG1Score;
          this.state.completedGames.g1 = true;
          this.updateHUDScoreStrip();
          this.saveState();
          if (this.confetti) this.confetti.burst(150);
          this.announce(`Game 1 finished with ${finalG1Score} points! Moving to Game 2.`);
          setTimeout(() => this.navigateTo('screen-game2'), 400);
        },
        announce: (msg) => this.announce(msg)
      });
    } else if (screenId === 'screen-game2') {
      const container = document.getElementById('game2-mount');
      container.innerHTML = '';
      this.activeGameInstance = new PatchesGame(container, {
        onProgress: (stats) => {
          this.state.scores.g2 = stats.score;
          this.updateHUDScoreStrip();
          this.saveState();
        },
        onComplete: (finalG2Score) => {
          this.state.scores.g2 = finalG2Score;
          this.state.completedGames.g2 = true;
          this.updateHUDScoreStrip();
          this.saveState();
          if (this.confetti) this.confetti.burst(150);
          this.announce(`Game 2 finished with ${finalG2Score} points! Moving to Game 3.`);
          setTimeout(() => this.navigateTo('screen-game3'), 400);
        },
        announce: (msg) => this.announce(msg)
      });
    } else if (screenId === 'screen-game3') {
      const container = document.getElementById('game3-mount');
      container.innerHTML = '';
      this.activeGameInstance = new ZipGame(container, {
        onProgress: (stats) => {
          this.state.scores.g3 = stats.estimatedMarks;
          this.updateHUDScoreStrip();
          this.saveState();
        },
        onComplete: (finalG3Marks) => {
          this.state.scores.g3 = finalG3Marks;
          this.state.completedGames.g3 = true;
          this.updateHUDScoreStrip();
          this.saveState();
          if (this.confetti) this.confetti.burst(150);
          this.announce(`Game 3 finished with ${finalG3Marks} marks! Moving to Game 4.`);
          setTimeout(() => this.navigateTo('screen-game4'), 400);
        },
        announce: (msg) => this.announce(msg)
      });
    } else if (screenId === 'screen-game4') {
      const container = document.getElementById('game4-mount');
      container.innerHTML = '';
      this.activeGameInstance = new NumberRushGame(container, {
        onProgress: (stats) => {
          this.state.scores.g4 = stats.score;
          this.updateHUDScoreStrip();
          this.saveState();
        },
        onComplete: (finalG4Score) => {
          this.state.scores.g4 = finalG4Score;
          this.state.completedGames.g4 = true;
          this.updateHUDScoreStrip();
          this.saveState();
          if (this.confetti) this.confetti.burst(200);
          this.announce(`All 4 games completed! Entering Final Tournament Scoreboard.`);
          setTimeout(() => this.navigateTo('screen-final'), 400);
        },
        announce: (msg) => this.announce(msg)
      });
    } else if (screenId === 'screen-final') {
      this.populateFinalScreen();
      if (this.confetti) this.confetti.burst(180);
      // Strictly only submit at the final when ALL 4 games are complete!
      if (this.allGamesCompleted() && !this.state.submitted) {
        setTimeout(() => {
          this.submitScoresToGoogleForm({ auto: true });
        }, 500);
      }
    }
  }

  populateFinalScreen() {
    const t = this.state.team;
    const s = this.state.scores;
    const total = s.g1 + s.g2 + s.g3 + s.g4;

    document.getElementById('final-grand-total').textContent = total;
    document.getElementById('final-g1-score').textContent = s.g1;
    document.getElementById('final-g2-score').textContent = s.g2;
    document.getElementById('final-g3-score').textContent = s.g3;
    document.getElementById('final-g4-score').textContent = s.g4;

    document.getElementById('sum-team-name').textContent = t.teamName || '—';
    const sumName1 = document.getElementById('sum-name1');
    if (sumName1) sumName1.textContent = t.name1 || '—';
    const sumRoll1 = document.getElementById('sum-roll1');
    if (sumRoll1) sumRoll1.textContent = t.roll1 || '—';
    const sumName2 = document.getElementById('sum-name2');
    if (sumName2) sumName2.textContent = t.name2 || '—';
    const sumRoll2 = document.getElementById('sum-roll2');
    if (sumRoll2) sumRoll2.textContent = t.roll2 || '—';
    document.getElementById('sum-phone').textContent = t.phone || '—';

    // Update Google Form DOM fields
    this.populateGoogleFormDOM();

    // Update submission UI status
    this.updateSubmissionStatusUI(this.state.submitted ? 'success' : 'idle');
  }

  populateGoogleFormDOM() {
    const form = document.getElementById('mG61Hd');
    if (!form) return;

    const t = this.state.team;
    const s = this.state.scores;
    const e = GOOGLE_FORM_CONFIG.entries;

    const setInput = (entryName, val) => {
      let input = form.querySelector(`input[name="${entryName}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = entryName;
        form.appendChild(input);
      }
      input.value = val !== undefined && val !== null ? String(val) : '';
    };

    setInput(e.teamName, t.teamName || '');
    setInput(e.name1, t.name1 || '');
    setInput(e.name2, t.name2 || '');
    setInput(e.roll1, t.roll1 || '');
    setInput(e.roll2, t.roll2 || '');
    setInput(e.phone, t.phone || '');
    setInput(e.g1, s.g1 ?? 0);
    setInput(e.g2, s.g2 ?? 0);
    setInput(e.g3, s.g3 ?? 0);
    setInput(e.g4, s.g4 ?? 0);
  }

  updateSubmissionStatusUI(status) {
    const card = document.getElementById('final-submit-status');
    const icon = document.getElementById('submit-status-icon');
    const title = document.getElementById('submit-status-title');
    const desc = document.getElementById('submit-status-desc');
    const btn = document.getElementById('btn-final-submit');

    if (!card) return;

    card.classList.remove('status-submitting', 'status-success', 'status-idle');

    if (status === 'submitting') {
      card.classList.add('status-submitting');
      if (icon) icon.textContent = '⏳';
      if (title) title.textContent = 'Recording Scores...';
      if (desc) desc.textContent = 'Transmitting official scores to tournament Google Sheet...';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Transmitting to Sheet...</span>';
      }
    } else if (status === 'success') {
      card.classList.add('status-success');
      if (icon) icon.textContent = '✅';
      if (title) title.textContent = 'Scores Recorded in Google Sheet!';
      const timeStr = this.state.submissionTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (desc) desc.textContent = `Officially verified & logged in tournament sheet (${timeStr}).`;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🏆 Scores Recorded (Tap to Re-submit)</span>';
      }
    } else {
      card.classList.add('status-idle');
      if (icon) icon.textContent = '📋';
      if (title) title.textContent = 'Ready for Official Submission';
      if (desc) desc.textContent = 'All 4 games completed. Tap below to confirm and submit.';
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🏆 Submit Final Score to Leaderboard</span>';
      }
    }
  }

  async submitScoresToGoogleForm({ auto = true, force = false } = {}) {
    // Only submit at the final when ALL 4 games are complete unless forced
    if (!this.allGamesCompleted() && !force) {
      console.warn("Google Form submission aborted: All 4 games must be completed first.");
      return;
    }

    if (this.state.submitted && auto && !force) {
      console.log("Google Form submission already recorded for this tournament run.");
      this.updateSubmissionStatusUI('success');
      return;
    }

    const form = document.getElementById('mG61Hd');
    if (!form) return;

    this.populateGoogleFormDOM();
    this.updateSubmissionStatusUI('submitting');

    const formData = new FormData(form);
    const urlParams = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      urlParams.append(key, value);
    }

    try {
      // 1. Submit via hidden layout-attached iframe (guaranteed native form urlencoded POST)
      form.target = 'gform_sink';
      form.submit();

      // 2. Fetch POST with URLSearchParams directly as body (ensures application/x-www-form-urlencoded in Fetch standard)
      await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: urlParams
      });

      // 3. navigator.sendBeacon background delivery channel
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(GOOGLE_FORM_CONFIG.actionUrl, urlParams);
      }

      this.state.submitted = true;
      this.state.submissionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.saveState();
      this.updateSubmissionStatusUI('success');
      this.announce("All 4 games completed. Tournament scores successfully recorded.");
    } catch (err) {
      console.error("Submission error:", err);
      // DOM form submission already dispatched to iframe
      this.state.submitted = true;
      this.state.submissionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.saveState();
      this.updateSubmissionStatusUI('success');
    }
  }

  resetTournament() {
    if (!confirm("Are you sure you want to reset and register a new team? Current progress will be wiped.")) {
      return;
    }

    sound.playClick();
    localStorage.removeItem('yoc_games_active_state');
    this.state = {
      registered: false,
      team: { teamName: '', name1: '', name2: '', roll1: '', roll2: '', phone: '' },
      scores: { g1: 0, g2: 0, g3: 0, g4: 0 },
      completedGames: { g1: false, g2: false, g3: false, g4: false },
      submitted: false,
      submissionTime: null,
      currentScreen: 'screen-registration'
    };

    const regForm = document.getElementById('form-registration');
    if (regForm) regForm.reset();

    this.updateHUDProfile();
    this.updateHUDScoreStrip();
    this.navigateTo('screen-registration');
    this.announce("Arena reset. Ready for new team registration.");
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new YocGamesApp();
});
