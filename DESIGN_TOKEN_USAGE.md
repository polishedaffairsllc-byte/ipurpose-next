# iPurpose Design Tokens - Usage Examples

## Using Token-Driven Utilities in Components

### Example 1: Card Component with Design Tokens

```tsx
import { designTokens } from '@/design-tokens';

export function TokenCard() {
  return (
    <div 
      className="bg-white border border-lavenderViolet/10 rounded-2xl p-6 lg:p-8 shadow-soft hover:shadow-xl transition-all"
    >
      <h3 className="font-marcellus text-warmCharcoal text-xl mb-2">
        Token-Driven Card
      </h3>
      <p className="font-montserrat text-warmCharcoal/70 text-sm">
        This card uses Tailwind utilities generated from design tokens.
      </p>
    </div>
  );
}
```

### Example 2: Button with Custom Utilities

```tsx
export function GlowButton() {
  return (
    <button 
      className="bg-lavenderViolet text-white px-6 py-3 rounded-full font-semibold shadow-glow-lavender hover:bg-indigoDeep transition-all focus:ring-2 focus:ring-indigoDeep/40"
    >
      Glow Button
    </button>
  );
}
```

### Example 3: Dashboard Layout with Token Background

```tsx
export function DashboardContainer() {
  return (
    <div className="bg-dashboard min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-10 lg:py-10">
        {/* Content */}
      </div>
    </div>
  );
}
```

### Example 4: Card with Accent Border

```tsx
export function AccentCard({ accent = 'lavender' }) {
  const accentClass = {
    lavender: 'border-accent-lavender',
    salmon: 'border-accent-salmon',
    gold: 'border-accent-gold',
  }[accent];

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-soft ${accentClass}`}>
      <h3 className="font-marcellus text-lg text-warmCharcoal">
        Accent Card
      </h3>
    </div>
  );
}
```

## Importing Tokens Directly in TypeScript Components

### Example 5: Dynamic Styling with Token Values

```tsx
import { designTokens } from '@/design-tokens';

export function CustomStyledComponent() {
  return (
    <div
      style={{
        backgroundColor: designTokens.colors.offWhite,
        padding: designTokens.spacing[8],
        borderRadius: designTokens.borderRadius['2xl'],
        boxShadow: designTokens.shadows.soft,
      }}
    >
      <h2
        style={{
          fontFamily: designTokens.typography.fontFamily.marcellus.join(', '),
          fontSize: designTokens.typography.fontSize['2xl'],
          color: designTokens.colors.warmCharcoal,
        }}
      >
        Custom Styled Heading
      </h2>
    </div>
  );
}
```

### Example 6: Conditional Token Usage

```tsx
import { designTokens } from '@/design-tokens';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = designTokens.colors[status];
  
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: `${color}15`, // 15% opacity
        color: color,
      }}
    >
      {status}
    </span>
  );
}
```

### Example 7: Typography Component with Token Scale

```tsx
import { designTokens } from '@/design-tokens';

export function Heading({ level = 'h2', children }: { level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; children: React.ReactNode }) {
  const Component = level;
  const styles = designTokens.typography.scale[level];

  return (
    <Component
      style={{
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
      }}
      className="text-warmCharcoal"
    >
      {children}
    </Component>
  );
}
```

### Example 8: Component Token Usage

```tsx
import { designTokens } from '@/design-tokens';

export function iPurposeButton({ variant = 'primary', children }: { variant?: 'primary' | 'secondary' | 'ghost' | 'accent'; children: React.ReactNode }) {
  const buttonToken = designTokens.components.button.variants[variant];

  return (
    <button
      className="rounded-full px-6 py-3 font-semibold transition-all focus:ring-2"
      style={{
        backgroundColor: buttonToken.background,
        color: buttonToken.color,
        boxShadow: buttonToken.shadow,
      }}
    >
      {children}
    </button>
  );
}
```

### Example 9: Responsive Spacing with Tokens

```tsx
import { designTokens } from '@/design-tokens';

export function Section({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        paddingTop: designTokens.spacing[12],
        paddingBottom: designTokens.spacing[12],
        marginBottom: designTokens.spacing[16],
      }}
      className="container mx-auto"
    >
      {children}
    </section>
  );
}
```

### Example 10: Using Opacity Variants

```tsx
import { designTokens } from '@/design-tokens';

export function OverlayCard() {
  return (
    <div
      style={{
        background: designTokens.colors.opacity.white[80],
        backdropFilter: `blur(${designTokens.backdropBlur.xl})`,
        border: `1px solid ${designTokens.colors.opacity.lavenderViolet[10]}`,
      }}
      className="rounded-2xl p-8 shadow-lg"
    >
      <h3 className="font-marcellus text-2xl text-warmCharcoal mb-4">
        Frosted Glass Effect
      </h3>
      <p className="text-warmCharcoal/70">
        Using token opacity variants and backdrop blur.
      </p>
    </div>
  );
}
```

## Available Tailwind Utilities from Plugin

### Colors
- `bg-lavenderViolet`, `text-lavenderViolet`, `border-lavenderViolet`
- `bg-indigoDeep`, `text-indigoDeep`, `border-indigoDeep`
- `bg-salmonPeach`, `text-salmonPeach`, `border-salmonPeach`
- `bg-softGold`, `text-softGold`, `border-softGold`
- `bg-warmCharcoal`, `text-warmCharcoal`, `border-warmCharcoal`
- `bg-offWhite`, `text-offWhite`, `border-offWhite`
- `bg-midnight`, `text-midnight`, `border-midnight`

### Typography
- `font-italiana`, `font-marcellus`, `font-montserrat`
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`
- `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- `leading-tight`, `leading-normal`, `leading-relaxed`, `leading-loose`
- `tracking-tight`, `tracking-normal`, `tracking-wide`, `tracking-wider`, `tracking-widest`

### Spacing
- `p-0`, `p-1`, `p-2`, `p-3`, `p-4`, `p-5`, `p-6`, `p-8`, `p-10`, `p-12`, `p-16`, `p-20`, `p-24`, `p-32`
- `m-0`, `m-1`, `m-2`, `m-3`, `m-4`, `m-5`, `m-6`, `m-8`, `m-10`, `m-12`, `m-16`, `m-20`, `m-24`, `m-32`
- Plus all directional variants: `pt-`, `pr-`, `pb-`, `pl-`, `px-`, `py-`, etc.

### Shadows
- `shadow-soft` - Primary soft shadow (0 18px 45px rgba(34, 22, 68, 0.16))
- `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
- `shadow-glow-lavender`, `shadow-glow-salmon`, `shadow-glow-gold` - Custom glow effects

### Border Radius
- `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`

### Custom Utilities
- `bg-dashboard` - Dashboard gradient background
- `bg-sidebar-gradient` - Sidebar logo gradient
- `bg-nav-active` - Active navigation gradient
- `border-accent-lavender`, `border-accent-salmon`, `border-accent-gold` - 4px left accent borders
- `backdrop-blur-2xl` - Extra large backdrop blur (40px)

### Transitions
- `transition-fast` (150ms)
- `transition` (200ms)
- `transition-slow` (300ms)
- `transition-slower` (500ms)

### Z-Index
- `z-dropdown`, `z-sticky`, `z-fixed`, `z-modal-backdrop`, `z-modal`, `z-popover`, `z-tooltip`
