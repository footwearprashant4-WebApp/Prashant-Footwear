# Reports & Analytics Panel with Interactive Detailed Drawers

1-2 concise sentences: Build the exact 6-card **Reports & Analytics Panel** matching the user's reference design, featuring soft warm/amber visual accents, squircle icon badges, and rich interactive slide-out drawers for each of the 6 core business reports.

> [!IMPORTANT] Confirmed User Preferences & Decisions
> - **Card Click Interaction (Confirmed in Phase 1)**: Clicking any of the 6 report cards opens a high-fidelity interactive **Detailed Report Drawer** with comprehensive breakdown tables, metrics, search/filtering, and export options (PDF/CSV/Print).
> - **Placement & Mobile Layout (Confirmed)**: Integrated directly into the **Reports & Analytics** section of `MonthlyReportSection.tsx` / `AdminDashboard.tsx`, with full responsive adaptation for mobile viewports (stacking grid, swipe/touch-friendly drawer).

---

## 1. Overview & Core Concept

- **What It Does**: Provides admins and store managers with a dedicated 6-card Reports grid matching the exact reference UI layout:
  1. **Executive Sales Summary** (Gross sales, net profit, average ticket size, conversion rates)
  2. **Product & Footwear Analytics** (Top selling styles, size distribution, brand shares, slow-moving stock)
  3. **Returns & Refunds Ledger** (Return reasons breakdown, customer refund history, exchange rate metrics)
  4. **Inventory & Stock Inward Tracker** (Inward challans, stock valuation, size availability, reorder points)
  5. **Category & Sub-Category Split** (Men, Women, Kids footwear revenue & volume distribution)
  6. **Payment & Settlement Insights** (Cash, UPI, Credit Card, credit ledger settlements)
- **Target Audience / Persona**: Store Owner, Retail Admin, and Sales Managers needing quick executive summaries and deep analytical reports.
- **Key Value**: Replaces static reporting with instantaneous, timeframe-synced visual cards and deep-dive drawer panels.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. User navigates to the **Reports and Analytics** section in the Sales Analytics Engine.
  2. User views 6 distinct cards styled with light warm-orange / amber squircle icon badges, clear titles, metric summaries, and action affordances.
  3. Clicking any card slides out a smooth right-hand **Interactive Detailed Drawer** (or full-height bottom sheet on mobile) containing deep tabular data, date filters, search, and export options.
  4. On mobile devices, the 6-card grid shifts from a multi-column desktop grid to a responsive 1-column / 2-column stacked layout with touch-friendly spacing.

- **Visual Identity & Theme**:
  - **Color Tokens**: Soft amber/warm orange accent (`#F59E0B` / `#D97706`), neutral slate canvas (`#FAFAF9` light mode, `#18181B` dark mode), soft hairline borders (`#E7E5E4` / `#27272A`).
  - **Squircle Badges**: Custom rounded squircle backgrounds (`rounded-2xl` or `rounded-xl` with soft tint `bg-amber-500/10 dark:bg-amber-500/20`) housing distinct Lucide icons for each report.
  - **Typography**: `Plus Jakarta Sans` for clean, modern headings and metric counts; monospace tabular numerals (`font-mono tabular-nums`) for all monetary values and units.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Slide-Out Drawer Overlay vs Page Navigation**
  - *Chosen Approach*: Interactive Slide-Out Drawer (with bottom-sheet mode on mobile).
  - *Why*: Chosen directly by the user in Phase 1 clarification. Maintains context within the Sales Analytics Engine without triggering full-page context switches.
  - *Alternatives Considered*: Direct page navigation (skipped by user decision).

- **Decision 2: Timeframe Synchronization**
  - *Chosen Approach*: All 6 detailed report drawers dynamically react to the active time frame selected in the Quick Selection bar (Daily, Weekly, Monthly, Custom Range).
  - *Why*: Guarantees data consistency across performance metrics, invoice breakdowns, and category insights.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SALES ANALYTICS ENGINE                                │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  QUICK SELECTION TIMEFRAME BAR (Daily | Weekly | Monthly | Custom Date) │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  PERFORMANCE OVERVIEW CARDS                                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  6-CARD REPORTS & ANALYTICAL PANEL                                      │ │
│ │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                   │ │
│ │  │ 1. Executive  │ │ 2. Product    │ │ 3. Returns &  │                   │ │
│ │  │    Sales      │ │    Footwear   │ │    Refunds    │                   │ │
│ │  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘                   │ │
│ │  ┌───────┴───────┐ ┌───────┴───────┐ ┌───────┴───────┐                   │ │
│ │  │ 4. Inventory  │ │ 5. Category   │ │ 6. Payment & │                   │ │
│ │  │    Tracker    │ │    Split      │ │    Settlement │                   │ │
│ │  └───────────────┘ └───────────────┘ └───────────────┘                   │ │
│ └──────────────────────────────────┬──────────────────────────────────────┘ │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ (Click Card)
                                     ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                   INTERACTIVE DETAILED REPORT DRAWER                      │
 │  ┌─────────────────────────────────────────────────────────────────────┐  │
 │  │ Header: Report Title, Selected Date Range Badge, Close (X)          │  │
 │  ├─────────────────────────────────────────────────────────────────────┤  │
 │  │ Summary Metric Cards (Total Revenue, Margin, Unit Volume)           │  │
 │  ├─────────────────────────────────────────────────────────────────────┤  │
 │  │ Search & Sub-Filter Bar (Category, Payment Type, Size)              │  │
 │  ├─────────────────────────────────────────────────────────────────────┤  │
 │  │ Detailed Data Table (Tabular figures, status chips, customer details)│  │
 │  ├─────────────────────────────────────────────────────────────────────┤  │
 │  │ Actions Bar: Export PDF | Export CSV | Print Ledger                 │  │
 │  └─────────────────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

- **State variables**:
  - `activeReportDrawer`: `'none' | 'executive' | 'product' | 'returns' | 'inventory' | 'category' | 'payments'`
  - `drawerSearchQuery`: string filter state
  - `drawerTab`: sub-category or filter selection inside active drawer
- **Data sources**:
  - Dynamically computes state from `monthlyData` (orders, stock ledgers, return logs, category aggregates).
