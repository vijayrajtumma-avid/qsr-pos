# Design Guidelines: Kitchen & Billing Management System

## Design Approach: Modern Utility Dashboard

**Selected Framework:** Material Design principles adapted for operational efficiency, drawing inspiration from productivity tools like Linear and Notion for clean information hierarchy.

**Rationale:** This is a utility-focused application for kitchen and billing management where clarity, speed, and data visibility are paramount. Design should reduce cognitive load while maintaining visual polish.

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Orange Primary: 18 100% 60% (brand/CTA)
- Orange Light: 18 100% 95% (backgrounds, hover states)
- Blue Secondary: 205 100% 27% (accents, info states)
- Blue Light: 205 100% 95% (secondary backgrounds)

**Neutral System:**
- Gray 950: 220 20% 10% (dark mode bg, text on light)
- Gray 900: 220 15% 15% (dark surfaces)
- Gray 100: 220 15% 96% (light mode bg)
- Gray 50: 220 15% 98% (cards, elevated surfaces)
- White: Pure white for light mode cards

**Semantic Colors:**
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%

**Dark Mode:** Full support with inverted neutrals, maintaining color vibrancy for orange/blue.

### B. Typography

**Font Stack:** Inter (Google Fonts) for UI, JetBrains Mono for numeric data/codes

**Hierarchy:**
- Hero/Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-medium (18px)
- Body: text-base font-normal (16px)
- Captions/Meta: text-sm font-normal (14px)
- Small Labels: text-xs font-medium (12px)

**Line Heights:** Use tailwind defaults (tight for headings, relaxed for body)

### C. Layout System

**Spacing Primitives:** Use units of 1, 2, 4, 6, 8, 12, 16, 24 for consistency
- Component padding: p-4 to p-6
- Section spacing: gap-8 to gap-12
- Page margins: px-6 lg:px-12

**Grid Structure:**
- Container: max-w-7xl mx-auto
- Dashboard grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Two-column layouts: grid-cols-1 lg:grid-cols-2

### D. Component Library

**Navigation:**
- Sticky top nav with logo, main links, user avatar
- Background: bg-white dark:bg-gray-950 with border-b
- Active states: Orange underline indicator
- Mobile: Hamburger menu with slide-in drawer

**Cards:**
- Elevated style: bg-white dark:bg-gray-900, rounded-xl, shadow-sm
- Border: border border-gray-200 dark:border-gray-800
- Padding: p-6
- Hover: Subtle lift with shadow-md transition

**Buttons:**
- Primary: Orange bg, white text, rounded-lg, px-6 py-2.5
- Secondary: Blue bg, white text
- Outline: Border with orange/blue, transparent bg
- Icon buttons: p-2, rounded-md

**Data Tables:**
- Zebra striping for rows
- Sticky headers on scroll
- Compact spacing: py-3 px-4
- Sort indicators with Lucide icons
- Responsive: Cards on mobile, table on desktop

**Forms:**
- Floating labels or top-aligned labels
- Input fields: border-2, focus:border-orange, rounded-lg
- Consistent height: h-11
- Error states: Red border with error message below

**Status Badges:**
- Rounded-full, px-3 py-1, text-xs font-medium
- Color-coded: Green (completed), Orange (pending), Red (urgent)

### E. Page-Specific Layouts

**Home Page:**
- Hero section with gradient overlay: orange to blue diagonal gradient
- Welcome message and quick stats dashboard (4 metric cards)
- Quick action cards to Billing and Kitchen with icons
- Recent activity feed at bottom

**Billing View:**
- Top metrics bar: Total revenue, pending invoices, paid today
- Filterable invoice table with search
- Action buttons: Create Invoice, Export Data
- Side panel for invoice details

**Kitchen View:**
- Order queue dashboard with priority indicators
- Kanban-style columns: New Orders, In Progress, Ready
- Timer displays for each order
- Quick actions: Mark Complete, Add Note

### F. Animations

**Minimal Motion Philosophy:**
- Page transitions: Fade in only (200ms)
- Card hovers: translateY(-2px) + shadow change
- Button clicks: Scale(0.98) feedback
- Loading states: Spinner or skeleton screens
- NO scroll-triggered animations or parallax

---

## Images

**Hero Section (Home Page):**
- Use a professional kitchen/restaurant ambiance photo with warm lighting
- Apply gradient overlay (orange to transparent, opacity 60%) for text legibility
- Image should convey efficiency and modern technology
- Position: Full-width, height: 400px on desktop, 300px mobile

**Dashboard Icons:**
- Use Lucide React icons throughout for consistency
- Kitchen: ChefHat, Timer, ClipboardCheck
- Billing: Receipt, DollarSign, FileText
- Size: w-6 h-6 for cards, w-5 h-5 for buttons

---

**Critical Success Factors:**
- Information density without clutter
- Instant data recognition (color-coded statuses)
- Touch-friendly targets (min 44px tap areas)
- Performance-first (minimal animations, optimized renders)
- Accessible contrast ratios (WCAG AA minimum)