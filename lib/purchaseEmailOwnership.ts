/** An email address is a purchase identity only after the auth provider verifies it. */
export function ownsPurchaseEmail(account: { email?: string | null; emailVerified: boolean; disabled?: boolean }, purchaseEmail: string | null | undefined): boolean {
  return !!purchaseEmail && !!account.email && account.emailVerified === true && account.disabled !== true &&
    account.email.trim().toLowerCase() === purchaseEmail.trim().toLowerCase();
}
