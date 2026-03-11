import { redirect } from 'next/navigation';

/**
 * /clarity-check-numeric is the legacy URL used in existing Google Ads campaigns.
 * Traffic is permanently redirected to /clarity-check-quiz so the ad destination
 * keeps working while the new split-URL flow handles conversion tracking.
 */
export default function ClarityCheckNumericRedirect() {
  redirect('/clarity-check-quiz');
}
