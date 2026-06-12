<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work:
- Read docs from `node_modules/next/dist/docs/`
- Do NOT rely on outdated knowledge
- This is **Next.js 16** with **Tailwind CSS v4** — breaking changes from v3/v15 apply

<!-- END:nextjs-agent-rules -->


# Project: CTG Bites Restaurant

A modern Chittagong-focused restaurant website serving authentic Bengali cuisine.

**Stack:**
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 (no `tailwind.config.ts` — tokens live in `globals.css` via `@theme`)
- shadcn/ui (Tailwind v4 compatible)
- Framer Motion (animations — all animated components must be `"use client"`)
- lucide-react (icons)
- MongoDB/Mongoose (scaffolded, not yet wired — use mock data for now)


# Commands

- `npm run dev` → start dev server (http://localhost:3000)
- `npm run build` → production build
- `npm run lint` → lint check


# Directory Structure

```
src/
  app/                   # App Router pages & API routes
    page.tsx             # Home (ISR 60s)
    menu/page.tsx        # Full menu (ISR 120s)
    recipes/page.tsx     # Recipes list (ISR 300s)
    recipes/[slug]/      # Recipe detail (SSG)
    order/page.tsx       # Order page (SSR force-dynamic)
    api/menu/route.ts    # GET /api/menu?category=X
    api/recipes/route.ts # GET /api/recipes
  components/
    layout/              # Navbar, Footer
    sections/            # HeroSection, StatsSection, FeaturedMenu, RecipesSection, TestimonialsSection
    ui/                  # shadcn components + FloatingImage, SectionHeading, MenuCard
  lib/
    mock-data.ts         # All mock data (menuItems, recipes, testimonials, stats, team)
    utils.ts             # cn() helper (clsx + tailwind-merge)
    db.ts                # MongoDB connection (unused until MONGODB_URI set)
    image-placeholders.ts
  models/                # Mongoose models: MenuItem, Recipe, Order
```


# Tailwind v4 Rules (CRITICAL)

- **No `tailwind.config.ts`** — design tokens live in `globals.css` inside `@theme inline { ... }`
- Brand color token format: `--color-brand-orange: #E8622A` → class: `bg-brand-orange`, `text-brand-orange`
- Multi-word tokens use hyphens: `--color-brand-brown-mid` → `text-brand-brown-mid`
- Font tokens: `--font-serif: var(--font-playfair)` → class: `font-serif`
- Animation tokens: `--animate-float-slow: floatSlow 6s ...` → class: `animate-float-slow`
- Do NOT use `@tailwind base/components/utilities` — use `@import "tailwindcss"` instead
- Do NOT write `bg-[#E8622A]` — use the `brand-*` token classes


# Brand Design Tokens

Colors available via Tailwind classes:
- `brand-orange` (#E8622A) — primary accent, use intentionally
- `brand-orange-light` (#F07B45) — hover states
- `brand-cream` (#F5F0E8) — page background
- `brand-warm-gray` (#EDE8DF) — subtle backgrounds
- `brand-brown` (#2C1A0E) — primary text, dark bg
- `brand-brown-mid` (#5C3D2E) — secondary text
- `brand-green-herb` (#4A7C59) — vegetarian indicator

Fonts: `font-serif` (Playfair Display), `font-sans` (Inter)

Animations: `animate-float-slow`, `animate-float-medium`, `animate-fade-up`, `animate-slide-in-left`


# Architecture Rules

- Server components are the default — add `"use client"` only when needed (Framer Motion, useState, useEffect)
- Dynamic route `params` is a `Promise` in Next.js 16 — always `await params` in server components
- Keep mock-data imports in components/pages; swap for DB calls in API routes when MongoDB is ready
- All `"use client"` animation components go in `src/components/` — keep `src/app/` pages server-first


# Critical Safety Rules

❌ DO NOT:
- Use `tailwind.config.ts` — it doesn't work with v4
- Use `@tailwind base/components/utilities` — use `@import "tailwindcss"`
- Add inline styles when a Tailwind class exists
- Hardcode hex colors like `bg-[#E8622A]` — use `bg-brand-orange`
- Access `params.slug` synchronously — always `await params` first
- Add `"use client"` to layout.tsx or page.tsx unnecessarily

✅ ALWAYS:
- Use `bg-brand-*`, `text-brand-*` classes for brand colors
- Add `"use client"` to any component using Framer Motion, useState, or useEffect
- Use `cn()` from `@/lib/utils` for conditional class merging
- Use `next/image` with `fill` for responsive images in fixed-height containers
- Use `next/font/google` with `variable` option for custom fonts
- Use the `@theme inline` block in `globals.css` for any new design tokens
- Keep images in `public/images/` with subdirs: `menu/`, `recipes/`, `ingredients/`, `team/`, `avatars/`
