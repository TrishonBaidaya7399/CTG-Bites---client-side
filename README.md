# CTG Bites Restaurant

**Live URL:** [https://ctg-bites.vercel.app/](https://ctg-bites.vercel.app/) *(replace with your actual deployment URL)*

CTG Bites is a modern, full-stack restaurant website for a Chittagong-based eatery serving authentic Bengali cuisine. It features a beautiful public-facing website for customers and a powerful admin panel for restaurant management.

## Project Type

Full-Stack Restaurant Web Application — Customer-facing website + Admin Dashboard

## Client Features

### Public Website
- **Home Page** — Stunning hero section with animated floating images, featured menu highlights, key stats, popular recipes, and customer testimonials
- **Full Menu** — Browse all dishes by category (Appetizers, Mains, Desserts, Drinks) with detailed descriptions, prices, and dietary indicators
- **Recipes** — Discover authentic Bengali recipes with step-by-step cooking instructions and ingredient lists
- **Recipe Details** — Individual recipe pages with detailed directions, prep time, and difficulty levels
- **Online Ordering** — Place food orders directly from the menu with a simple, intuitive interface
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop screens
- **Smooth Animations** — Framer Motion powered scroll animations, fade-ins, and floating image effects
- **SEO Optimized** — ISR and SSG rendering for fast page loads and search engine visibility

### Navigation
- Sticky Navbar with smooth scrolling to sections
- Mobile-friendly hamburger menu
- Footer with contact info, social links, and site map

## Admin Panel Features

- **Dashboard Overview** — Quick stats on total orders, revenue, active menu items, and customer feedback
- **Menu Management** — Add, edit, and remove menu items with categories, pricing, descriptions, and images
- **Order Management** — View incoming orders, update order status (Pending, Preparing, Ready, Delivered), and manage order history
- **Recipe Management** — Add new recipes, edit existing ones, and organize by category
- **Testimonials** — Review and approve customer testimonials before they appear on the site
- **Content Management** — Update hero section, stats, and featured items without touching code
- **Image Uploads** — Direct upload for menu photos, recipe images, and team member pictures
- **Analytics** — View order trends, popular dishes, and customer engagement metrics
- **Dark Mode** — Admin panel optimized for long sessions with dark mode support

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run lint check
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000) for the customer site.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel *(coming soon)*.

## Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-orange` | `#E8622A` | Primary accent |
| `brand-orange-light` | `#F07B45` | Hover states |
| `brand-cream` | `#F5F0E8` | Page background |
| `brand-warm-gray` | `#EDE8DF` | Subtle backgrounds |
| `brand-brown` | `#2C1A0E` | Primary text, dark bg |
| `brand-brown-mid` | `#5C3D2E` | Secondary text |
| `brand-green-herb` | `#4A7C59` | Vegetarian indicator |

### Fonts

- **font-serif** — Playfair Display (headings, display text)
- **font-sans** — Inter (body text, UI)

### Animations

- `animate-float-slow` — Floating effect (6s)
- `animate-float-medium` — Floating effect (4s)
- `animate-fade-up` — Fade in from below
- `animate-slide-in-left` — Slide in from left

## Tech Stack

- **Next.js 16** — App Router, TypeScript
- **Tailwind CSS v4** — Utility-first styling with custom `@theme` tokens
- **shadcn/ui** — Tailwind v4 compatible component library
- **Framer Motion** — Animations and transitions
- **lucide-react** — Icons
- **MongoDB / Mongoose** — Scaffolded database layer (mock data for now)

## Project Structure

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

## Architecture Notes

- Server components are the default — add `"use client"` only when needed (Framer Motion, useState, useEffect)
- Dynamic route `params` is a **Promise** in Next.js 16 — always `await params` in server components
- Keep mock-data imports in components/pages; swap for DB calls in API routes when MongoDB is ready
- All `"use client"` animation components go in `src/components/` — keep `src/app/` pages server-first

## Images

Place all images under `public/images/` with subdirectories:

- `menu/` — Menu item photos
- `recipes/` — Recipe photos
- `ingredients/` — Ingredient photos
- `team/` — Team member photos
- `avatars/` — Testimonial avatars

## License

MIT
