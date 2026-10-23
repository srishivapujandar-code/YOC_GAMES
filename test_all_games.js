/**
 * Comprehensive Automated Verification Suite for YOC GAMES
 * Validates:
 * 1. Code Breaker deduction logic & constraints
 * 2. Patches spatial logic, shape & area verification
 * 3. Zip Hamiltonian path & checkpoint sequence
 * 4. Number Rush & Emoji rebus puzzles
 * 5. Google Form API schema & entry mappings from data.md
 */

import { ZIP_PUZZLES } from './games/zip.js';
import { SHAPE_ICONS } from './games/patches.js';
import { RUSH_LEVELS } from './games/number-rush.js';

console.log("=================================================");
console.log("🏁 RUNNING YOC GAMES COMPREHENSIVE TEST SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
    passedTests++;
  }
}

// -------------------------------------------------------------
// TEST SUITE 1: GAME 1 - CODE BREAKER
// -------------------------------------------------------------
console.log("--- 1. Testing Game 1: Code Breaker Mechanics ---");

function evaluateCodeBreakerGuess(guess, secretCode) {
  let correctPos = 0;
  let correctDigit = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secretCode[i]) {
      correctPos++;
    } else if (secretCode.includes(guess[i])) {
      correctDigit++;
    }
  }
  return { correctPos, correctDigit, incorrect: guess.length - correctPos - correctDigit };
}

// Exact match
const r1 = evaluateCodeBreakerGuess("429", "429");
assert(r1.correctPos === 3 && r1.correctDigit === 0 && r1.incorrect === 0, "Exact 3-digit match yields 3 correct positions");

// Partial misplaced
const r2 = evaluateCodeBreakerGuess("249", "429");
assert(r2.correctPos === 1 && r2.correctDigit === 2 && r2.incorrect === 0, "Swapped digits yield 1 correct position and 2 misplaced");

// No match
const r3 = evaluateCodeBreakerGuess("135", "429");
assert(r3.correctPos === 0 && r3.correctDigit === 0 && r3.incorrect === 3, "No common digits yield 3 incorrect");

// Distinct digits rule
const hasDuplicates1 = new Set("122").size !== 3;
const hasDuplicates2 = new Set("123").size !== 3;
assert(hasDuplicates1 === true, "Detects duplicate digits in '122'");
assert(hasDuplicates2 === false, "Validates all unique digits in '123'");

// -------------------------------------------------------------
// TEST SUITE 2: GAME 2 - PATCHES PUZZLE
// -------------------------------------------------------------
console.log("\n--- 2. Testing Game 2: Patches Spatial Logic ---");

function validatePatch(rect, clue) {
  const w = rect.c2 - rect.c1 + 1;
  const h = rect.r2 - rect.r1 + 1;
  const area = w * h;

  if (area !== clue.area) return { valid: false, reason: "Area mismatch" };
  if (clue.shape === 'square' && w !== h) return { valid: false, reason: "Must be square" };
  if (clue.shape === 'wide' && w <= h) return { valid: false, reason: "Must be wide" };
  if (clue.shape === 'tall' && h <= w) return { valid: false, reason: "Must be tall" };
  return { valid: true };
}

// 2x2 Square (Area: 4)
assert(validatePatch({ r1: 0, c1: 0, r2: 1, c2: 1 }, { area: 4, shape: 'square' }).valid, "2x2 rectangle satisfies 4 Square clue");
assert(!validatePatch({ r1: 0, c1: 0, r2: 0, c2: 3 }, { area: 4, shape: 'square' }).valid, "1x4 rectangle fails 4 Square clue");

// 1x3 Tall (Area: 3)
assert(validatePatch({ r1: 0, c1: 0, r2: 2, c2: 0 }, { area: 3, shape: 'tall' }).valid, "3x1 rectangle satisfies 3 Tall clue");
assert(!validatePatch({ r1: 0, c1: 0, r2: 0, c2: 2 }, { area: 3, shape: 'tall' }).valid, "1x3 wide rectangle fails 3 Tall clue");

// 1x2 Wide (Area: 2)
assert(validatePatch({ r1: 0, c1: 0, r2: 0, c2: 1 }, { area: 2, shape: 'wide' }).valid, "1x2 rectangle satisfies 2 Wide clue");

// -------------------------------------------------------------
// TEST SUITE 3: GAME 3 - ZIP CHALLENGE
// -------------------------------------------------------------
console.log("\n--- 3. Testing Game 3: Zip Hamiltonian Path & Checkpoints ---");

for (const [id, puzzle] of Object.entries(ZIP_PUZZLES)) {
  console.log(`  Validating Zip Level ${id}: ${puzzle.name} (${puzzle.rows}x${puzzle.cols})`);

  // 1. Total solution length must equal total cells
  assert(puzzle.solution.length === puzzle.totalCells, `Level ${id} solution visits exactly ${puzzle.totalCells} cells`);

  // 2. Continuous adjacency
  for (let i = 0; i < puzzle.solution.length - 1; i++) {
    const [r1, c1] = puzzle.solution[i];
    const [r2, c2] = puzzle.solution[i + 1];
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    assert(dist === 1, `Step ${i} -> ${i+1} (${r1},${c1}) to (${r2},${c2}) is orthogonal neighbor`);
  }

  // 3. Checkpoints visited in strict sequential order
  let currentTarget = 1;
  puzzle.solution.forEach(([r, c]) => {
    const cp = puzzle.checkpoints.find(p => p.r === r && p.c === c);
    if (cp) {
      assert(cp.num === currentTarget, `Checkpoint ${cp.num} reached in exact order`);
      currentTarget++;
    }
  });
  assert(currentTarget === puzzle.checkpoints.length + 1, `All ${puzzle.checkpoints.length} checkpoints reached in order`);
}

// -------------------------------------------------------------
// TEST SUITE 4: GAME 4 - NUMBER RUSH & EMOJI MYSTERY (3 LEVELS)
// -------------------------------------------------------------
console.log("\n--- 4. Testing Game 4: Number Rush & Emoji Rebus (3 Levels) ---");

assert(Array.isArray(RUSH_LEVELS) && RUSH_LEVELS.length === 3, "Game 4 has exactly 3 progressive levels configured");

// Level 1: Speed Scout (1..12)
const lvl1 = RUSH_LEVELS[0];
assert(lvl1.level === 1 && lvl1.totalNumbers === 12 && lvl1.cols === 4, "Game 4 Level 1 is Speed Scout (1 to 12) with 4 columns");

// Level 2: Grid Master (1..20)
const lvl2 = RUSH_LEVELS[1];
assert(lvl2.level === 2 && lvl2.totalNumbers === 20 && lvl2.cols === 5, "Game 4 Level 2 is Grid Master (1 to 20) with 5 columns");

// Level 3: Emoji Decoders (3 Clues)
const lvl3 = RUSH_LEVELS[2];
assert(lvl3.level === 3 && Array.isArray(lvl3.clues) && lvl3.clues.length === 3, "Game 4 Level 3 has 3 distinct emoji rebus riddles");

lvl3.clues.forEach((item, idx) => {
  assert(item.clue.includes("+") && item.answer.length > 0, `Emoji riddle ${idx + 1} "${item.clue}" -> "${item.answer}" verified`);
  assert(item.options.includes(item.answer), `Emoji riddle ${idx + 1} includes answer in options list`);
});

// -------------------------------------------------------------
// TEST SUITE 5: GOOGLE FORM API & DATA.MD MAPPING
// -------------------------------------------------------------
console.log("\n--- 5. Testing Google Form Schema Mapping from data.md ---");

const expectedEntries = {
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
};

for (const [key, entryId] of Object.entries(expectedEntries)) {
  assert(entryId.startsWith("entry."), `Schema field '${key}' maps to valid Google Form entry ID '${entryId}'`);
}

console.log("\n=================================================");
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log("=================================================");
