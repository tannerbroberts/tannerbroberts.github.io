const fs = require('fs');
const path = require('path');

// First, let's just read and execute the TypeScript to see what values are returned
console.log('=== Checking DEFAULT_TIME_THRESHOLDS ===');

// Let's compile and run just the constants part
const typesContent = fs.readFileSync('src/components/accounting/types/badgeSettings.ts', 'utf8');

// Extract just the constants part 
const lines = typesContent.split('\n');
let inDefaultTimeThresholds = false;
let defaultTimeThresholdsCode = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('DEFAULT_TIME_THRESHOLDS')) {
    inDefaultTimeThresholds = true;
  }

  if (inDefaultTimeThresholds) {
    defaultTimeThresholdsCode += line + '\n';
    if (line.includes('};') && !line.includes('//')) {
      break;
    }
  }
}

console.log('Found DEFAULT_TIME_THRESHOLDS code:');
console.log(defaultTimeThresholdsCode);

// Calculate the values manually
console.log('\n=== Manual calculations ===');
console.log('5 * 60 * 1000 =', 5 * 60 * 1000);
console.log('30 * 60 * 1000 =', 30 * 60 * 1000);
console.log('2 * 60 * 60 * 1000 =', 2 * 60 * 60 * 1000);
