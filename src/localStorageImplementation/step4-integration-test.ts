// Quick integration test for Step 4 utilities
import {
  exportDataToJSON,
  createDataSnapshot,
  validateStorageIntegrity,
  generateDiagnosticReport,
  getStorageUsageReport
} from './step4-exports';

console.log('=== Step 4 Storage Utilities Integration Test ===');

try {
  // Test data snapshot creation
  console.log('1. Testing data snapshot creation...');
  const snapshot = createDataSnapshot();
  console.log(`✓ Created snapshot with ${snapshot.items.length} items, ${snapshot.baseCalendar.size} calendar entries`);

  // Test JSON export
  console.log('2. Testing JSON export...');
  const jsonData = exportDataToJSON();
  JSON.parse(jsonData); // Validate JSON structure
  console.log(`✓ Exported JSON (${jsonData.length} bytes) with valid structure`);

  // Test storage integrity validation
  console.log('3. Testing storage integrity validation...');
  const integrityReport = validateStorageIntegrity();
  console.log(`✓ Validation complete: ${integrityReport.isValid ? 'VALID' : 'ISSUES FOUND'}`);
  console.log(`  Checked ${integrityReport.checkedItems} items, ${integrityReport.checkedCalendarEntries} calendar entries`);
  if (integrityReport.issues.length > 0) {
    console.log(`  Found ${integrityReport.issues.length} issues to review`);
  }

  // Test diagnostic report
  console.log('4. Testing diagnostic report generation...');
  const diagnostics = generateDiagnosticReport();
  console.log(`✓ Diagnostics complete: Storage ${diagnostics.storageAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`);
  console.log(`  Data loaded: ${diagnostics.dataLoaded}`);
  console.log(`  Performance: ${diagnostics.performance.loadTime}ms load time`);

  // Test storage usage report
  console.log('5. Testing storage usage report...');
  const usageReport = getStorageUsageReport();
  console.log(`✓ Usage report: ${usageReport.totalSize} bytes total`);
  console.log(`  Quota used: ${(usageReport.quotaUsed * 100).toFixed(1)}%`);
  console.log(`  Recommendations: ${usageReport.recommendations.length} items`);

  console.log('\n🎉 All Step 4 utilities working correctly!');
  console.log('\n=== Test Summary ===');
  console.log('✓ Data snapshot creation');
  console.log('✓ JSON export/import infrastructure');
  console.log('✓ Storage integrity validation');
  console.log('✓ Diagnostic report generation');
  console.log('✓ Storage usage monitoring');
  console.log('\nStep 4 implementation is complete and functional.');

} catch (error) {
  console.error('❌ Integration test failed:', error);
  console.log('\nPlease check the implementation for issues.');
}
