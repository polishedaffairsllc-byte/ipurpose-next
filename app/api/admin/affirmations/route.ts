/**
 * POST /api/admin/affirmations
 * Admin endpoint to add/update affirmations in Firestore
 * 
 * Requires authentication AND admin privileges:
 * - Firebase ID token with custom claim admin=true, OR
 * - Admin secret
 * 
 * Returns:
 * - 401 Unauthorized: Missing/invalid auth or malformed header
 * - 403 Forbidden: Valid auth but lacks permissions
 * - 201 Created: Success
 */

import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

type AuthFailReason = 'MISSING_AUTH' | 'BAD_FORMAT' | 'INVALID_TOKEN' | 'NOT_ADMIN' | 'INVALID_SECRET';

interface AuthSuccess {
  ok: true;
  method: 'bearer' | 'secret';
  uid?: string;
}

interface AuthFailure {
  ok: false;
  status: 401 | 403;
  reason: AuthFailReason;
  message: string;
}

type AuthResult = AuthSuccess | AuthFailure;

/**
 * Verify Firebase ID token and check for admin custom claim
 * Returns structured result with explicit status code
 */
async function verifyFirebaseAdmin(token: string): Promise<AuthResult> {
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    // Check for admin custom claim
    if (decoded.admin === true) {
      return { ok: true, method: 'bearer', uid: decoded.uid };
    }

    // Valid token but not admin
    return {
      ok: false,
      status: 403,
      reason: 'NOT_ADMIN',
      message: 'User does not have admin privileges',
    };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      reason: 'INVALID_TOKEN',
      message: 'Invalid or expired Firebase token',
    };
  }
}

/**
 * Verify admin secret with timing-safe comparison
 * Returns structured result with explicit status code
 */
function verifyAdminSecret(secret: string): AuthResult {
  const adminSecret = process.env.ADMIN_SECRET;

  // Missing or empty secret env var
  if (!adminSecret) {
    return {
      ok: false,
      status: 403,
      reason: 'INVALID_SECRET',
      message: 'Admin secret not configured',
    };
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    const match = timingSafeEqual(Buffer.from(secret), Buffer.from(adminSecret));
    if (match) {
      return { ok: true, method: 'secret' };
    }
  } catch (error) {
    // timingSafeEqual throws if buffers are different lengths
    // Treat as invalid secret
  }

  return {
    ok: false,
    status: 403,
    reason: 'INVALID_SECRET',
    message: 'Invalid admin secret',
  };
}

/**
 * Verify authorization header and return structured auth result
 * Handles Bearer tokens and admin secrets
 */
async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization')?.trim();

  // Missing Authorization header
  if (!authHeader) {
    return {
      ok: false,
      status: 401,
      reason: 'MISSING_AUTH',
      message: 'Missing Authorization header',
    };
  }

  // Check for Bearer token (Firebase ID token)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    if (!token) {
      return {
        ok: false,
        status: 401,
        reason: 'BAD_FORMAT',
        message: 'Bearer token is empty',
      };
    }

    return verifyFirebaseAdmin(token);
  }

  // Check for Secret (admin secret)
  if (authHeader.startsWith('Secret ')) {
    const secret = authHeader.substring(7).trim();

    if (!secret) {
      return {
        ok: false,
        status: 401,
        reason: 'BAD_FORMAT',
        message: 'Admin secret is empty',
      };
    }

    return verifyAdminSecret(secret);
  }

  // Invalid header format
  return {
    ok: false,
    status: 401,
    reason: 'BAD_FORMAT',
    message: 'Invalid Authorization header format. Use "Bearer <token>" or "Secret <secret>"',
  };
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth(request);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.message, reason: authResult.reason },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { text, active = true, order } = body;

    if (!text || order === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: text, order' },
        { status: 400 }
      );
    }

    const db = firebaseAdmin.firestore();
    const affirmationRef = await db.collection('affirmations').add({
      text,
      active,
      order,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { id: affirmationRef.id, text, active, order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating affirmation:', error);
    return NextResponse.json(
      { error: 'Failed to create affirmation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/affirmations
 * Get all affirmations for admin dashboard
 * Requires: Firebase ID token with admin custom claim OR admin secret
 * 
 * Returns:
 * - 401 Unauthorized: Missing/invalid auth or malformed header
 * - 403 Forbidden: Valid auth but lacks permissions
 * - 200 OK: Success
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth(request);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.message, reason: authResult.reason },
      { status: authResult.status }
    );
  }

  try {
    const db = firebaseAdmin.firestore();
    const snapshot = await db
      .collection('affirmations')
      .orderBy('order', 'asc')
      .get();

    const affirmations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ affirmations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching affirmations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affirmations' },
      { status: 500 }
    );
  }
}
