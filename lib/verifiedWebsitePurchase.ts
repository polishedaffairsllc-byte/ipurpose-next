import { ownsPurchaseEmail } from './purchaseEmailOwnership';

/** Validate Stripe's server-retrieved order against the authenticated account. */
export function verifiedWebsitePurchase(
  session: { id: string; status: string | null; payment_status: string; mode: string | null; customer: string | { id: string } | null; customer_details: { email: string | null } | null; metadata: Record<string, string> | null; line_items?: { data: Array<{ price: { id: string } | null }> } | null },
  account: { email?: string; emailVerified: boolean; disabled?: boolean },
  prices: Record<string, string[]>,
) {
  const normalize = (s: string) => s.trim().toLowerCase();
  const product = session.metadata?.product;
  const purchaser = session.customer_details?.email;
  const expectedPrices = product ? prices[product]?.filter(Boolean) : undefined;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!purchaser || !ownsPurchaseEmail(account, purchaser)) return null;
  if (session.status !== 'complete' || session.payment_status !== 'paid' || session.mode !== 'payment' || !customerId || !product || !expectedPrices?.length) return null;
  if (!session.line_items?.data.length || !session.line_items.data.some(item => item.price && expectedPrices.includes(item.price.id))) return null;
  return { product, email: normalize(purchaser), customerId, sessionId: session.id, cohort: session.metadata?.cohort || '', cohortStartDate: session.metadata?.cohortStartDate || '' };
}
