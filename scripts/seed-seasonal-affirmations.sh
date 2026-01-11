#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"

if [[ -z "${ADMIN_SECRET:-}" ]]; then
  echo "Error: ADMIN_SECRET not set"
  echo "Run: export ADMIN_SECRET=\"\$(grep '^ADMIN_SECRET=' .env.local | cut -d '=' -f2-)\""
  exit 1
fi

echo "Seeding seasonal affirmations..."
echo "Using API URL: $API_URL"

DATA=$(cat <<'TSV'
0	CLARITY	I create space for what matters.
1	CLARITY	I slow down and let clarity rise.
2	CLARITY	I listen to myself without rushing.
3	CLARITY	I choose what’s true over what’s loud.
4	CLARITY	I release what isn’t mine to carry.
5	CLARITY	I honor my needs without apology.
6	CLARITY	I trust the signal inside me.
7	CLARITY	I simplify until the next step is obvious.
8	CLARITY	I am allowed to begin again with wisdom.
9	CLARITY	I choose alignment over approval.
10	CLARITY	My purpose becomes clearer through presence.
11	CLARITY	I make room for what nourishes me.
12	CLARITY	I notice what drains me and gently let it go.
13	CLARITY	I act from clarity, not pressure.
14	CLARITY	I am safe to be honest with myself.

15	COURAGE	I move even when I feel uncertain.
16	COURAGE	I choose the next brave step.
17	COURAGE	I trust myself to learn as I go.
18	COURAGE	I don’t need perfection to begin.
19	COURAGE	I speak with clarity and conviction.
20	COURAGE	I allow my courage to be quiet and steady.
21	COURAGE	I follow through on what matters to me.
22	COURAGE	I can do hard things with gentleness.
23	COURAGE	I let fear be present without letting it lead.
24	COURAGE	I protect my energy and move anyway.
25	COURAGE	I honor my pace and stay committed.
26	COURAGE	I choose myself with love.
27	COURAGE	My voice matters and is heard.
28	COURAGE	I trust the process of becoming.
29	COURAGE	I am worthy of my dreams.

30	STRUCTURE	I create systems that support my peace.
31	STRUCTURE	I keep promises to myself.
32	STRUCTURE	Small steps, taken daily, change my life.
33	STRUCTURE	I choose consistency over intensity.
34	STRUCTURE	I focus on what moves the needle.
35	STRUCTURE	I build simple structures that hold me steady.
36	STRUCTURE	My calendar reflects my values.
37	STRUCTURE	I organize my work so my mind can rest.
38	STRUCTURE	I finish what I start, one piece at a time.
39	STRUCTURE	I plan with clarity and execute with ease.
40	STRUCTURE	I choose one priority and honor it.
41	STRUCTURE	I create boundaries that protect my goals.
42	STRUCTURE	I take aligned action without overthinking.
43	STRUCTURE	I make progress visible and manageable.
44	STRUCTURE	I am becoming disciplined in a kind way.

45	INTEGRATION	I honor how far I’ve come.
46	INTEGRATION	I let the lesson land before I chase the next thing.
47	INTEGRATION	I integrate growth gently, not forcefully.
48	INTEGRATION	I celebrate progress, not perfection.
49	INTEGRATION	I rest without guilt.
50	INTEGRATION	I receive the good I’ve created.
51	INTEGRATION	I release urgency and return to trust.
52	INTEGRATION	I make space for reflection and repair.
53	INTEGRATION	I learn from my patterns with compassion.
54	INTEGRATION	I allow my life to feel sustainable.
55	INTEGRATION	I carry forward what works and release the rest.
56	INTEGRATION	I choose alignment again and again.
57	INTEGRATION	I am grounded, capable, and supported.
58	INTEGRATION	I move forward with wisdom.
59	INTEGRATION	I am proud of the life I am building.
TSV
)

# If your admin endpoint DOES NOT accept "season", set INCLUDE_SEASON=0
INCLUDE_SEASON="${INCLUDE_SEASON:-1}"

while IFS=$'\t' read -r order season text; do
  [[ -z "${order}" ]] && continue
  [[ "${order}" =~ ^# ]] && continue

  payload=$(node -e '
    const [order, season, text, includeSeason] = process.argv.slice(1);
    const body = { text, active: true, order: Number(order) };
    if (includeSeason === "1") body.season = season;
    console.log(JSON.stringify(body));
  ' "$order" "$season" "$text" "$INCLUDE_SEASON")

  echo "Adding ($order/$season): $text"

  resp=$(curl -sS -X POST \
    -H "Authorization: Secret $ADMIN_SECRET" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$API_URL/api/admin/affirmations")

  echo "Response: $resp"
done <<< "$DATA"

echo "✓ Seasonal affirmations seeded."
