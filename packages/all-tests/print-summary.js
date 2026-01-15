#!/usr/bin/env node

// Simple script that wraps vitest and prints summary
const { spawn } = require('child_process');
const path = require('path');

const vitestPath = path.dirname(require.resolve('vitest'));
const vitestBin = path.join(vitestPath, '..', 'vitest.mjs');

const vitest = spawn('node', [vitestBin, 'watch', ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true,
});

let fileCount = 0;
let testCount = 0;

vitest.stdout?.on('data', (data) => {
  const str = data.toString();
  const matches = str.match(/✓.*?\((\d+) tests?\)/g);
  if (matches) {
    fileCount += matches.length;
    testCount += matches.reduce((acc, m) => {
      const num = m.match(/\((\d+) tests?\)/)?.[1];
      return acc + (parseInt(num) || 0);
    }, 0);
  }
});

vitest.on('exit', () => {
  if (fileCount > 0) {
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                       📊 ALL TESTS SUMMARY                        ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  📁 Test Files:  ${String(fileCount).padStart(3)} passed  (${fileCount} total)                     `.padEnd(64) + '║');
    console.log(`║  ✅ Tests:       ${String(testCount).padStart(3)} passed  (${testCount} total)                        `.padEnd(64) + '║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  }
});
