// Track test run
let runCount = 0;
let summaryPrinted = false;

// Store test counts
const testCounts = {
  files: 0,
  tests: 0,
};

// Print summary at the end of test run
function printSummary() {
  if (testCounts.tests > 0 && !summaryPrinted) {
    summaryPrinted = true;
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                       📊 ALL TESTS SUMMARY                        ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  📁 Test Files:  ${String(testCounts.files).padStart(3)} passed  (${testCounts.files} total)                     `.padEnd(64) + '║');
    console.log(`║  ✅ Tests:       ${String(testCounts.tests).padStart(3)} passed  (${testCounts.tests} total)                        `.padEnd(64) + '║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // Reset for next run
    setTimeout(() => {
      testCounts.files = 0;
      testCounts.tests = 0;
      summaryPrinted = false;
    }, 500);
  }
}

// Parse vitest output for test counts
const originalLog = console.log;
console.log = (...args: any[]) => {
  const msg = args.join(' ');

  // Count test files
  const fileMatch = msg.match(/✓.*?\((\d+) tests?\)/);
  if (fileMatch) {
    testCounts.files++;
    testCounts.tests += parseInt(fileMatch[1], 10);
  }

  // Detect end of test run (after "Waiting for file changes" or "Failed")
  if ((msg.includes('Waiting for file changes') || msg.includes('Failed Tests') || msg.includes('PASS')) && testCounts.tests > 0) {
    setTimeout(() => printSummary(), 50);
  }

  originalLog.apply(console, args);
};

// Print summary on exit
process.on('SIGINT', () => {
  printSummary();
  process.exit(0);
});
