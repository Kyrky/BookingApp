#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Run from project root
const rootDir = path.resolve(__dirname, '../..');
const configPath = path.join(rootDir, 'packages', 'all-tests', 'vitest.config.ts');

// Use vitest from root node_modules
const vitestCmd = process.platform === 'win32' ? 'vitest.CMD' : 'vitest';
const vitestBin = path.join(rootDir, 'node_modules', '.bin', vitestCmd);

const vitest = spawn(vitestBin, ['--watch', '--coverage', '--config', configPath], {
  cwd: rootDir,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let fileCount = 0;
let testCount = 0;
let coveragePercent = null;
let summaryShown = false;
let windowTimeout = null;
let buffer = '';

vitest.stdout.on('data', (data) => {
  buffer += data.toString();
  process.stdout.write(data);
  checkAndShowSummary();
});

vitest.stderr.on('data', (data) => {
  buffer += data.toString();
  process.stderr.write(data);
  checkAndShowSummary();
});

function checkAndShowSummary() {
  // Remove ANSI escape codes
  const cleanBuffer = buffer.replace(/\x1b\[[0-9;]*m/g, '');

  // Parse test results from "Test Files" line
  // Format: "Test Files  22 passed (22)"
  const testFilesMatch = cleanBuffer.match(/Test Files\s+(\d+) passed/);
  const testsMatch = cleanBuffer.match(/Tests\s+(\d+) passed/);

  if (testFilesMatch) {
    fileCount = parseInt(testFilesMatch[1]);
  }
  if (testsMatch) {
    testCount = parseInt(testsMatch[1]);
  }

  // Parse coverage percentage from "All files" line
  const coverageMatch = buffer.match(/All files\s+\|\s*([\d.]+)/);
  if (coverageMatch) {
    coveragePercent = parseFloat(coverageMatch[1]).toFixed(1);
  }

  // Show summary at the very end
  if (cleanBuffer.includes('Waiting for file changes') && fileCount > 0 && !summaryShown) {
    if (!windowTimeout) {
      windowTimeout = setTimeout(() => {
        summaryShown = true;
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                       📊 ALL TESTS SUMMARY                        ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  📁 Test Files:   ${String(fileCount).padStart(3)} passed (${fileCount} total)                   ║`);
        console.log(`║  ✅ Tests:        ${String(testCount).padStart(3)} passed (${testCount} total)                   ║`);
        if (coveragePercent !== null && parseFloat(coveragePercent) > 0) {
          console.log(`║  📊 Coverage:     ${String(coveragePercent + '%').padStart(6)}                                          ║`);
        }
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        // Reset for next run
        setTimeout(() => {
          fileCount = 0;
          testCount = 0;
          coveragePercent = null;
          summaryShown = false;
          buffer = '';
          windowTimeout = null;
        }, 500);
      }, 100);
    }
  }

  // Keep buffer from growing too large
  if (buffer.length > 10000) {
    buffer = buffer.slice(-5000);
  }
}
