# Phase 2: Community Entitlements Decision

**Date:** January 28, 2026  
**Status:** Ready for Decision Lock  
**Decision:** Define Community access boundary (Free vs. Paid vs. Hybrid)

---

## Executive Summary

Community is currently unimplemented but scheduled for post-integration phase. This decision defines whether free users, paid users, or both can access reading/posting/space creation.

**Your leaning:** Hybrid (free read-only + paid posting/spaces)

**This proposal** recommends a **Hybrid+ model** with three tiers, balancing user engagement with monetization.

---

## Option A: Free Access (Everyone Can Read & Post)

```
Free Users:     ✅ Read posts      ✅ Create posts      ✅ Create spaces
Paid Users:     ✅ Read posts      ✅ Create posts      ✅ Create spaces
                                    (same features)
```

**Pros:**
- Maximum user engagement & virality
- Lower barrier to community participation
- Social proof & network effects favored

**Cons:**
- No direct community monetization
- Spam/quality control challenges at scale
- Paid tier has no community exclusivity

**Not Recommended:** Removes monetization opportunity

---

## Option B: Paid-Only (Exclusive Community)

```
Free Users:     ❌ No access to Community
Paid Users:     ✅ Read posts      ✅ Create posts      ✅ Create spaces
```

**Pros:**
- Clear paid tier differentiation
- High-value member base (filtered by payment)
- Premium community positioning
- Easier moderation (smaller, paying base)

**Cons:**
- Dead community feature pre-monetization (prevents user growth)
- High churn if free users can't preview value
- Requires marketing to drive paid signups
- Delays community network effects until paid adoption

**Not Recommended:** Too restrictive pre-monetization

---

## Option C: Free Read-Only + Paid Posting (Recommended ✅)

```
Free Users:     ✅ Read posts      ❌ Create posts      ❌ Create spaces
Paid Users:     ✅ Read posts      ✅ Create posts      ✅ Create spaces
```

**Pros:**
- Free users can discover community value → friction to upgrade
- Paid users get exclusive creation rights
- Clear tier differentiation for monetization
- Community builds naturally (free readers create audience for paid posters)
- Reduces spam (posts cost money, implicitly)
- Balances engagement with monetization

**Cons:**
- Slightly more complex implementation (content filtering per tier)
- Free users with large "read" history may feel blocked at posting

**Recommended:** Best balance of growth + monetization

---

## Option D: Hybrid+ (Recommended Alternative ✅✅)

```
Free Users:     ✅ Read posts      ✅ Create posts      ❌ Create spaces
Paid Users:     ✅ Read posts      ✅ Create posts      ✅ Create spaces
                                   (unlimited)          (unlimited)
```

**Key Feature:** Unlimited posts for paid users, limited posts for free users

**Details:**
- Free users: Up to 5 posts/month per category (e.g., 5 in Agency, 5 in Identity, 5 in Meaning, 5 in General)
- Paid users: Unlimited posts + can create spaces
- All users can read everything
- Moderation same for both tiers

**Pros:**
- Even higher engagement (free users can post & invite feedback)
- Free users invest in content → sunk cost → likely to upgrade
- Paid tier has true exclusivity (spaces are hub features)
- Reduces spam naturally (5 posts/month is a commitment)
- Network effects: Free users post, need spaces → upgrade
- Easier to market ("Share your journey for free, unlock community spaces with paid")

**Cons:**
- More complex implementation (quota tracking per user/category/month)
- Free users may feel "throttled" after 5 posts

**Recommended for** highest engagement + natural upgrade funnel

---

## Recommendation: **Hybrid+ Model**

### Proposed Default Tier Structure

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| **Read Posts** | ✅ All | ✅ All | ✅ All |
| **Create Posts** | ✅ 5/month per category | ✅ Unlimited | ✅ Unlimited |
| **Create Spaces** | ❌ | ✅ Up to 2 spaces | ✅ Unlimited |
| **AI Tools** | ❌ Limited | ✅ All 5 labs | ✅ All 5 labs + premium |
| **Community Moderation** | 👁️ Visible | 👑 Moderator eligible | 👑 Moderator eligible |
| **Monthly Price** | FREE | $19 | $49 |

### Gating Rules (Technical Implementation)

#### 1. Read Access
```javascript
// All authenticated users can read
if (userSession && route.startsWith('/community')) {
  return allowAccess(); // 200 OK
}
// Unauthenticated users
if (!userSession && route.startsWith('/community')) {
  return redirect('/login'); // 302 to /login
}
```

#### 2. Post Creation
```javascript
// Check user tier & monthly quota
if (userSession.tier === 'free') {
  const postCountThisMonth = db.query(
    'posts WHERE userId = ? AND createdAt > startOfMonth()',
    [userId]
  );
  const quotaByCategory = {
    'agency': 5,
    'identity': 5,
    'meaning': 5,
    'general': 5
  };
  
  if (postCountThisMonth[category] >= quotaByCategory[category]) {
    return error(402, 'Post quota reached. Upgrade to Pro for unlimited posts.');
  }
}
// Paid users (Pro/Premium) have no limit
if (userSession.tier in ['pro', 'premium']) {
  return allowPostCreation();
}
```

#### 3. Space Creation
```javascript
// Only paid users can create spaces
if (userSession.tier === 'free') {
  return error(402, 'Create spaces with Pro or Premium tier');
}

// Pro users limited to 2 spaces
if (userSession.tier === 'pro') {
  const spaceCount = db.count(
    'spaces WHERE createdBy = ?',
    [userId]
  );
  if (spaceCount >= 2) {
    return error(402, 'Space limit reached. Upgrade to Premium for unlimited spaces.');
  }
}

// Premium users unlimited
if (userSession.tier === 'premium') {
  return allowSpaceCreation();
}
```

### Tier Assignment Logic

**Default Tier:** 
- New users signing up → `tier = 'free'`

**After Purchase:**
- Purchase `6-week-program` → `tier = 'pro'` (includes community)
- Future: Premium annual bundle → `tier = 'premium'`

**Tier Detection:**
```javascript
function getUserTier(user) {
  // Check Stripe subscription
  const subscription = await stripe.subscriptions.retrieve(
    user.stripeSubscriptionId
  );
  
  if (subscription.items.data.find(item => item.price.id === STRIPE_PRICE_6_WEEK)) {
    return 'pro';
  }
  if (subscription.items.data.find(item => item.price.id === STRIPE_PRICE_PREMIUM)) {
    return 'premium';
  }
  return 'free';
}
```

---

## Implementation Phases

### Phase 2A: Foundation (2 weeks)
1. Add `tier` field to user profile (Firestore schema)
2. Add tier detection logic (Stripe → tier mapping)
3. Implement read-only access for free users
4. Create `/api/community/access` endpoint (returns tier + available features)

### Phase 2B: Gating Logic (2 weeks)
5. Implement post creation quota checking
6. Implement space creation gating
7. Add UI hints for quota limits
8. Add "Upgrade to unlock" CTAs

### Phase 2C: UI & Messaging (1 week)
9. Display quota/limits on community pages
10. Show upgrade prompts when quota hit
11. Create tier comparison page
12. Add community benefits to tier selection

---

## Decision Checklist

**Questions for Lock:**

1. **Post Quota:** Free users 5 posts/month per category?
   - [ ] Yes (recommended)
   - [ ] Modify to: _____
   - [ ] Remove quota (Option C instead)

2. **Space Creation:** Free users can't create spaces?
   - [ ] Yes (recommended)
   - [ ] Free users get 1 space
   - [ ] All tiers can create unlimited spaces

3. **Tier Pricing:** Pro $19/mo, Premium $49/mo?
   - [ ] Yes
   - [ ] Modify Pro to: $___
   - [ ] Modify Premium to: $___

4. **Space Limits:** Pro users max 2 spaces?
   - [ ] Yes
   - [ ] Modify to: ___
   - [ ] Premium unlimited + Pro unlimited

5. **Default Model:** Use Hybrid+ (read-free, post-quota, space-paid)?
   - [ ] Yes (Hybrid+ recommended)
   - [ ] Use Option C (read-free, post-paid only)
   - [ ] Use Option B (paid-only)

---

## Next Actions (Post-Decision)

1. **Lock Decision:** Confirm tier model + pricing
2. **Update SYSTEM_INVENTORY.md:** Add Decision #7 (Community Tiers)
3. **Create Firestore schema update:** Add `tier` + quota fields
4. **Create Stripe products:** If tier pricing differs from current 6-week
5. **Implement `/api/community/access` endpoint**
6. **Begin Phase 2A implementation**

---

**Ready to lock Decision #7?**

Please confirm answers to the 5 checklist questions above, and I'll:
1. Lock the decision in SYSTEM_INVENTORY.md
2. Create detailed implementation specs
3. Begin Phase 2A (foundation code)

**Estimated Timeline to Phase 2 Complete:** 5 weeks

