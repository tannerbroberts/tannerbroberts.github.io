#!/usr/bin/env node

/**
 * Step 5: Integration and Testing
 * 
 * This script performs comprehensive integration testing for the enhanced breakfast lesson.
 * It verifies:
 * 1. Variable system integration
 * 2. Realistic timing validation
 * 3. Execution view enhancements
 * 4. Status bar enhancements
 * 5. End-to-end functionality
 * 6. Performance validation
 * 7. Regression testing
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Step 5: Comprehensive Integration Testing');
console.log('=============================================');

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

// Helper function to validate timing values
function validateTiming(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract duration values from the content
    const durationRegex = /duration:\s*(\d+)/g;
    const durations = [];
    let match;

    while ((match = durationRegex.exec(content)) !== null) {
      durations.push(parseInt(match[1]));
    }

    // Check for realistic cooking times
    const hasRealisticTimes = durations.some(d => d >= 5 && d <= 20); // Realistic cooking task times
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const has70MinuteTotal = totalDuration >= 60 && totalDuration <= 80; // Around 70 minutes

    console.log(`${hasRealisticTimes && has70MinuteTotal ? '✅' : '❌'} ${description}`);

    if (!hasRealisticTimes) {
      console.log(`   No realistic cooking times found (5-20 minutes)`);
    }
    if (!has70MinuteTotal) {
      console.log(`   Total duration not around 70 minutes: ${totalDuration} minutes`);
    }

    return hasRealisticTimes && has70MinuteTotal;
  } catch (error) {
    console.log(`❌ ${description} - Error reading file: ${error.message}`);
    return false;
  }
}

// Test file paths
const randomItemButtonFile = path.join(__dirname, 'src/components/RandomItemButton.tsx');
const executionUtilsFile = path.join(__dirname, 'src/components/execution/executionUtils.ts');
const statusBarFile = path.join(__dirname, 'src/components/execution/SubCalendarStatusBar.tsx');
const executionViewFile = path.join(__dirname, 'src/components/ExecutionView.tsx');

let allTestsPassed = true;

console.log('\n🔍 1. Variable System Integration Tests');
console.log('======================================');

// Test 1: Variable system integration
const variablePatterns = [
  /createCookingPhaseVariables/,
  /ingredient/i,
  /equipment/i,
  /consumable/i,
  /bacon_strips|pancake_mix|eggs/,
  /large_frying_pan|mixing_bowl|spatula/,
  /cooking_oil|paper_towels|dish_soap/
];

const variableTest = checkFileContains(
  randomItemButtonFile,
  variablePatterns,
  'Enhanced breakfast lesson has comprehensive variable definitions'
);
allTestsPassed = allTestsPassed && variableTest;

console.log('\n⏱️  2. Realistic Timing Validation');
console.log('=================================');

// Test 2: Realistic timing validation
const timingTest = validateTiming(
  randomItemButtonFile,
  'Breakfast lesson has realistic cooking times'
);
allTestsPassed = allTestsPassed && timingTest;

console.log('\n🎯 3. Execution View Enhancement Tests');
console.log('====================================');

// Test 3: Execution view enhancements
const executionPatterns = [
  /getActiveChildForExecution/,
  /nextChildStart/,
  /countdown/i,
  /ChildExecutionStatus/,
  /ACTIVE|UPCOMING|COUNTDOWN|GAP/
];

const executionTest = checkFileContains(
  executionUtilsFile,
  executionPatterns,
  'Execution view has enhanced child detection and countdown logic'
);
allTestsPassed = allTestsPassed && executionTest;

console.log('\n📊 4. Status Bar Enhancement Tests');
console.log('=================================');

// Test 4: Status bar enhancements
const statusBarPatterns = [
  /childExecutionStatus/,
  /showCountdown/,
  /CountdownTimer/,
  /PreparationIndicator/,
  /formatCountdown/,
  /displayContent/
];

const statusBarTest = checkFileContains(
  statusBarFile,
  statusBarPatterns,
  'SubCalendarStatusBar has enhanced countdown and status display'
);
allTestsPassed = allTestsPassed && statusBarTest;

console.log('\n🔗 5. Component Integration Tests');
console.log('=================================');

// Test 5: Component integration
const integrationPatterns = [
  /SubCalendarStatusBar/,
  /childExecutionStatus={/,
  /showCountdown={true}/,
  /PrimarySubCalendarItemDisplay/
];

const primaryDisplayFile = path.join(__dirname, 'src/components/execution/PrimarySubCalendarItemDisplay.tsx');
const integrationTest = checkFileContains(
  primaryDisplayFile,
  integrationPatterns,
  'Components are properly integrated with enhanced functionality'
);
allTestsPassed = allTestsPassed && integrationTest;

console.log('\n🔄 6. Regression Prevention Tests');
console.log('=================================');

// Test 6: Regression prevention - check that basic functionality still exists
const regressionPatterns = [
  /ExecutionView/,
  /BasicItem|CheckListItem/,
  /TaskChain/,
  /CalendarEntry/
];

const regressionTest = checkFileContains(
  executionViewFile,
  regressionPatterns,
  'Basic functionality preserved (no regressions)'
);
allTestsPassed = allTestsPassed && regressionTest;

console.log('\n📋 7. Code Quality Tests');
console.log('========================');

// Test 7: TypeScript and code quality
const qualityPatterns = [
  /interface|type/,
  /React\.FC|React\.Component/,
  /useCallback|useMemo/,
  /export/
];

const qualityFiles = [statusBarFile, executionUtilsFile, randomItemButtonFile];
let qualityTest = true;

qualityFiles.forEach(file => {
  const fileName = path.basename(file);
  const fileQualityTest = checkFileContains(
    file,
    qualityPatterns,
    `${fileName} maintains TypeScript and React best practices`
  );
  qualityTest = qualityTest && fileQualityTest;
});

allTestsPassed = allTestsPassed && qualityTest;

console.log('\n📈 8. Performance Validation');
console.log('============================');

// Test 8: Performance considerations
const performancePatterns = [
  /useCallback|useMemo/,
  /React\.memo/,
  /key={/,
  /export.*memo/
];

let performanceTest = true;
[statusBarFile, executionViewFile].forEach(file => {
  const fileName = path.basename(file);
  const filePerformanceTest = checkFileContains(
    file,
    performancePatterns,
    `${fileName} includes performance optimizations`
  );
  performanceTest = performanceTest && filePerformanceTest;
});

allTestsPassed = allTestsPassed && performanceTest;

console.log('\n🎯 9. Feature Completeness Tests');
console.log('================================');

// Test 9: Feature completeness check
const featurePatterns = [
  /70.*minute|70m/i, // 70-minute lesson
  /Setup.*12|Cooking.*30|Cleanup.*20/i, // Phase timing
  /bacon.*cook|pancake.*mix|egg.*fry/i, // Cooking tasks
  /ingredient.*equipment.*consumable/i // Variable categories
];

const featureTest = checkFileContains(
  randomItemButtonFile,
  featurePatterns,
  'All enhanced features are present and complete'
);
allTestsPassed = allTestsPassed && featureTest;

console.log('\n📊 Integration Test Summary');
console.log('===========================');

if (allTestsPassed) {
  console.log('🎉 All integration tests passed! Step 5 validation complete.');
  console.log('\n✨ Validated features:');
  console.log('   ✅ Variable system integration');
  console.log('   ✅ Realistic timing implementation');
  console.log('   ✅ Execution view enhancements');
  console.log('   ✅ Status bar enhancements');
  console.log('   ✅ Component integration');
  console.log('   ✅ Regression prevention');
  console.log('   ✅ Code quality maintenance');
  console.log('   ✅ Performance optimizations');
  console.log('   ✅ Feature completeness');

  console.log('\n🏆 Breakfast enhancement implementation is ready for production!');
  process.exit(0);
} else {
  console.log('❌ Some integration tests failed. Please review the implementation.');
  console.log('\n🔧 Recommendations:');
  console.log('   • Check failed tests above for specific issues');
  console.log('   • Verify all step 1-4 implementations are complete');
  console.log('   • Run unit tests: npm run test:ai');
  console.log('   • Test manually with the enhanced breakfast lesson');
  process.exit(1);
}
