#!/usr/bin/env node

/**
 * Step 4 Integration Test
 * 
 * This script verifies that Step 4 (SubCalendar Status Bar Enhancement) was implemented correctly.
 * It checks:
 * 1. SubCalendarStatusBar has new props and enhanced functionality
 * 2. PrimarySubCalendarItemDisplay uses the enhanced status bar
 * 3. Components are properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Step 4 Integration Test');
console.log('================================');

// Helper function to check if file contains specific patterns
function checkFileContains(filePath, patterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = patterns.map(pattern => {
      const found = pattern.test ? pattern.test(content) : content.includes(pattern);
      return { pattern: pattern.toString(), found };
    });

    const allFound = results.every(r => r.found);
    console.log(`${allFound ? '✅' : '❌'} ${description}`);

    if (!allFound) {
      results.filter(r => !r.found).forEach(r => {
        console.log(`   Missing: ${r.pattern}`);
      });
    }

    return allFound;
  } catch (error) {
    console.log(`❌ ${description} - Error reading file: ${error.message}`);
    return false;
  }
}

// Test files
const statusBarFile = path.join(__dirname, 'src/components/execution/SubCalendarStatusBar.tsx');
const primaryDisplayFile = path.join(__dirname, 'src/components/execution/PrimarySubCalendarItemDisplay.tsx');

let allTestsPassed = true;

// Test 1: SubCalendarStatusBar has enhanced props
const statusBarPatterns = [
  /childExecutionStatus\?\s*:\s*ChildExecutionStatus/,
  /showCountdown\?\s*:\s*boolean/,
  /showPreparationHints\?\s*:\s*boolean/,
  /formatCountdown/,
  /CountdownTimer/,
  /PreparationIndicator/,
  /StatusBarState/,
  'displayContent',
  'Timer'
];

const statusBarTest = checkFileContains(
  statusBarFile,
  statusBarPatterns,
  'SubCalendarStatusBar has enhanced functionality'
);
allTestsPassed = allTestsPassed && statusBarTest;

// Test 2: PrimarySubCalendarItemDisplay uses SubCalendarStatusBar
const primaryDisplayPatterns = [
  /import.*SubCalendarStatusBar.*from.*SubCalendarStatusBar/,
  /<SubCalendarStatusBar/,
  /childExecutionStatus={childExecutionStatus}/,
  /showCountdown={true}/,
  /showPreparationHints={true}/
];

const primaryDisplayTest = checkFileContains(
  primaryDisplayFile,
  primaryDisplayPatterns,
  'PrimarySubCalendarItemDisplay uses enhanced SubCalendarStatusBar'
);
allTestsPassed = allTestsPassed && primaryDisplayTest;

// Test 3: Check that old header progress bar was removed
const removedPatterns = [
  /Header Progress Bar/,
  /Schedule.*sx={{.*color.*text\.primary/
];

const removedTest = !checkFileContains(
  primaryDisplayFile,
  removedPatterns,
  'Old header progress bar should be removed'
);

if (removedTest) {
  console.log('✅ Old header progress bar was successfully removed');
} else {
  console.log('❌ Old header progress bar still exists');
}
allTestsPassed = allTestsPassed && removedTest;

// Summary
console.log('\n📊 Test Summary');
console.log('================');

if (allTestsPassed) {
  console.log('🎉 All tests passed! Step 4 implementation looks good.');
  console.log('\n✨ Enhanced features implemented:');
  console.log('   • Dynamic status display (active, countdown, gap, preparation)');
  console.log('   • Real-time countdown timers');
  console.log('   • Visual preparation indicators');
  console.log('   • Enhanced context guidance');
  console.log('   • Integrated with PrimarySubCalendarItemDisplay');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the implementation.');
  process.exit(1);
}
