// Confirmed by Firebase apps:sdkconfig for ipurpose-mvp / ipurpose-web.
export const LAUNCH_MEASUREMENT_ID = process.env.NEXT_PUBLIC_LAUNCH_GA_MEASUREMENT_ID || 'G-9D1QBMLNWK';

/** Keep the Firebase-linked stream and the website's reporting stream in sync. */
export function getLaunchMeasurementIds(
  websiteId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  launchId = LAUNCH_MEASUREMENT_ID,
): string[] {
  return [...new Set([websiteId, launchId].filter(
    (id): id is string => typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id),
  ))];
}
