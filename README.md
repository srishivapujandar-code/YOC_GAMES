# ⚡ YOC GAMES • Official Multi-Game Tournament Arena

[![Vercel Deployment Ready](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?logo=vercel)](https://vercel.com)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-First-00f2fe?logo=apple)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Tests Passing](https://img.shields.io/badge/Tests-141%2F141%20Passed-success)](https://github.com/srishivapujandar-code/YOC_GAMES)

An esports-grade, mobile-first web tournament platform that seamlessly integrates 4 progressive games into a unified competitive experience with automated Google Forms leaderboard synchronization.

---

## 🎮 The 4 Tournament Game Stations (3 Progressive Levels Each)

### 1. Code Breaker Challenge
*Logic deduction challenge. Players crack secret multi-digit codes using position and value clues.*
- **Level 1 (Easy)**: 3-digit secret code, 6 attempts, 120s timer.
- **Level 2 (Medium)**: 4-digit secret code, 8 attempts, 150s timer.
- **Level 3 (Hard)**: 5-digit secret code, 10 attempts, 180s timer.

### 2. Patches Spatial Logic
*Inspired by LinkedIn Games. Partition a 5×5 spatial grid into colored rectangular and square patches satisfying exact area and orientation clues.*
- **Level 1**: *Mosaic Meadow* (5×5 board, 8 rectangular patches).
- **Level 2**: *Emerald Ribbon* (5×5 board, 8 geometric patches).
- **Level 3**: *Spring Lattice* (5×5 board, 8 complex interlocking patches).

### 3. Zip Challenge
*Connect numbered checkpoints sequentially to create a continuous, non-intersecting Hamiltonian path visiting every cell on the board.*
- **Level 1**: *Cadet* (4×4 grid, 16 cells, 6 numbered checkpoints).
- **Level 2**: *Navigator* (5×5 grid, 25 cells, 10 numbered checkpoints).
- **Level 3**: *Grandmaster* (6×6 grid, 36 cells, 15 numbered checkpoints).

### 4. Number Rush & Emoji Mystery
*Fast-paced visual reflex and logic challenge.*
- **Level 1**: *Speed Scout* (Numbers 1 to 12 ascending reflex sequence).
- **Level 2**: *Grid Master* (Numbers 1 to 20 fast visual scanning sequence).
- **Level 3**: *Emoji Decoders* (3 visual rebus riddles decoding hidden concepts).

---

## 📱 Mobile-First Production Features

- **Mobile Viewport Optimization**: Designed for smartphone touchscreens with responsive touch targets ($\ge 48\text{px}$), viewport fit `cover`, and zero tap delays (`touch-action: manipulation`).
- **Portrait Orientation Lock**: Dedicated visual prompt requesting rotation to portrait mode if turned to landscape on mobile devices.
- **Desktop Simulator Chassis**: When opened on desktop or widescreen displays, automatically renders inside a centered smartphone chassis (480px width) for authentic mobile tournament fidelity.
- **Procedural Audio & Haptic Feedback**: Zero-dependency Web Audio synthesizer with vibration feedback (`navigator.vibrate`) on touch gestures and victories.
- **PWA Ready**: Web App Manifest (`manifest.webmanifest`) for standalone Add to Home Screen installation.

---

## ⚡ Google Form Auto-Submission

Upon reaching the **Final Tournament Scoreboard**, the application automatically records all team data and game points into Google Forms:

| Schema Field | Google Form Entry ID | Description |
|:---|:---|:---|
| `teamName` | `entry.2005620554` | Registered Team Name |
| `name1` | `entry.760206339` | Player 1 Full Name |
| `name2` | `entry.2064043736` | Player 2 Full Name |
| `roll1` | `entry.2095619319` | Player 1 Roll Number (`25u201`) |
| `roll2` | `entry.84977519` | Player 2 Roll Number (`25u201`) |
| `phone` | `entry.1115565979` | Contact Phone Number |
| `g1` | `entry.231797246` | Game 1: Code Breaker Score |
| `g2` | `entry.1866105115` | Game 2: Patches Score |
| `g3` | `entry.892273308` | Game 3: Zip Challenge Marks |
| `g4` | `entry.921971514` | Game 4: Number Rush Score |

---

## 🚀 Deployment to Vercel

The project includes a production-ready `vercel.json` configuration:
- Clean URLs without `.html` extensions.
- Security headers (HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`).
- Long-term caching for static JS, CSS, and SVG assets (`max-age=31536000, immutable`).

To deploy:
1. Import repository `srishivapujandar-code/YOC_GAMES` in Vercel.
2. Framework Preset: **Other**.
3. Output Directory: **`./`** (Root).
4. Click **Deploy**.

---

## 🧪 Automated Test Suite

Run the comprehensive test suite locally:
```bash
node test_all_games.js
node test_e2e_form.js
```
- **141/141 Unit & Integration Tests Passing**
- **E2E Google Form Endpoint HTTP 200 OK Verified**
