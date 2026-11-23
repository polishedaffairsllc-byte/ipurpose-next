type DeepenEntitlementFields = {
  entitlements?: { deepen?: boolean } | null;
  entitlement?: { tier?: string; status?: string | null } | null;
};

export function isDeepenTier(tier: unknown): boolean {
  return typeof tier === 'string' && tier.toUpperCase() === 'DEEPENING';
}

export function hasDeepenEntitlement(user?: DeepenEntitlementFields | null): boolean {
  const current = user?.entitlements?.deepen;
  if (typeof current === 'boolean') return current;

  // Older paid profiles may only have the tier and may lack a status.
  const legacy = user?.entitlement;
  return isDeepenTier(legacy?.tier) && (legacy?.status == null || legacy.status === 'active');
}
