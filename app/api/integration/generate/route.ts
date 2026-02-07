import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import { getDateKey } from "@/lib/journal/dateUtils";

// Archetype-based 7-Day Plan scaffolds
const SEVEN_DAY_SCAFFOLDS: Record<string, string[]> = {
  Visionary: [
    "Capture and refine your core vision",
    "Share your vision with one trusted person",
    "Identify one barrier to your vision and address it",
    "Create a visual representation of your direction",
    "Connect with others who share your vision",
    "Test one element of your vision in a small way",
    "Reflect on what emerged and adjust your course"
  ],
  Builder: [
    "Break down your direction into concrete steps",
    "Complete the first foundational task",
    "Build one system or structure that supports your goal",
    "Measure progress and adjust your approach",
    "Strengthen one existing foundation",
    "Create accountability around your building process",
    "Celebrate what you've constructed this week"
  ],
  Nurturer: [
    "Identify what needs care and attention right now",
    "Create space for yourself and others to grow",
    "Strengthen one important relationship",
    "Practice saying no to protect your energy",
    "Tend to something you've been neglecting",
    "Share your care with your community",
    "Reflect on what feels more whole now"
  ],
  Strategist: [
    "Map out your current position and desired outcome",
    "Identify the highest-leverage action available",
    "Eliminate one obstacle or inefficiency",
    "Test your strategy with a small experiment",
    "Gather data and adjust your approach",
    "Align your resources with your priorities",
    "Review what worked and refine your strategy"
  ],
  Creator: [
    "Express one insight through your chosen medium",
    "Experiment with a new approach or technique",
    "Share one piece of your creative work",
    "Connect disparate ideas into something new",
    "Create without judgment or outcome-focus",
    "Refine and iterate on what you've made",
    "Reflect on what you brought into being"
  ]
};

// Default scaffold for unrecognized archetypes
const DEFAULT_SCAFFOLD = [
  "Clarify your most important priority",
  "Take one meaningful action toward it",
  "Reflect on what you learned",
  "Adjust your approach based on insights",
  "Build momentum with consistent small steps",
  "Connect with support or accountability",
  "Review your week and plan the next"
];

/**
 * Extract direct phrases from participant responses.
 * Returns the strongest sentence/phrase from their own words.
 * No synthesis, no coaching language, no new themes.
 */
function extractDirectPhrase(responses: string[], fallbackTemplate: string): string {
  // Filter out empty responses
  const meaningful = responses.filter(r => r && r.trim().length > 10);
  
  if (meaningful.length === 0) {
    return fallbackTemplate;
  }
  
  // Get the first meaningful response
  const primary = meaningful[0].trim();
  
  // Extract first 1-2 sentences (stop at period, question mark, or exclamation)
  const sentenceMatch = primary.match(/^[^.!?]+[.!?]?(?:\s+[^.!?]+[.!?]?)?/);
  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }
  
  // If no sentence punctuation, take first ~200 chars
  if (primary.length > 200) {
    const truncated = primary.substring(0, 200);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }
  
  return primary;
}

/**
 * Extract a value/aim phrase from meaning responses.
 * Look for participant's stated values or directions.
 */
function extractDirectionPhrase(responses: string[]): string {
  const meaningful = responses.filter(r => r && r.trim().length > 10);
  
  if (meaningful.length === 0) {
    return "See lab responses above for stated values and direction";
  }
  
  // Look for value-indicating phrases
  const combined = meaningful.join(' ');
  
  // Check for explicit value statements
  const valuePatterns = [
    /what matters.*?is [^.!?]+[.!?]/i,
    /I value [^.!?]+[.!?]/i,
    /important to me.*?[.!?]/i,
    /my aim is [^.!?]+[.!?]/i,
    /I want to [^.!?]+[.!?]/i,
  ];
  
  for (const pattern of valuePatterns) {
    const match = combined.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  // Fallback: use first sentence from first response
  return extractDirectPhrase(responses, "See lab responses above for stated values and direction");
}

/**
 * Extract an "I need to / I'm realizing / I want to" phrase from agency responses.
 * Look for participant's stated shifts or intentions.
 */
function extractShiftPhrase(responses: string[]): string {
  const meaningful = responses.filter(r => r && r.trim().length > 10);
  
  if (meaningful.length === 0) {
    return "See lab responses above for awareness and intentions";
  }
  
  const combined = meaningful.join(' ');
  
  // Look for shift-indicating phrases
  const shiftPatterns = [
    /I need to [^.!?]+[.!?]/i,
    /I'm realizing [^.!?]+[.!?]/i,
    /I want to [^.!?]+[.!?]/i,
    /I'm learning [^.!?]+[.!?]/i,
    /I notice [^.!?]+[.!?]/i,
    /I'm becoming [^.!?]+[.!?]/i,
    /I've been [^.!?]+[.!?]/i,
  ];
  
  for (const pattern of shiftPatterns) {
    const match = combined.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  // Fallback: use first sentence from first response
  return extractDirectPhrase(responses, "See lab responses above for awareness and intentions");
}

export async function POST() {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };

    const db = firebaseAdmin.firestore();
    const dateKey = getDateKey(); // Uses America/New_York timezone

    // 1. Fetch today's journal entries (all types: affirmation, intention, free_journal, etc.)
    // Date filtering uses user timezone, not server UTC
    const sessionsSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .where("dateKey", "==", dateKey)
      .limit(1)
      .get();

    let journalEntries: any[] = [];
    if (!sessionsSnapshot.empty) {
      const sessionDoc = sessionsSnapshot.docs[0];
      const sessionId = sessionDoc.id;
      
      // Fetch entries from journalEntries collection, filtered by sessionId
      const entriesSnapshot = await db
        .collection("users")
        .doc(uid)
        .collection("journalEntries")
        .where("sessionId", "==", sessionId)
        .get();
      
      // Sort client-side to avoid Firestore composite index requirements
      journalEntries = entriesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .sort((a: any, b: any) => {
          const aTime = a?.createdAt?.toMillis ? a.createdAt.toMillis() : (a?.createdAt?._seconds ?? 0) * 1000;
          const bTime = b?.createdAt?.toMillis ? b.createdAt.toMillis() : (b?.createdAt?._seconds ?? 0) * 1000;
          return aTime - bTime;
        });
    }

    // 2. Fetch all lab responses
    const [identityDoc, meaningDoc, agencyDoc, userDoc] = await Promise.all([
      db.collection("identity_maps").doc(uid).get(),
      db.collection("meaning_maps").doc(uid).get(),
      db.collection("agency_maps").doc(uid).get(),
      db.collection("users").doc(uid).get(),
    ]);

    const identityData = identityDoc.exists ? identityDoc.data() : {};
    const meaningData = meaningDoc.exists ? meaningDoc.data() : {};
    const agencyData = agencyDoc.exists ? agencyDoc.data() : {};
    const userData = userDoc.exists ? userDoc.data() : {};

    const labResponses = {
      identity: {
        selfPerceptionMap: identityData?.selfPerceptionMap || "",
        selfConceptMap: identityData?.selfConceptMap || "",
        selfNarrativeMap: identityData?.selfNarrativeMap || "",
      },
      meaning: {
        valueStructure: meaningData?.valueStructure || "",
        coherenceStructure: meaningData?.coherenceStructure || "",
        directionStructure: meaningData?.directionStructure || "",
      },
      agency: {
        awarenessPatterns: agencyData?.awarenessPatterns || "",
        decisionPatterns: agencyData?.decisionPatterns || "",
        actionPatterns: agencyData?.actionPatterns || "",
      }
    };

    // 3. Generate Emerging Themes from user's own words (direct extraction only)
    const coreTruth = extractDirectPhrase([
      labResponses.identity.selfPerceptionMap,
      labResponses.identity.selfConceptMap,
      labResponses.identity.selfNarrativeMap,
    ], "See Identity Lab responses above");

    const primaryDirection = extractDirectionPhrase([
      labResponses.meaning.valueStructure,
      labResponses.meaning.coherenceStructure,
      labResponses.meaning.directionStructure,
    ]);

    const internalShift = extractShiftPhrase([
      labResponses.agency.awarenessPatterns,
      labResponses.agency.decisionPatterns,
      labResponses.agency.actionPatterns,
    ]);

    // 4. Generate 7-Day Plan based on archetype
    const archetype = userData?.archetypePrimary || "";
    const sevenDayPlan = SEVEN_DAY_SCAFFOLDS[archetype] || DEFAULT_SCAFFOLD;

    // 5. Create fingerprint of lab data (using updatedAt timestamps)
    const labFingerprint = {
      identityUpdatedAt: identityData?.updatedAt?.toMillis() || 0,
      meaningUpdatedAt: meaningData?.updatedAt?.toMillis() || 0,
      agencyUpdatedAt: agencyData?.updatedAt?.toMillis() || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        journalEntries,
        labResponses,
        emergingThemes: {
          coreTruth,
          primaryDirection,
          internalShift,
        },
        sevenDayPlan,
        labFingerprint,
      }
    });

  } catch (error) {
    console.error("Integration generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || "Failed to generate integration" }, { status: 500 });
  }
}
