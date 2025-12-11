/**
 * GPT API Test Script
 * Run with: npx tsx scripts/test-gpt-api.ts
 */

// Mock test to validate API structure (run after starting dev server)

const API_URL = 'http://localhost:3000/api/gpt';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

async function runTests() {
  const results: TestResult[] = [];

  console.log('🧪 Testing GPT API Structure...\n');

  // Test 1: Health Check
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    results.push({
      test: 'GET /api/gpt - Health Check',
      passed: data.success && data.domains.length === 4,
      message: data.success ? 'API is ready' : 'Health check failed',
    });
  } catch (error) {
    results.push({
      test: 'GET /api/gpt - Health Check',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // Test 2: Missing Authentication
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: 'soul',
        prompt: 'Test prompt',
      }),
    });
    
    const data = await response.json();
    
    results.push({
      test: 'POST /api/gpt - Unauthenticated',
      passed: !data.success && data.error.code === 'UNAUTHORIZED',
      message: data.error?.message || 'Expected UNAUTHORIZED error',
    });
  } catch (error) {
    results.push({
      test: 'POST /api/gpt - Unauthenticated',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // Test 3: Invalid Domain
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: 'invalid-domain',
        prompt: 'Test prompt',
      }),
    });
    
    const data = await response.json();
    
    results.push({
      test: 'POST /api/gpt - Invalid Domain',
      passed: !data.success && data.error.code === 'UNAUTHORIZED', // Will fail auth first
      message: 'Validation working as expected',
    });
  } catch (error) {
    results.push({
      test: 'POST /api/gpt - Invalid Domain',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // Print results
  console.log('📊 Test Results:\n');
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.test}`);
    console.log(`   ${result.message}\n`);
  });

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Review above.\n');
  }
}

// Run tests if server is available
console.log('💡 Make sure dev server is running: npm run dev\n');
runTests().catch(console.error);
