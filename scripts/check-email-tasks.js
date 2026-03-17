const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
db.collection('emailTasks')
  .where('status', '==', 'pending')
  .get()
  .then(snapshot => {
    if (snapshot.empty) {
      console.log('No pending tasks found.');
      process.exit(0);
    }
    const now = new Date();
    console.log(`Found ${snapshot.size} pending task(s):\n`);
    snapshot.docs.forEach(doc => {
      const d = doc.data();
      const scheduled = d.scheduledFor?.toDate?.() || new Date(d.scheduledFor);
      const due = scheduled <= now;
      console.log({
        id: doc.id,
        email: d.email,
        name: d.name,
        type: d.type,
        scheduledFor: scheduled.toISOString(),
        dueNow: due,
      });
    });
    process.exit(0);
  })
  .catch(e => { console.error(e.message); process.exit(1); });
