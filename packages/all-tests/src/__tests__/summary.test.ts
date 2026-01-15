// This file prints summary after all tests complete
console.log('[SUMMARY] Loading...');

let fileCount = 0;
let testCount = 0;

// Hook into console to count tests
const originalLog = console.log;
console.log = (...args: any[]) => {
  const msg = args.join(' ');

  // Count test files
  const fileMatch = msg.match(/✓.*?\((\d+) tests?\)/);
  if (fileMatch) {
    fileCount++;
    testCount += parseInt(fileMatch[1], 10);
  }

  // Print summary at the very end
  if (msg.includes('Waiting for file changes') && fileCount > 0) {
    process.stdout.write('\n╔══════════════════════════════════════════════════════════════════╗\n');
    process.stdout.write('║                       📊 ALL TESTS SUMMARY                        ║\n');
    process.stdout.write('╠══════════════════════════════════════════════════════════════════╣\n');
    process.stdout.write(`║  📁 Test Files:  ${String(fileCount).padStart(3)} passed  (${fileCount} total)                     `.padEnd(64) + '║\n');
    process.stdout.write(`║  ✅ Tests:       ${String(testCount).padStart(3)} passed  (${testCount} total)                        `.padEnd(64) + '║\n');
    process.stdout.write('╚══════════════════════════════════════════════════════════════════╝\n\n');

    // Reset for next run
    fileCount = 0;
    testCount = 0;
  }

  originalLog.apply(console, args);
};

export {};
