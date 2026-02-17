# iPurpose Canonical Typography System

## CANONICAL RULES (Effective Immediately)

### Font Family Assignment
- **Headings (h1, h2, h3, h4, h5, h6)** → `Italiana` 
- **Subheadings** → `Italiana`
- **Body text** → `Marcellus`
- **UI/UX Text** → `Marcellus`
- **Captions** → `Marcellus`
- **System/Utility** → `Montserrat` (core body, deprecated in favor of Marcellus)

### Font Weights (UPDATED)
- **Headings (Italiana)** → `400` (normal) - Italiana looks best at normal weight
- **Body (Marcellus)** → `400-500` depending on emphasis
- **Strong emphasis** → `600` (semibold)

### Design Tokens (Fixed)
`design-tokens.ts` `typography.scale`:
- h1-h6: `Italiana, fontWeight: 400`
- body: `Marcellus, fontWeight: 400`
- bodySmall: `Marcellus, fontWeight: 400`
- caption: `Marcellus, fontWeight: 500`

### Global Styles (Fixed)
`app/globals.css`:
- All `h1-h6` elements → `font-family: Italiana, serif`
- Body default → `font-family: Montserrat` → should stay for base, but use Marcellus for UI text

### Tailwind Classes (Available)
- `font-italiana` → h1, h2, h3, headings, brand
- `font-marcellus` → body, UI, labels
- `font-montserrat` → system fallback

---

## Component Fix Checklist

### ✅ Completed
- [x] design-tokens.ts: h1-h6 updated to Italiana, body updated to Marcellus
- [x] app/globals.css: h1-h6 base styles updated to Italiana
- [x] SectionHeading component: switched to font-italiana

### 🔧 Critical Pages to Fix (Priority Order)
1. **app/soul/page.tsx** - Multiple Marcellus → Italiana conversions needed
2. **app/program/page.tsx** - h3 elements using Marcellus
3. **app/systems/[slug]/page.tsx** - h3 headings need Italiana
4. **app/starter-pack/StarterPackLandingClient.tsx** - h2 needs Italiana
5. **app/about/page.tsx** - h2 heading needs Italiana
6. **app/discover/page.tsx** - page layout h1/h2 needs Italiana

### 📋 Systematic Approach

#### For ALL h-tags (h1-h6):
```tsx
// ❌ WRONG - uses Marcellus
<h2 className="font-marcellus text-3xl">Section Title</h2>

// ✅ CORRECT - uses Italiana
<h2 className="font-italiana text-3xl">Section Title</h2>
```

#### For Body Text:
```tsx
// ❌ WRONG - uses Montserrat or Italiana
<p className="font-montserrat text-base">Body text here</p>

// ✅ CORRECT - uses Marcellus
<p className="font-marcellus text-base">Body text here</p>
```

#### For Component Titles (non-h tags styled as headings):
```tsx
// If it looks like a heading, should use Italiana
<div className="text-2xl font-bold" style={{fontFamily: 'Marcellus'}}>
  {/* ❌ WRONG */}
</div>

// ✅ CORRECT
<div className="text-2xl font-italiana">
  {/* Large styled text that acts as heading */}
</div>
```

---

## Container Alignment Standardization

### Current Issue
- Some sections: `text-left`, some `text-center`, some `text-right`
- Inconsistent responsive behavior (mobile/tablet/desktop)
- Different max-widths and padding across pages

### Standard Pattern (To Implement)
```tsx
// Base container
<div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
  {/* content */}
</div>

// Heading section (centered)
<section className="w-full text-center py-8 sm:py-12 md:py-16">
  <div className="max-w-3xl mx-auto px-4">
    {/* heading content */}
  </div>
</section>

// Left-aligned section
<section className="w-full py-8 sm:py-12">
  <div className="max-w-4xl mx-auto px-4 text-left">
    {/* content */}
  </div>
</section>
```

### Responsive Sizing
- Mobile (default): `px-4`, `text-base`
- Tablet (sm: 640px): `px-6`, `text-lg`
- Desktop (md: 768px): `px-8`, `text-xl`
- Large (lg: 1024px): `px-12`, `text-2xl`

---

## Tablet/Responsive Concerns

### Current Issues
- Fixed font sizes (e.g., `fontSize: '79px'`) don't scale on tablets
- Use `clamp()` for responsive sizing
- Container widths vary, causing layout shifts

### Solution: Use `clamp()`
```tsx
// ❌ Fixed size (breaks on tablet)
<h1 style={{ fontSize: '79px' }}>Title</h1>

// ✅ Responsive with clamp()
<h1 style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}>Title</h1>
```

---

## Verification Checklist

### Before Committing
- [ ] All h1-h6 tags use `font-italiana`
- [ ] All body text uses `font-marcellus`
- [ ] No `font-montserrat` on UI text (only base body)
- [ ] All styled headings checked for font consistency
- [ ] Containers use consistent max-width and padding
- [ ] Responsive text sizing uses `clamp()` or Tailwind utilities
- [ ] Test on mobile (375px), tablet (768px), desktop (1920px)
- [ ] No hardcoded `fontFamily: 'Marcellus'` on headings
- [ ] Run TypeScript check: `npm run build`

---

## Tools for Implementation

### Search/Replace Patterns
Find all `<h[1-6]` with `font-marcellus`:
```
grep -r "font-marcellus.*<h[1-6]" app/
```

Find all hardcoded `fontFamily: 'Marcellus'` on large text:
```
grep -r "fontSize.*[0-9]{2,}px.*fontFamily: 'Marcellus'" app/
```

### Quick Fix Commands
```bash
# Find pages using Marcellus on headings
grep -r "font-marcellus" app/ | grep -E "h[1-6]|text-[345]xl|text-[456]rem"

# Count instances
grep -r "font-marcellus" app/ | wc -l
```

---

## Next Steps
1. ✅ Update core tokens (DONE)
2. ✅ Update globals.css (DONE)
3. 🔄 Fix critical pages (IN PROGRESS)
4. 🔄 Standardize containers
5. 🔄 Test responsive behavior
6. 🔄 Deploy and verify
