import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/leads';
import { rateLimit } from '@/lib/rate-limit-simple';
import { sendWorkshopConfirmationEmail, sendWorkshopFounderNotification } from '@/lib/email-automation';

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

    return NextResponse.json({ ok: true, id: result.id, deduped: result.deduped });
  } catch (error) {
    console.error('[WORKSHOP] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
