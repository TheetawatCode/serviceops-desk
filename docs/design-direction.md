# Operational Clarity

Operational Clarity is the visual system for ServiceOps Desk: a calm, information-dense B2B working surface that makes job ownership, priority, and SLA risk understandable at a glance. It combines Cal.com-style structure, Vercel-like restraint, Coinbase-inspired data hierarchy, and only a trace of Stripe-like atmospheric depth.

## Foundations

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#FCFCFA` | Warm-neutral page background |
| `surface` | `#FFFFFF` | Primary cards, forms, tables, and drawers |
| `surface-subtle` | `#F5F7FA` | Secondary panels, table headers, and hover fills |
| `surface-strong` | `#E9EEF5` | Selected or pressed neutral controls |
| `ink` | `#0B1F33` | Headings and primary text |
| `ink-muted` | `#526174` | Supporting text |
| `ink-subtle` | `#718096` | Metadata and placeholders when contrast permits |
| `border` | `#DCE3EC` | Default dividers and card borders |
| `border-strong` | `#BCC8D6` | Emphasized boundaries and input hover |
| `accent` | `#2563EB` | Primary actions, links, active navigation, focus |
| `accent-hover` | `#1D4ED8` | Primary interaction hover |
| `accent-soft` | `#EAF1FF` | Selected navigation and subtle emphasis |
| `focus-ring` | `#2563EB` | Two-pixel focus outline with canvas offset |
| `success` / `success-soft` | `#18794E` / `#E9F7F0` | Resolved or healthy SLA only |
| `warning` / `warning-soft` | `#9A6700` / `#FFF4CE` | At-risk SLA only |
| `danger` / `danger-soft` | `#B42318` / `#FEECEB` | Breached or urgent state only |
| `info` / `info-soft` | `#175CD3` / `#EAF2FF` | In-progress state only |

Semantic colors never decorate ordinary UI. Every semantic use includes a text label and, where space permits, an icon. The optional atmospheric layer is a low-opacity navy-to-cobalt radial gradient behind the top bar or one dashboard highlight; it must not reduce text contrast.

### Typography

- UI family: Geist Sans with `system-ui`, `-apple-system`, and `sans-serif` fallbacks.
- Data/reference family: Geist Mono with `ui-monospace` fallbacks.
- Display: `2rem/2.5rem`, weight 650; page title: `1.5rem/2rem`, weight 650.
- Section heading: `1rem/1.5rem`, weight 600; card metric: `1.75rem/2.25rem`, weight 650.
- Body: `1rem/1.5rem`, weight 400; compact UI label: `0.875rem/1.25rem`, weight 500.
- Metadata: `0.8125rem/1.125rem`, weight 450.
- Use tabular numerals for metrics and SLA times. Avoid all-caps except very short category markers.

### Spacing, radius, and shadow

- Use a 4px spacing base. Preferred steps: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- Compact controls use 8–12px internal gaps; cards use 16px on mobile and 20–24px on larger screens.
- Radii: `6px` controls and badges, `10px` cards and menus, `14px` highlighted panels, `999px` avatar/status dots only.
- Borders provide most separation. Default shadow: `0 1px 2px rgb(11 31 51 / 0.05)`.
- Elevated menus/drawers: `0 16px 36px rgb(11 31 51 / 0.14)`. Avoid stacked, dramatic shadows.

### Chart tokens

Charts are functional and secondary to the job queue.

| Token | Value |
| --- | --- |
| `chart-primary` | `#2563EB` |
| `chart-secondary` | `#0B7A75` |
| `chart-tertiary` | `#64748B` |
| `chart-warning` | `#B7791F` |
| `chart-danger` | `#C2413B` |
| `chart-grid` | `#E3E8EF` |

Use direct labels or an adjacent legend, accessible data summaries, tabular numerals, and no more than five series. Never communicate a category by color alone.

## Layout and responsive grid

- Content width is fluid with a practical maximum of `1440px`; page gutters are 16px below 640px, 24px from 640px, and 32px from 1280px.
- Use Tailwind breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- At `lg` and above, use a fixed 264px sidebar and a flexible content column. Below `lg`, replace it with a top-left menu button and modal drawer.
- Dashboard content uses 4 columns on small screens where space permits and 12 columns from `lg`; cards collapse in priority order rather than becoming cramped.
- Tables become horizontally scrollable only as a last resort. On narrow screens, job rows become labeled summary cards while preserving the same information and links.
- Keep line lengths near 65–75 characters for prose and use sticky controls only when they remain useful at 200% zoom.

## Component rules

### Sidebar

- Opaque navy-tinted white surface with a hairline right border; no glass.
- Product identity at top, primary routes in the middle, current demo identity at bottom.
- Active route uses cobalt text, an icon, and a soft accent background—not color alone.
- Links have at least a 44px touch target and a persistent tooltip only when the sidebar is intentionally collapsed.

### Top utility bar

- The only globally permitted glass surface: translucent white over a barely visible navy/blue atmosphere, with backdrop blur and a solid-color fallback.
- Contains the mobile menu control, page context, and accessible demo role switcher.
- It stays visually quiet and never competes with the page title.

### Cards

- Ordinary cards are opaque white with a border and minimal shadow.
- Use strong title/value hierarchy, restrained metadata, and consistent internal alignment.
- One dashboard highlight may use subtle glass over the atmospheric gradient; all text must retain WCAG AA contrast.

### Tables

- Use a semantic table on desktop, left-align text, right-align numeric durations/counts, and keep the header visually distinct but quiet.
- Entire rows are not buttons. The job reference/title is the primary link; row actions have explicit names.
- Provide visible hover and keyboard focus-within treatment. Do not rely on zebra striping.

### Badges

- Compact, sentence-case labels with an icon or visible text meaning.
- Neutral categories use slate styling; status/SLA badges alone may use semantic palettes.
- Avoid a page filled with pills; badges communicate state, not decoration.

### Buttons

- Primary: cobalt fill, white text. Secondary: white surface, strong border. Tertiary: text/ghost style. Destructive is reserved for destructive actions.
- Minimum height 40px, or 44px for primary mobile actions. Include hover, active, focus-visible, and disabled styles.
- Disabled controls remain legible and do not use opacity below 55%; explain unavailable actions when context is not obvious.

### Forms

- Labels remain visible above controls; placeholders are examples, never labels.
- Inputs use a 44px minimum height, clear required/optional language, and inline errors connected with `aria-describedby`.
- Validate on submit and after an invalid field changes. Preserve entered values after an error.

### Empty, loading, and error states

- Empty states explain what is absent and offer one role-appropriate next step; use a small functional icon rather than illustration.
- Loading states preserve layout with skeletons and announce longer operations accessibly.
- Errors state what failed, what data is still safe, and whether retry is available. Never show raw database or server details.

## Dashboard composition

The dashboard opens on the operational question: **What needs attention now?**

1. **Page header:** concise title, current role context, and one role-appropriate action.
2. **Attention strip:** a single full-width highlighted panel for breached and at-risk jobs. This is the only dashboard surface eligible for glass treatment.
3. **Summary row:** four opaque metric cards—Open, In progress, At risk, and Resolved this week—with short comparison or context labels.
4. **Primary work area:** an 8-column priority queue showing urgent and near-SLA jobs, paired with a 4-column team workload panel for Managers or a personal assignment summary for other roles.
5. **Recent activity:** lower-priority chronological context beneath the actionable queue.

On mobile, order content as attention, primary queue, metrics, personal/team summary, then recent activity. Charts never displace the actionable queue above the fold.

## Accessibility constraints

- Meet WCAG 2.2 AA contrast: at least 4.5:1 for normal text, 3:1 for large text and meaningful UI boundaries.
- Every interactive element is reachable and operable by keyboard in a logical order; skip navigation is the first focusable control.
- Use a consistent 2px cobalt `:focus-visible` ring with a 2px offset. Never remove focus without an equivalent replacement.
- Mobile drawer traps focus while open, closes with Escape, restores focus to its trigger, and exposes its expanded state.
- Role selection has an explicit accessible name and announces the newly active demo identity.
- Tables use captions or accessible names, scoped headers, and meaningful link labels. Responsive cards preserve heading structure and reading order.
- Status and SLA always include text; icons are either labeled or hidden when redundant.
- Respect `prefers-reduced-motion`. Disable nonessential transforms and smooth scrolling; keep essential state transitions under 150ms with no large movement.
- Support 200% text zoom and reflow at 320 CSS pixels without lost content or two-dimensional scrolling, except genuinely tabular data.
- Touch targets are at least 44×44px where practical, and error messages are associated with the relevant fields.

## Reference boundary

Use shadcn/ui primitives where they improve behavior and consistency, but treat them as accessibility foundations. ServiceOps Desk owns the composition, tokens, density, navigation silhouette, and responsive behavior; no default shadcn theme should remain visible as the final design.
