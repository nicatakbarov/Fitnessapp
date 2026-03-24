#!/usr/bin/env node
// ─────────────────────────────────────────────────────────
// buildGifMap.js — one-time script to generate exerciseGifMap.json
//
// Usage:
//   1. Download Kaggle ExerciseDB dataset:
//      https://www.kaggle.com/datasets/edoardoba/fitness-exercises-with-animations
//   2. Extract and place exercises.json in this scripts/ folder
//   3. Run: node scripts/buildGifMap.js
//   4. Output: src/data/exerciseGifMap.json
// ─────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'exercises.json');
const outputPath = path.join(__dirname, '../frontend/src/data/exerciseGifMap.json');

if (!fs.existsSync(inputPath)) {
  console.error('❌  exercises.json not found in scripts/ folder.');
  console.error('    Download from: https://www.kaggle.com/datasets/edoardoba/fitness-exercises-with-animations');
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('❌  Failed to parse exercises.json:', e.message);
  process.exit(1);
}

// Support both array and { exercises: [...] } shapes
const exercises = Array.isArray(data) ? data : (data.exercises || []);

const map = {};
for (const ex of exercises) {
  if (!ex.name || !ex.gifUrl) continue;
  const key = ex.name.toLowerCase().trim();
  map[key] = ex.gifUrl;
}

fs.writeFileSync(outputPath, JSON.stringify(map, null, 2));
console.log(`✅  Generated ${Object.keys(map).length} entries → ${outputPath}`);
