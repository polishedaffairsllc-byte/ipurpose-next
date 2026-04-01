import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/leads';
import { rateLimit } from '@/lib/rate-limit-simple';
import { sendWorkshopConfirmationEmail, sendWorkshopFounderNotification, sendWorkshopAccountEmail } from '@/lib/email-automation';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

interface WorkshopRegistrationRequest {
  firstName: string;
  email: string;
  session?: string;
  building?: string;
  website?: string; // honeypot
}

const workshopLimiter = rateLimit({ requests: 5, window: 60 * 1000 });

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WorkshopRegistrationRequest;
    const { firstName, building, website, session } = body;
    const email = (body.email || '').trim().toLowerCase();

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate limit
    const rateCheck = workshopLimiter.check(`workshop:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });
    }

    // Honeypot
    if (website && website.trim().length > 0) {
      return NextResponse.json({ ok: true, id: 'honeypot-dropped', deduped: false });
    }

    if (!email || !firstName) {
      return NextResponse.json({ ok: false, error: 'Name and email are required.' }, { status: 400 });
    }

    const context = {
      userAgent: request.headers.get('user-agent'),
      ip,
      referer: request.headers.get('referer'),
      pathname: '/workshop',
      building: building || null,
      session: session || null,
    };

    // Save to leads collection
    const result = await processLead('workshop', firstName, email, context);

    if (!result.ok) {
      console.error('[WORKSHOP] Lead processing failed:', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    // Send confirmation email (non-blocking)
    sendWorkshopConfirmationEmail({ email, name: firstName, session: session || null }).catch((err) =>
      console.error('[WORKSHOP] Confirmation email failed:', err)
    );

    // Notify founder (non-blocking)
    sendWorkshopFounderNotification({ name: firstName, email, session: session || null, building: building || null }).catch((err) =>
      console.error('[WORKSHOP] Founder notification failed:', err)
    );

    // Auto-create Firebase account for this registrant (non-blocking pipeline)
    ;(async () => {
      try {
        // Create user — if they already have an account this will throw auth/email-already-exists
        let uid: string | null = null;
        try {
          const userRecord = await firebaseAdmin.auth().createUser({
            email,
            displayName: firstName,
          });
          uid = userRecord.uid;
          console.log(`[WORKSHOP] Account created for ${email} (${uid})`);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-exists') {
            const existing = await firebaseAdmin.auth().getUserByEmail(email);
            uid = existing.uid;
            console.log(`[WORKSHOP] Account already exists for ${email} (${uid})`);
          } else {
            throw createErr;
          }
        }

        if (uid) {
          // Upsert user doc with workshop role and session
          const db = firebaseAdmin.firestore();
          await db.collection('users').doc(uid).set(
            {
              email,
              displayName: firstName,
              role: 'workshop',
              workshopSession: session || null,
              source: 'workshop_free',
              updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          // Generate a password-reset / set-password magic link and email it
          const passwordResetLink = await firebaseAdmin.auth().generatePasswordResetLink(email);
          await sendWorkshopAccountEmail({
            name: firstName,
            email,
            session: session || null,
            passwordResetLink,
          });
        }
      } catch (accountErr) {
        console.error('[WORKSHOP] Auto-account creation pipeline failed:', accountErr);
      }
    })();

    return NextResponse.json({ ok: true, id: result.id, deduped: result.deduped });
  } catch (error) {
    console.error('[WORKSHOP] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
