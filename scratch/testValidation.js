import levels from '../src/data/levelsData.js';
import { validateLevel } from '../src/engine/ipEngine.js';

console.log('Testing all 10 levels...');

let allPassed = true;

for (const level of levels) {
  // Test with empty answers
  const emptyRes = validateLevel(level, {});
  if (emptyRes.valid) {
    console.error(`FAIL: Level ${level.id} passed with empty answers!`);
    allPassed = false;
  } else {
    console.log(`PASS: Level ${level.id} correctly rejected empty answers (${emptyRes.errors.length} errors).`);
  }

  // Test with solution answers
  const solRes = validateLevel(level, level.solution);
  if (!solRes.valid) {
    console.error(`FAIL: Level ${level.id} failed with its solution! Errors:`, solRes.errors);
    allPassed = false;
  } else {
    console.log(`PASS: Level ${level.id} verified valid with official solution.`);
  }
}

if (allPassed) {
  console.log('ALL 10 LEVELS PASSED VALIDATION CHECKS!');
} else {
  console.error('SOME LEVEL CHECKS FAILED.');
}
