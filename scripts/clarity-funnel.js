const admin = require('/Users/renita.hamilton/Desktop/ipurpose-next/node_modules/firebase-admin');

const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
if (!raw) { console.error('No FIREBASE_SERVICE_ACCOUNT env var'); process.exit(1); }

const serviceAccount = JSON.parse(raw);
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function run() {
  // Total submissions
  const allSnap = await db.collection('clarityCheckSubmissions').get();
  console.log('\n=== CLARITY CHECK FUNNEL ===');
  console.log('Total quiz completions:', allSnap.size);

  // With email (converted to lead)
  const withEmail = allSnap.docs.filter(d => {
    const e = d.data().email;
    return e && e !== 'not_provided' && e !== '';
  });
  console.log('With email (leads):', withEmail.length);

  if (allSnap.size > 0) {
    const rate = ((withEmail.length / allSnap.size) * 100).toFixed(1);
    console.log('Email capture rate:', rate + '%');
  }

  // By identity type
  const byType = {};
  allSnap.docs.forEach(d => {
    const t = d.data().identityType || 'unknown';
    byType[t] = (byType[t] || 0) + 1;
  });
  console.log('\nBy identity type:', JSON.stringify(byType, null, 2));

  // Last 7 days
  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = allSnap.docs.filter(d => {
    const ts = d.data().submittedAt;
    return ts && ts.toDate && ts.toDate() > week;
  });
  console.log('\nLast 7 days:', recent.length);

  // Leads collection (email was captured on results page)
  const leadsSnap = await db.collection('leads').where('source', '==', 'clarity_check').get();
  console.log('\n=== LEADS FROM CLARITY CHECK ===');
  console.log('Total leads with email:', leadsSnap.size);

  if (leadsSnap.size > 0) {
    const leads = leadsSnap.docs.map(d => {
      const data = d.data();
      return {
        email: data.email,
        identityType: data.identityType || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    console.log('Leads:', JSON.stringify(leads, null, 2));
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
