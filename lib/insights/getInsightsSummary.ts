/**
 * lib/insights/getInsightsSummary.ts
 * 
 * Server-side read-only aggregation for Insights metrics.
 * 
 * Architecture: This module computes insights purely from existing data.
 * No mutations, no writes, no side effects. Clean read-only interpretation layer.
 */

import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export interface InsightsSummary {
  alignmentConsistency7d: number; // percent: 0-100, or 0 if no data
  checkinsLast30d: number;
  practicesLast30d: number;
  mostRecentCheckinDate: string | null; // ISO date (YYYY-MM-DD) or null
  streakDays: number; // consecutive days with check-ins from most recent
}

/**
 * Format date to M/D/YYYY in user's timezone (America/New_York)
 */
function formatDateForDisplay(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
  return formatter.format(date);
}

/**
 * Parse Firestore timestamp (handles both Timestamp objects and Date objects)
 */
function parseTimestamp(ts: any): Date {
  if (ts instanceof Timestamp) {
    return ts.toDate();
  }
  if (ts instanceof Date) {
    return ts;
  }
  if (typeof ts === "number") {
    return new Date(ts);
  }
  // Fallback
  return new Date();
}

/**
 * Calculate streak: how many consecutive days (including today) have check-ins
 * Looking backward from most recent check-in date
 */
function calculateStreak(checkInDates: Date[]): number {
  if (checkInDates.length === 0) return 0;

  // Sort descending (newest first)
  const sorted = [...checkInDates].sort((a, b) => b.getTime() - a.getTime());

  // Normalize to start of day
  const normalize = (d: Date) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const startDate = normalize(sorted[0]);
  const today = normalize(new Date());

  // If most recent check-in is before yesterday, streak is 0
  const diffDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays > 1) return 1; // Only today's check-in counts

  let streak = 0;
  let currentDate = new Date(startDate);

  for (const checkInDate of sorted) {
    const checkIn = normalize(checkInDate);
    if (checkIn.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  return streak;
}

/**
 * Fetch and aggregate insights data for a user.
 * Pure read operation: no writes, no mutations, no side effects.
 */
export async function getInsightsSummary(userId: string): Promise<InsightsSummary> {
  try {
    const db = firebaseAdmin.firestore();

    // Time windows (in milliseconds)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ===== Fetch check-ins (last 30 days) =====
    const checkInsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("checkIns")
      .where("createdAt", ">=", thirtyDaysAgo)
      .orderBy("createdAt", "desc")
      .get();

    const checkIns = checkInsSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
      createdAt: parseTimestamp(doc.data().createdAt),
    }));

    const checkinsLast30d = checkIns.length;

    // ===== Fetch practices (last 30 days) =====
    const practicesSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("practices")
      .where("completedAt", ">=", thirtyDaysAgo)
      .orderBy("completedAt", "desc")
      .get();

    const practicesLast30d = practicesSnapshot.docs.length;

    // ===== Calculate alignment consistency (last 7 days) =====
    // Definition: How many days in the last 7 have at least one check-in
    const last7Days = new Set<string>();
    const last7CheckIns = checkIns.filter(
      (c) => c.createdAt.getTime() >= sevenDaysAgo.getTime()
    );

    for (const checkin of last7CheckIns) {
      const dateStr = checkin.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      last7Days.add(dateStr);
    }

    // Consistency as percentage: (days with check-ins / 7) * 100
    const alignmentConsistency7d = Math.round((last7Days.size / 7) * 100);

    // ===== Get most recent check-in date =====
    const mostRecentCheckin = checkIns[0];
    const mostRecentCheckinDate = mostRecentCheckin
      ? formatDateForDisplay(mostRecentCheckin.createdAt)
      : null;

    // ===== Calculate streak =====
    const checkInDates = checkIns.map((c) => c.createdAt);
    const streakDays = calculateStreak(checkInDates);

    return {
      alignmentConsistency7d,
      checkinsLast30d,
      practicesLast30d,
      mostRecentCheckinDate,
      streakDays,
    };
  } catch (error) {
    console.error("[Insights] Error fetching summary:", error);
    return {
      alignmentConsistency7d: 0,
      checkinsLast30d: 0,
      practicesLast30d: 0,
      mostRecentCheckinDate: null,
      streakDays: 0,
    };
  }
}
