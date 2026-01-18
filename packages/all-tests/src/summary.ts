/**
 * Dark theme for vitest output - Midnight Blue
 * Replaces bright vitest colors with softer dark theme colors
 */

// Midnight blue color map - replaces bright ANSI colors
const colorMap = {
  // Bright green (passing) -> soft mint
  '\x1b[32m': '\x1b[38;5;151m',
  '\x1b[1;32m': '\x1b[38;5;151m',

  // Bright red (failing) -> soft red
  '\x1b[31m': '\x1b[38;5;203m',
  '\x1b[1;31m': '\x1b[38;5;203m',

  // Bright yellow (warnings) -> soft amber
  '\x1b[33m': '\x1b[38;5;229m',
  '\x1b[1;33m': '\x1b[38;5;229m',

  // Bright cyan/white -> soft blue-grey
  '\x1b[36m': '\x1b[38;5;117m',
  '\x1b[1;36m': '\x1b[38;5;75m',
  '\x1b[37m': '\x1b[38;5;253m',
  '\x1b[1;37m': '\x1b[38;5;253m',
  '\x1b[90m': '\x1b[38;5;245m',
  '\x1b[39m': '\x1b[38;5;253m',

  // Backgrounds - dark
  '\x1b[46m': '\x1b[48;5;236m',
  '\x1b[30m': '\x1b[38;5;240m',
  '\x1b[49m': '\x1b[0m',
};

// Apply color transformations to a string
function applyDarkTheme(str: string): string {
  let result = str;
  for (const [bright, dark] of Object.entries(colorMap)) {
    result = result.split(bright).join(dark);
  }
  return result;
}

// Store test counts for dark summary
const testCounts = {
  files: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  duration: 0,
};

let summaryPrinted = false;
let startTime = Date.now();

// ANSI codes for dark theme
const c = {
  reset: '\x1b[0m',
  border: '\x1b[38;5;59m',
  borderBright: '\x1b[38;5;68m',
  text: '\x1b[38;5;253m',
  textMuted: '\x1b[38;5;245m',
  textDim: '\x1b[38;5;240m',
  cyan: '\x1b[38;5;117m',
  success: '\x1b[38;5;151m',
  error: '\x1b[38;5;203m',
  bgPanel: '\x1b[48;5;236m',
};

function printSummary() {
  if (testCounts.files === 0 || summaryPrinted) return;

  summaryPrinted = true;
  const total = testCounts.passed + testCounts.failed + testCounts.skipped;
  const passRate = total > 0 ? ((testCounts.passed / total) * 100).toFixed(1) : '---';
  const duration = testCounts.duration >= 1000
    ? `${(testCounts.duration / 1000).toFixed(1)}s`
    : `${testCounts.duration}ms`;

  console.log('');
  console.log('');
  console.log(`${c.borderBright}┌────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.borderBright}│${c.reset} ${c.cyan}» ALL TESTS SUMMARY${c.reset}                                          ${c.borderBright}│${c.reset}`);
  console.log(`${c.borderBright}├────────────────────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.border}│${c.reset} ${c.text}Files${c.reset}      ${c.bgPanel} ${String(testCounts.files).padStart(4)} ${c.reset} ${c.bgPanel} ${String(total).padStart(5)} ${c.reset} ${c.textMuted}files/tests${c.reset}   ${c.border}│${c.reset}`);

  if (testCounts.passed > 0) {
    console.log(`${c.border}│${c.reset} ${c.success}Passed${c.reset}     ${c.bgPanel} ${String(testCounts.passed).padStart(4)} ${c.reset} ${c.bgPanel} ${passRate.padStart(5)}%${c.reset} ${c.textMuted}pass rate${c.reset}    ${c.border}│${c.reset}`);
  }

  if (testCounts.failed > 0) {
    console.log(`${c.border}│${c.reset} ${c.error}Failed${c.reset}     ${c.bgPanel} ${String(testCounts.failed).padStart(4)} ${c.reset} ${c.bgPanel}     -- ${c.reset} ${c.textMuted}errors${c.reset}      ${c.border}│${c.reset}`);
  }

  if (testCounts.skipped > 0) {
    console.log(`${c.border}│${c.reset} ${c.textDim}Skipped${c.reset}   ${c.bgPanel} ${String(testCounts.skipped).padStart(4)} ${c.reset} ${c.bgPanel}     -- ${c.reset} ${c.textMuted}pending${c.reset}     ${c.border}│${c.reset}`);
  }

  console.log(`${c.border}│${c.reset} ${c.text}Time${c.reset}       ${c.bgPanel} ${duration.padStart(7)} ${c.reset} ${c.bgPanel}     -- ${c.reset} ${c.textMuted}duration${c.reset}    ${c.border}│${c.reset}`);
  console.log(`${c.borderBright}└────────────────────────────────────────────────────────────┘${c.reset}`);
  console.log('');

  // Reset for next run
  setTimeout(() => {
    Object.assign(testCounts, { files: 0, passed: 0, failed: 0, skipped: 0, duration: 0 });
    summaryPrinted = false;
    startTime = Date.now();
  }, 500);
}

// Override console.log to apply dark theme and track counts
const originalLog = console.log;
console.log = (...args: any[]) => {
  const msg = args.join(' ');

  // Track test counts
  const testMatch = msg.match(/\(\s*(\d+)\s+tests?\)/);
  if (testMatch && msg.includes('✓')) {
    const tests = parseInt(testMatch[1], 10);
    testCounts.files++;
    testCounts.passed += tests;
  }

  const failedMatch = msg.match(/(\d+)\s+failed/);
  if (failedMatch) {
    testCounts.failed = parseInt(failedMatch[1], 10);
  }

  const skippedMatch = msg.match(/(\d+)\s+skipped/);
  if (skippedMatch) {
    testCounts.skipped = parseInt(skippedMatch[1], 10);
  }

  // Detect end of test run
  if ((msg.includes('Test Files') || msg.includes('Duration')) && testCounts.files > 0) {
    testCounts.duration = Date.now() - startTime;
    setTimeout(() => printSummary(), 100);
  }

  // Apply dark theme color transformations
  const themedMsg = applyDarkTheme(msg);
  originalLog.apply(console, [themedMsg]);
};

// Override console.error and console.warn for consistent theming
const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args.join(' ');
  const themedMsg = applyDarkTheme(msg);
  originalError.apply(console, [themedMsg]);
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.join(' ');
  const themedMsg = applyDarkTheme(msg);
  originalWarn.apply(console, [themedMsg]);
};

// Print summary on exit
process.on('SIGINT', () => {
  printSummary();
  process.exit(0);
});
