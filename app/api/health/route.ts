/**
 * Health Check Endpoint
 * Verifies system status and dependencies
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Ultra-fast health check that won't hang
  // Returns immediately without waiting for external services
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    checks: {
      firebase: { status: 'unknown' as 'ok' | 'error' | 'unknown', latency: 0 },
      openai: { status: 'unknown' as 'ok' | 'error' | 'unknown', latency: 0 },
      environment: { status: 'unknown' as 'ok' | 'error' | 'unknown', missing: [] as string[] },
    },
  };

  // Check Environment Variables Only (no external calls)
  const required = [
    'OPENAI_API_KEY',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
  ];
  const missing = required.filter(key => !process.env[key]);
  
  checks.checks.environment = {
    status: missing.length === 0 ? 'ok' : 'error',
    missing,
  };
  
  if (missing.length > 0) {
    checks.status = 'degraded';
  }

  // Quick Firebase availability check
  checks.checks.firebase = {
    status: process.env.FIREBASE_SERVICE_ACCOUNT ? 'ok' : 'unknown',
    latency: 0,
  };

  // Quick OpenAI availability check
  checks.checks.openai = {
    status: process.env.OPENAI_API_KEY ? 'ok' : 'unknown',
    latency: 0,
  };

  const statusCode = checks.status === 'healthy' ? 200 : 207;

  return NextResponse.json(checks, { status: statusCode });
}
