/**
 * Affirmation Firebase Client
 * Fetches affirmations from Firestore
 */

import { firebaseAdmin } from './firebaseAdmin';
import { Affirmation } from './affirmationUtils';

/**
 * Fetch all active affirmations from Firestore, ordered by 'order' field
 * Returns empty array if collection doesn't exist
 * 
 * Note: Firestore may require a composite index for the where + orderBy query.
 * If you see "FAILED_PRECONDITION: The query requires an index" error,
 * click the link in the error to create the index in Firebase Console.
 */
export async function getActiveAffirmations(): Promise<Affirmation[]> {
  try {
    const db = firebaseAdmin.firestore();
    
    // Fetch all affirmations first, then filter in code
    // This avoids needing a composite index while still getting ordered results
    const snapshot = await db
      .collection('affirmations')
      .orderBy('order', 'asc')
      .get();

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        active: doc.data().active,
        order: doc.data().order,
        createdAt: doc.data().createdAt?.toDate(),
      }))
      .filter((aff) => aff.active === true);
  } catch (error) {
    console.error('Error fetching active affirmations:', error);
    return [];
  }
}

/**
 * Get today's affirmation
 * Returns the affirmation for today's date in America/New_York timezone
 */
export async function getTodaysAffirmation(): Promise<string> {
  const affirmations = await getActiveAffirmations();

  if (affirmations.length === 0) {
    return 'I create space for what matters.'; // Fallback
  }

  // Get today's date key in NY timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  const dateKey = `${year}-${month}-${day}`;

  // Calculate day number
  const [y, m, d] = dateKey.split('-').map(Number);
  const utcDate = Date.UTC(y, m - 1, d);
  const dayNum = Math.floor(utcDate / 86400000);

  // Get index
  const index = dayNum % affirmations.length;
  return affirmations[index].text;
}
