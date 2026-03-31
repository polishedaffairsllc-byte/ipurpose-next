const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
db.collection('leads').where('source', '==', 'workshop').get().then(snap => {
  if (snap.empty) {
    console.log('No workshop registrations yet.');
    process.exit(0);
    return;
  }
  console.log(snap.size + ' registration(s):');
  snap.forEach(doc => {
    const d = doc.data();
    const session = d.session || (d.context && d.context.session) || 'not set';
    const created = d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toISOString() : d.createdAt;
    console.log('  - ' + d.email + ' | ' + (d.firstName || d.name || 'no name') + ' | session: ' + session + ' | ' + created);
  });
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
