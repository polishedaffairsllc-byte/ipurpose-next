import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/apiEntitlementHelper';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getPurposeProfile, savePurposeProfile, deletePurposeProfile } from '@/lib/purpose/profile';
import { getLatestQuestionnaire, legacyAccountEmail } from '@/lib/clarity/latestQuestionnaire';
import { purposeCopy } from '@/mobile/src/lib/purposeCheckCopy';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
async function clarityIdentity(uid: string) {
    const authUser = await firebaseAdmin.auth().getUser(uid);
    const questionnaire = await getLatestQuestionnaire(firebaseAdmin.firestore(), uid, legacyAccountEmail(authUser));
    const identity = questionnaire?.identityType;
    return typeof identity === 'string' && ['Visionary', 'Builder', 'Nurturer', 'Strategist', 'Creator'].includes(identity) ? identity : null;
}
export async function GET() {
    const auth = await requireAuthenticated();
    if (auth.error)
        return auth.error;
    try {
        const [purposeProfile, identityType] = await Promise.all([getPurposeProfile(firebaseAdmin.firestore(), auth.uid), clarityIdentity(auth.uid).catch(() => {
            // Clarity pairing is optional; it must not gate the Purpose assessment.
            console.warn('Purpose optional Clarity context unavailable');
            return null;
        })]);
        return NextResponse.json({ purposeProfile, identityType }, { headers });
    }
    catch {
        return NextResponse.json({ error: purposeCopy.unavailable }, { status: 500, headers });
    }
}
export async function PUT(request: NextRequest) {
    const auth = await requireAuthenticated();
    if (auth.error)
        return auth.error;
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return NextResponse.json({ error: purposeCopy.invalid }, { status: 400, headers });
    }
    try {
        const purposeProfile = await savePurposeProfile(firebaseAdmin.firestore(), auth.uid, body);
        return NextResponse.json({ purposeProfile }, { headers });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : '';
        const validation = [purposeCopy.invalid, purposeCopy.unsupported, purposeCopy.reflectionInvalid].includes(message);
        return NextResponse.json({ error: validation ? message : purposeCopy.saveError }, { status: validation ? 400 : 500, headers });
    }
}
export async function DELETE() {
    const auth = await requireAuthenticated();
    if (auth.error)
        return auth.error;
    try {
        await deletePurposeProfile(firebaseAdmin.firestore(), auth.uid, firebaseAdmin.firestore.FieldValue.delete());
        return NextResponse.json({ success: true }, { headers });
    }
    catch {
        return NextResponse.json({ error: purposeCopy.deleteError }, { status: 500, headers });
    }
}
