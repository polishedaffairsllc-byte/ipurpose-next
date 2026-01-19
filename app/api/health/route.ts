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

  // Check Firebase - with timeout to prevent hanging
  try {
    const firebasePromise = new Promise<number>(async (resolve) => {
      const start = Date.now();
      try {
        // Only attempt if Firebase is initialized
        if (firebaseAdmin.apps.length === 0) {
          resolve(0);
          return;
        }
        await firebaseAdmin.firestore().collection('_health').doc('check').set({
          timestamp: new Date(),
        }, { merge: true });
        resolve(Date.now() - start);
      } catch (e) {
        resolve(0);
      }
    });

    const timeoutPromise = new Promise<number>((resolve) => {
      setTimeout(() => resolve(0), 2000); // 2 second timeout
    });

    const latency = await Promise.race([firebasePromise, timeoutPromise]);
    checks.checks.firebase = {
      status: latency > 0 ? 'ok' : 'error',
      latency,
    };
    if (latency === 0) checks.status = 'degraded';
  } catch (error) {
    checks.checks.firebase = { status: 'error', latency: 0 };
    checks.status = 'degraded';
  }

  // Check OpenAI - with timeout
  try {
    const openaiPromise = new Promise<boolean>(async (resolve) => {
      try {
        const result = await checkOpenAIHealth();
        resolve(result);
      } catch (e) {
        resolve(false);
      }
    });

    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 2000); // 2 second timeout
    });

    const start = Date.now();
    const openaiHealthy = await Promise.race([openaiPromise, timeoutPromise]);
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
