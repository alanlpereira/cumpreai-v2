const { execSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 CUMPREAI OS V2 - PHASE 4 FULL E2E SUITE VERIFICATION');
console.log('====================================================\n');

try {
  console.log('▶ [1/3] Running Phase 1 Router Engine Verification...');
  const res1 = execSync('node backend/test_phase1_router.js', { encoding: 'utf8' });
  console.log(res1);

  console.log('▶ [2/3] Running Phase 2 Sub-Page Extraction Verification...');
  const res2 = execSync('node backend/test_phase2_subpages.js', { encoding: 'utf8' });
  console.log(res2);

  console.log('▶ [3/3] Running Phase 3 E2E Integration Verification...');
  const res3 = execSync('node backend/test_phase3_e2e.js', { encoding: 'utf8' });
  console.log(res3);

  console.log('====================================================');
  console.log('🟢 ALL E2E TEST SUITES PASSED CLEANLY! ZERO REGRESSIONS DETECTED.');
  console.log('====================================================');
} catch (err) {
  console.error('❌ E2E Test Suite Execution Failed:', err.message);
  process.exit(1);
}
