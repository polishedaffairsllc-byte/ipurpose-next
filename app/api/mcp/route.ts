import { createLaunchMetricsHandler } from '@/lib/launch-metrics/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const handler = createLaunchMetricsHandler();
export { handler as GET, handler as POST };
