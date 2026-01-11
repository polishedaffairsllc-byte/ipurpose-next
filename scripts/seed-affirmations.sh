#!/bin/bash
# scripts/seed-affirmations.sh
# Helper script to seed initial affirmations to Firestore via the admin API

ADMIN_SECRET="${ADMIN_SECRET:-your_secure_admin_secret_here}"
API_URL="${API_URL:-http://localhost:3000}"

if [ "$ADMIN_SECRET" = "your_secure_admin_secret_here" ]; then
  echo "Error: ADMIN_SECRET not set or is default value"
  echo "Set it in your environment:"
  echo "  export ADMIN_SECRET='your_actual_secret'"
  exit 1
fi

echo "Seeding affirmations to Firestore..."
echo "Using API URL: $API_URL"
echo "Using Admin Secret: ${ADMIN_SECRET:0:10}..."
echo ""

# Array of affirmations to seed
affirmations=(
  "I create space for what matters."
  "I am capable and resilient."
  "My actions align with my purpose."
  "I embrace growth and transformation."
  "I attract abundance and success."
  "My voice matters and is heard."
  "I trust the process of becoming."
  "I am worthy of my dreams."
)

order=0
for text in "${affirmations[@]}"; do
  echo "Adding: \"$text\""
  
  response=$(curl -s -X POST "$API_URL/api/admin/affirmations" \
    -H "Content-Type: application/json" \
    -H "Authorization: Secret $ADMIN_SECRET" \
    -d "{\"text\": \"$text\", \"active\": true, \"order\": $order}")
  
  echo "Response: $response"
  echo ""
  
  ((order++))
done

echo "✓ Affirmations seeded successfully!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000/dashboard"
echo "2. The affirmation should now display"
echo "3. Each day at midnight ET it will rotate to the next affirmation"
