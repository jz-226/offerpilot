---
name: offerpilot:new-page
description: |
  Create a new page in the OfferPilot Next.js project. Use this skill whenever the user
  wants to add a new page, route, or screen to OfferPilot — even if they don't say
  "new page" explicitly (e.g., "add a settings page", "I need a history view",
  "make a page for X"). Also trigger on requests to add features that clearly need
  their own page.
---

# OfferPilot — New Page

When the user asks to create a new page in the OfferPilot project, follow these steps in order.

The project is at `f:/offerpilot/`, built with Next.js 16 App Router, Tailwind CSS 4, and TypeScript.

---

## Step 1: Determine page type

Ask the user (or infer from context) which type this page is:

| Type | Has bottom nav? | Has back button? | Background | Examples |
|------|----------------|-------------------|------------|----------|
| **app** | Yes (5-tab nav) | Yes | `#f8faff` solid | dashboard, roadmap, learning, growth |
| **flow** | No | Yes | `linear-gradient(180deg, #ffffff 0%, #f8faff 100%)` | goal, analysis, reflection, onboarding |

If the user doesn't specify, default to **flow**.

---

## Step 2: Create the page file

Create `src/app/<route-name>/page.tsx`. The file name must be the URL-safe slug (e.g., `my-page` → `/my-page`).

### App page template

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function <PageName>Page() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      <div className="flex-1 overflow-auto pb-20">
        {/* Header */}
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">返回</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight"><Page Title></h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed"><Page Subtitle></p>
        </div>

        {/* Page content */}
        <div className="px-6">
          {/* Content goes here */}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-5 safe-bottom flex items-center justify-around z-40 will-change-transform">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => { router.push(item.route); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"}`}>
            <NavIcon name={item.icon} active={item.active} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
```

For the `navItems`, `NavIcon`, and `safe-bottom` CSS, copy the exact structure from `src/app/dashboard/page.tsx` — these are shared across all app pages and must stay consistent.

### Flow page template

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function <PageName>Page() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      {/* Back button */}
      <div className="px-6 pt-6 pb-0 flex items-center shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
      </div>

      {/* Hero */}
      <div className="px-6 mb-4 mt-4 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight"><Page Title></h1>
        <p className="text-gray-400 text-base mt-1.5 leading-relaxed"><Page Subtitle></p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-auto pb-4">
        {/* Content goes here */}
      </div>
    </main>
  );
}
```

### UI patterns to follow

When filling in page content, use these patterns from existing OfferPilot pages:

**Cards:**
```
bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3
```
Use `rounded-3xl` for larger section cards. Use `rounded-2xl` for form cards and list items.

**CTA buttons:**
```
w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200
```

**Form labels:**
```
text-xs text-gray-400 mb-1
```

**Form inputs:**
```
w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none
```

**Section headings:**
```
text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5
```

**AI / suggestion cards** — use indigo styling:
```
bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5
```

**Strength tags** — emerald:
```
bg-emerald-50 text-emerald-700 border-emerald-100
```

**Gap tags** — red:
```
bg-red-50 text-red-600 border-red-100
```

---

## Step 3: Update bottom navigation (app pages only)

If the new page is an **app** page, add it to the `navItems` array in ALL of these files:

- `src/app/dashboard/page.tsx`
- `src/app/roadmap/page.tsx`
- `src/app/learning/page.tsx`
- `src/app/growth/page.tsx`

Each file has a `navItems` array like:
```tsx
const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: false },
  { label: "路线", icon: "route", route: "/roadmap", active: false },
  // ... add new item here
];
```

Adding a new nav tab requires:
1. Adding a new entry to the array in all 4 files
2. Adding a matching `case` in the `NavIcon` switch statement in all 4 files
3. The icon name should describe the icon (e.g., `settings`, `history`, `stats`)

If adding a new tab beyond the 5 existing ones is awkward (mobile nav gets crowded), suggest the user consider whether the page should be accessed via a different path (e.g., from a card on the dashboard or from the profile page).

---

## Step 4: Update routing memory

After creating the page, update the memory file at:
`C:\Users\姜梓\.claude\projects\f--\memory\offerpilot-page-routing.md`

Add the new route to the table and note any navigation changes. If this is a flow page that connects to an existing page, note the connection.

---

## Step 5: Verify

After creating the file, run this check:
```bash
npx next build 2>&1 | tail -5
```
from the offerpilot directory. Fix any TypeScript or build errors before reporting success.
