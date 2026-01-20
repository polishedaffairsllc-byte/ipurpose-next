/**
 * Health Check Endpoint
 * Verifies system status and dependencies
 */

import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { checkOpenAIHealth } from '../gpt/utils/openai-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    checks: {
      firebase: { status: 'unknown' as 'ok' | 'error' | 'unknown', latency: 0 },
      openai: { status: 'unknown' as 'ok' | 'error' | 'unknown', latency: 0 },
      environment: { status: 'unknown' as 'ok' | 'error' | 'unknown', missing: [] as string[] },
    },
  };

  // Check Firebase
  try {
    const start = Date.now();
    await firebaseAdmin.firestore().collection('_health').doc('check').set({
      timestamp: new Date(),
    }, { merge: true });
    checks.checks.firebase = {
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    checks.checks.firebase = { status: 'error', latency: 0 };
    checks.status = 'degraded';
  }

  // Check OpenAI
  try {
    const start = Date.now();
    const openaiHealthy = await checkOpenAIHealth();
    checks.checks.openai = {
      status: openaiHealthy ? 'ok' : 'error',
      latency: Date.now() - start,
    };
    if (!openaiHealthy) checks.status = 'degraded';
  } catch (error) {
    checks.checks.openai = { status: 'error', latency: 0 };
    checks.status = 'degraded';
  }

  // Check Environment Variables
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
  
  if (missing.length > 0) checks.status = 'unhealthy';

  const statusCode = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 207 : 503;

  return NextResponse.json(checks, { status: statusCode });
}
