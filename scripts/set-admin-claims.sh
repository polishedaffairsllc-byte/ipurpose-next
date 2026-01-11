#!/bin/bash
# scripts/set-admin-claims.sh
# Helper script to set Firebase custom admin claim for a user
#
# Usage:
#   ./scripts/set-admin-claims.sh <USER_EMAIL_OR_UID>
#
# Example:
#   ./scripts/set-admin-claims.sh renita@example.com
#   ./scripts/set-admin-claims.sh aBcDeFgHiJkLmNoPqRsT

if [ -z "$1" ]; then
  echo "Usage: $0 <USER_EMAIL_OR_UID>"
  echo ""
  echo "Examples:"
  echo "  $0 user@example.com"
  echo "  $0 aBcDeFgHiJkLmNoPqRsT"
  exit 1
fi

USER_IDENTIFIER=$1

cat > /tmp/set-admin-claims.js << 'EOF'
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
  path.join(process.env.HOME, '.config', 'firebase', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error loading Firebase service account key:');
  console.error('Expected at:', serviceAccountPath);
  console.error('\nDownload your key from Firebase Console:');
  console.error('  Settings → Service Accounts → Generate New Private Key');
  console.error('  Save to:', serviceAccountPath);
  process.exit(1);
}

const userIdentifier = process.argv[2];

async function setAdminClaim() {
  try {
    let uid;

    // Check if it's an email or UID
    if (userIdentifier.includes('@')) {
      console.log(`Looking up user by email: ${userIdentifier}`);
      const user = await admin.auth().getUserByEmail(userIdentifier);
      uid = user.uid;
    } else {
      uid = userIdentifier;
    }

    console.log(`Setting admin claim for user: ${uid}`);

    await admin.auth().setCustomUserClaims(uid, { admin: true });

    console.log('✓ Successfully set admin custom claim');
    console.log(`  User UID: ${uid}`);
    console.log(`  Custom Claims: { admin: true }`);
    console.log('\nThe user will need to:');
    console.log('  1. Sign out and sign back in');
    console.log('  2. Then they can access admin endpoints');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting admin claim:');
    console.error(`  ${error.message}`);
    process.exit(1);
  }
}

setAdminClaim();
EOF

node /tmp/set-admin-claims.js "$USER_IDENTIFIER"
rm /tmp/set-admin-claims.js
