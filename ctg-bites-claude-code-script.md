# CTG Bites Restaurant — Claude Code Build Script

> Paste this entire prompt into Claude Code to scaffold the full project.

---

## PROMPT FOR CLAUDE CODE

You are building **"CTG Bites"** — a modern Chittagong-focused restaurant website serving authentic Bengali & fusion cuisine.

Carefully read every instruction below and execute them in order without stopping.

---

## TECH STACK

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v3**
- **shadcn/ui** (select components only)
- **Framer Motion** (animations)
- **Aceternity UI** (floating elements, parallax, spotlight effects)
- **next/image** + **next/font** (performance)
- **Mock data only** (MongoDB/Mongoose scaffold ready but unused for now)

---

## PHASE 1 — PROJECT INITIALIZATION

Run these commands:

```bash
npx create-next-app@latest ctg-bites --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ctg-bites

# shadcn
npx shadcn@latest init -d

# shadcn components needed
npx shadcn@latest add button badge card sheet navigation-menu dropdown-menu dialog tabs

# animation & UI packages
npm install framer-motion
npm install clsx tailwind-merge
npm install @tabler/icons-react
npm install lucide-react
npm install next-themes

# fonts (Google via next/font — no external requests at runtime)
# Playfair Display + Inter already handled in layout.tsx below
```

---

## PHASE 2 — DESIGN TOKENS & GLOBAL CONFIG

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:  "#E8622A",
          orangeLight: "#F07B45",
          cream:   "#F5F0E8",
          warmGray:"#EDE8DF",
          brown:   "#2C1A0E",
          brownMid:"#5C3D2E",
          greenHerb:"#4A7C59",
        },
      },
      fontFamily: {
        serif:  ["var(--font-playfair)", "Georgia", "serif"],
        sans:   ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "float-slow":    "floatSlow 6s ease-in-out infinite",
        "float-medium":  "floatMedium 4s ease-in-out infinite",
        "spin-slow":     "spin 20s linear infinite",
        "fade-up":       "fadeUp 0.6s ease forwards",
        "slide-in-left": "slideInLeft 0.7s ease forwards",
      },
      keyframes: {
        floatSlow: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%":     { transform: "translateY(-18px) rotate(3deg)" },
        },
        floatMedium: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-40px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.75rem;
    --background: 245 240 232;
    --foreground: 44 26 14;
  }
  * { @apply border-border; }
  body {
    @apply bg-brand-cream text-brand-brown antialiased;
    overflow-x: hidden;
  }
  ::selection {
    background: #E8622A;
    color: white;
  }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
}
```

---

## PHASE 3 — FONTS & ROOT LAYOUT

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "CTG Bites | Authentic Chittagong Cuisine", template: "%s | CTG Bites" },
  description: "Authentic Chittagong flavours, modern dining. From Mezzban feasts to street-style bhorta — CTG Bites brings the best of Chittagong to your table.",
  keywords: ["chittagong", "ctg bites", "bangladeshi food", "mezzban", "restaurant", "bhuna", "karnafuli"],
  openGraph: { type: "website", title: "CTG Bites", description: "Handcrafted dumplings & Asian fusion." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## PHASE 4 — MOCK DATA

### `src/lib/mock-data.ts`

```ts
// ─── Menu Items ───────────────────────────────────────────────────────────────
export const menuCategories = ["All", "Mezzban", "Bhuna", "Bhorta", "Sides", "Drinks", "Mishti"] as const as const;

export const menuItems = [
  { id: "1", name: "Mezzban Beef Bhuna", category: "Mezzban", price: 320, rating: 5.0, reviews: 512, badge: "Signature", description: "The legendary Chittagong feast dish — slow-cooked beef in a rich, smoky gravy with dried chilies and whole spices.", image: "/images/menu/mezzban-bhuna.jpg", isVeg: false, isSpicy: true },
  { id: "2", name: "CTG Style Shutki Bhorta", category: "Bhorta", price: 180, rating: 4.8, reviews: 334, badge: "CTG Special", description: "Dried fish mashed with mustard oil, green chili, and raw onion. The real taste of Chittagong.", image: "/images/menu/shutki-bhorta.jpg", isVeg: false, isSpicy: true },
  { id: "3", name: "Mezbani Dal", category: "Mezzban", price: 120, rating: 4.9, reviews: 289, badge: "Best Seller", description: "The iconic lentil soup served at every Chittagong feast — thin, spiced, deeply comforting.", image: "/images/menu/mezbani-dal.jpg", isVeg: true, isSpicy: false },
  { id: "4", name: "Kala Bhuna", category: "Bhuna", price: 380, rating: 5.0, reviews: 401, badge: "Fan Fav", description: "The darkest, richest beef bhuna in Bangladesh. Hours of slow cooking gives this its legendary black colour.", image: "/images/menu/kala-bhuna.jpg", isVeg: false, isSpicy: true },
  { id: "5", name: "Aloo Bhorta", category: "Bhorta", price: 80, rating: 4.6, reviews: 178, badge: null, description: "Mashed potato with mustard oil, dried chili, and fresh coriander. Simple and perfect.", image: "/images/menu/aloo-bhorta.jpg", isVeg: true, isSpicy: false },
  { id: "6", name: "Ilish Paturi", category: "Sides", price: 450, rating: 4.9, reviews: 223, badge: "Seasonal", description: "Hilsha fish wrapped in banana leaf and steamed with mustard paste and green chili.", image: "/images/menu/ilish-paturi.jpg", isVeg: false, isSpicy: false },
  { id: "7", name: "Borhani", category: "Drinks", price: 60, rating: 4.9, reviews: 667, badge: "Popular", description: "The classic Chittagong spiced yogurt drink — minty, tangy, and essential alongside any heavy meal.", image: "/images/menu/borhani.jpg", isVeg: true, isSpicy: false },
  { id: "8", name: "Mishti Doi", category: "Mishti", price: 90, rating: 4.9, reviews: 345, badge: "New", description: "Creamy set yogurt sweetened with date molasses. The perfect ending to a Chittagong feast.", image: "/images/menu/mishti-doi.jpg", isVeg: true, isSpicy: false },
];

// ─── Recipes ──────────────────────────────────────────────────────────────────
export const recipes = [
  { id: "1", title: "Authentic Kala Bhuna", slug: "kala-bhuna", time: "3 hrs", difficulty: "Hard", servings: 6, category: "Bhuna", image: "/images/recipes/kala-bhuna.jpg", excerpt: "The crown jewel of Chittagong cooking. Low heat, patience, and the right spices is all it takes.", ingredients: ["1kg beef (bone-in)","4 tbsp mustard oil","2 cups fried onion","2 tbsp ginger paste","1 tbsp garlic paste","3 tsp red chili powder","1 tsp cumin","Whole spices (bay, cardamom, cinnamon)","Salt to taste"], steps: ["Marinate beef with ginger, garlic, and all spices for 1 hour.","Heat mustard oil in a heavy pot, fry onions golden.","Add beef and cook on high heat for 10 minutes.","Reduce to lowest heat, cover and cook 2–2.5 hrs stirring occasionally.","Increase heat at the end until gravy turns dark and thick."] },
  { id: "2", title: "Mezbani Dal", slug: "mezbani-dal", time: "40 min", difficulty: "Easy", servings: 8, category: "Mezzban", image: "/images/recipes/mezbani-dal.jpg", excerpt: "The soup that ties every Chittagong feast together. Thin, light, and loaded with warmth.", ingredients: ["300g masoor dal","1 tsp turmeric","3 dried red chilies","2 tbsp mustard oil","1 tsp panch phoron","4 cloves garlic","Salt"], steps: ["Boil dal with turmeric and salt until completely soft.","Blend or whisk until smooth and thin.","Heat mustard oil, fry garlic and dried chilies.","Pour tadka over dal, stir well and serve."] },
  { id: "3", title: "Shutki Bhorta", slug: "shutki-bhorta", time: "30 min", difficulty: "Medium", servings: 4, category: "Bhorta", image: "/images/recipes/shutki-bhorta.jpg", excerpt: "The most polarising dish in Bangladesh — and the most beloved in Chittagong. Bold, funky, unforgettable.", ingredients: ["150g dried fish (shutki)","3 tbsp mustard oil","4 green chilies","1 medium onion (raw)","1 tsp turmeric","Salt","Fresh coriander"], steps: ["Wash and soak shutki in hot water for 20 min.","Fry in mustard oil with turmeric until crispy.","Cool and flake finely.","Mix with raw onion, green chili, mustard oil, and salt by hand.","Garnish with coriander and serve with hot rice."] },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonials = [
  { id: "1", name: "Sarah M.", location: "New York", rating: 5, text: "The XLB here ruined me for every other dumpling restaurant. That broth burst — absolutely divine.", avatar: "/images/avatars/sarah.jpg" },
  { id: "2", name: "James L.", location: "London", rating: 5, text: "Flew in for a conference, stumbled onto CTG Bites. Best meal of the trip, no contest.", avatar: "/images/avatars/james.jpg" },
  { id: "3", name: "Priya K.", location: "Toronto", rating: 5, text: "The mushroom & truffle dumplings are a revelation. I've brought every visitor I've had here.", avatar: "/images/avatars/priya.jpg" },
  { id: "4", name: "Tomás R.", location: "Barcelona", rating: 4, text: "Perfect atmosphere, bold flavors. The chili oil on the Szechuan wontons is addictive.", avatar: "/images/avatars/tomas.jpg" },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const stats = [
  { label: "CTG recipes", value: "60+" },
  { label: "Happy diners", value: "18K+" },
  { label: "Years of craft", value: "10" },
  { label: "Award wins", value: "7" },
];

// ─── Team ─────────────────────────────────────────────────────────────────────
export const team = [
  { id: "1", name: "Chef Alamgir H.", role: "Head Chef & Founder", bio: "Born in Chittagong, trained in the kitchens of old Agrabad. Alamgir has been perfecting kala bhuna for 25 years.", image: "/images/team/chef-alamgir.jpg" },
  { id: "2", name: "Roksana B.", role: "Bhorta & Traditional Specialist", bio: "Roksana's shutki bhorta and mezbani dal recipes are the soul of CTG Bites — passed down from her grandmother.", image: "/images/team/roksana.jpg" },
];

// ─── Floating ingredient images for hero ──────────────────────────────────────
export const floatingIngredients = [
  { src: "/images/ingredients/spices-bowl.png", alt: "Spices", className: "top-16 left-4 w-28 md:w-36", delay: 0, animationClass: "animate-float-slow" },
  { src: "/images/ingredients/chopsticks.png", alt: "Chopsticks", className: "top-8 left-20 w-20 md:w-28", delay: 0.5, animationClass: "animate-float-medium" },
  { src: "/images/ingredients/tomato-herb.png", alt: "Tomato with herbs", className: "top-12 right-4 w-24 md:w-32", delay: 0.3, animationClass: "animate-float-slow" },
  { src: "/images/ingredients/pepper-scatter.png", alt: "Black pepper", className: "bottom-32 left-1/4 w-16", delay: 0.8, animationClass: "animate-float-medium" },
  { src: "/images/ingredients/basil-bowl.png", alt: "Basil with sauce", className: "bottom-16 right-1/4 w-20 md:w-24", delay: 0.2, animationClass: "animate-float-slow" },
];
```

---

## PHASE 5 — SHARED UTILITIES

### `src/lib/utils.ts`

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## PHASE 6 — COMPONENTS

### `src/components/layout/Navbar.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dumplings", href: "/menu" },
  { label: "Recipes", href: "/recipes" },
  { label: "Food Menu", href: "/menu" },
  { label: "Order Now", href: "/order" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-brand-cream/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-bold text-brand-brown tracking-tight hover:text-brand-orange transition-colors">
          ctg-bites
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="font-sans text-sm text-brand-brownMid hover:text-brand-orange transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange transition-all group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart"><ShoppingBag className="w-4 h-4" /></Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white rounded-full px-6 transition-all"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-brand-brown" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-brand-cream border-t border-brand-warmGray overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="font-sans text-brand-brownMid hover:text-brand-orange transition-colors" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Button className="bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
```

### `src/components/layout/Footer.tsx`

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-brown text-brand-cream/80 py-16 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <p className="font-serif text-3xl text-white mb-3">ctg-bites</p>
          <p className="text-sm leading-relaxed max-w-xs">Bold flavours. Real roots. CTG pride. Handcrafted dumplings and Asian fusion made with love and tradition.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">Menu</p>
          <ul className="space-y-2 text-sm">
            {["Dumplings","Recipes","Food Menu","Order Now"].map(l => (
              <li key={l}><Link href="#" className="hover:text-brand-orange transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">Visit Us</p>
          <address className="not-italic text-sm space-y-2">
            <p>GEC Circle, Nasirabad</p>
            <p>Chittagong-4000, Bangladesh</p>
            <p className="mt-3">Mon–Sun: 11am – 10pm</p>
            <p>hello@ctgbites.com</p>
          </address>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 text-xs text-center text-brand-cream/40">
        © {new Date().getFullYear()} CTG Bites Restaurant. All rights reserved.
      </div>
    </footer>
  );
}
```

### `src/components/ui/FloatingImage.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FloatingImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  delay?: number;
  amplitude?: number; // px to float
  duration?: number;
}

export function FloatingImage({ src, alt, width, height, className, delay = 0, amplitude = 15, duration = 5 }: FloatingImageProps) {
  return (
    <motion.div
      className={cn("absolute pointer-events-none select-none", className)}
      animate={{ y: [0, -amplitude, 0], rotate: [0, 2, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}
    >
      <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" priority />
    </motion.div>
  );
}
```

### `src/components/ui/SectionHeading.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, subtitle, className, align = "center" }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={cn("mb-12", align === "center" ? "text-center" : "text-left", className)}
    >
      {eyebrow && (
        <span className="inline-block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-orange mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 font-sans text-brand-brownMid text-lg max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
```

### `src/components/ui/MenuCard.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Flame, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { menuItems } from "@/lib/mock-data";

type MenuItem = (typeof menuItems)[number];

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer"
    >
      <div className="relative h-52 overflow-hidden bg-brand-warmGray">
        <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {item.badge && (
          <Badge className="absolute top-3 left-3 bg-brand-orange text-white border-0 text-xs">
            {item.badge}
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          {item.isVeg && <span className="bg-brand-greenHerb text-white rounded-full p-1"><Leaf className="w-3 h-3" /></span>}
          {item.isSpicy && <span className="bg-red-500 text-white rounded-full p-1"><Flame className="w-3 h-3" /></span>}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-serif text-lg font-bold text-brand-brown leading-tight">{item.name}</h3>
          <span className="font-sans font-bold text-brand-orange text-lg">${item.price}</span>
        </div>
        <p className="font-sans text-sm text-brand-brownMid mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-brand-brownMid">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-brand-brown">{item.rating}</span>
            <span>({item.reviews})</span>
          </div>
          <Button size="sm" className="bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full text-xs px-4">
            Add to cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
```

### `src/components/sections/HeroSection.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingImage } from "@/components/ui/FloatingImage";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-cream pt-20">
      {/* Subtle dot pattern bg */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle, #C4B8A8 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Floating ingredients — top left */}
      <FloatingImage src="/images/ingredients/spice-bowl.png" alt="Spice bowl" width={160} height={160} className="top-24 left-4 md:left-12 w-28 md:w-40" delay={0} amplitude={14} />
      <FloatingImage src="/images/ingredients/chopsticks.png" alt="Chopsticks" width={100} height={100} className="top-14 left-28 md:left-44 w-16 md:w-24" delay={0.6} amplitude={10} />

      {/* Floating ingredients — top right */}
      <FloatingImage src="/images/ingredients/tomato-herb.png" alt="Tomato with herbs" width={140} height={140} className="top-20 right-4 md:right-16 w-24 md:w-36" delay={0.3} amplitude={16} />

      {/* Floating ingredients — bottom scattered */}
      <FloatingImage src="/images/ingredients/pepper-dots.png" alt="Pepper" width={80} height={80} className="bottom-32 left-1/3 w-14" delay={0.9} amplitude={8} />
      <FloatingImage src="/images/ingredients/basil-sauce.png" alt="Basil sauce" width={100} height={100} className="bottom-24 right-1/4 w-20 md:w-28" delay={0.2} amplitude={12} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12 py-20">
        {/* Left — copy */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.p variants={itemVariants} className="font-sans text-sm font-semibold tracking-widest uppercase text-brand-orange mb-4">
            Est. 2015 — Chittagong
          </motion.p>
          <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-brand-brown leading-[1.05] mb-4">
            Take a taste<br />
            <span className="italic">Come join us.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="font-serif text-xl text-brand-brownMid italic mb-3">
            Bold flavours. Real roots. CTG pride.
          </motion.p>
          <motion.p variants={itemVariants} className="font-sans text-sm text-brand-brownMid leading-relaxed max-w-sm mb-8">
            From Karnafuli riverbanks to your table — we bring the bold, smoky, slow-cooked soul of Chittagong cuisine into every single bite.
          </motion.p>
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <Button
              className="bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 transition-all"
              asChild
            >
              <Link href="/menu">Explore Now</Link>
            </Button>
            <Link href="/recipes" className="font-sans text-sm text-brand-brownMid hover:text-brand-orange transition-colors underline underline-offset-4">
              View Recipes →
            </Link>
          </motion.div>
        </motion.div>

        {/* Right — hero food image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="relative flex justify-center items-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.18))" }}
          >
            <Image
              src="/images/hero-dumplings.png"
              alt="Dumplings in a wooden bowl with chopsticks"
              width={580}
              height={580}
              className="w-full max-w-md md:max-w-xl"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
```

### `src/components/sections/StatsSection.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import { stats } from "@/lib/mock-data";

export function StatsSection() {
  return (
    <section className="bg-brand-brown py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <p className="font-serif text-4xl md:text-5xl font-bold text-brand-orange mb-2">{stat.value}</p>
            <p className="font-sans text-sm text-brand-cream/70 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

### `src/components/sections/FeaturedMenu.tsx`

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuCard } from "@/components/ui/MenuCard";
import { menuCategories, menuItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FeaturedMenu() {
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? menuItems : menuItems.filter(i => i.category === active);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading
        eyebrow="Our Menu"
        title="Every bite, a small joy."
        subtitle="Slow-cooked, spice-forward, unapologetically Chittagong."
      />

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-12">
        {menuCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "px-5 py-2 rounded-full font-sans text-sm font-medium transition-all",
              active === cat
                ? "bg-brand-orange text-white shadow-md"
                : "bg-white text-brand-brownMid hover:bg-brand-orange/10 hover:text-brand-orange border border-brand-warmGray"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item, i) => (
          <MenuCard key={item.id} item={item} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
```

### `src/components/sections/RecipesSection.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChefHat, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { recipes } from "@/lib/mock-data";

export function RecipesSection() {
  return (
    <section className="py-24 bg-brand-warmGray/50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="Recipes" title="Cook it yourself." subtitle="Classic CTG recipes broken down so you can cook them at home." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recipes.map((recipe, i) => (
            <motion.article
              key={recipe.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="relative h-56 overflow-hidden bg-brand-warmGray">
                <Image src={recipe.image} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-3 left-3 bg-brand-brown/80 text-white border-0 backdrop-blur-sm">{recipe.difficulty}</Badge>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-brand-brown mb-2">{recipe.title}</h3>
                <p className="font-sans text-sm text-brand-brownMid mb-4 line-clamp-2">{recipe.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-brand-brownMid mb-5">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{recipe.time}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{recipe.servings} servings</span>
                  <span className="flex items-center gap-1"><ChefHat className="w-3.5 h-3.5" />{recipe.category}</span>
                </div>
                <Button variant="outline" className="w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white rounded-full transition-all" asChild>
                  <Link href={`/recipes/${recipe.slug}`}>View Recipe →</Link>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### `src/components/sections/TestimonialsSection.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading eyebrow="Testimonials" title="What people say." subtitle="From Chittagonians and food lovers who know what real flavour means." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex mb-3">
              {[...Array(t.rating)].map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="font-sans text-sm text-brand-brownMid leading-relaxed mb-5">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-warmGray overflow-hidden relative flex-shrink-0">
                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-brand-brown">{t.name}</p>
                <p className="font-sans text-xs text-brand-brownMid">{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

---

## PHASE 7 — PAGES

### `src/app/page.tsx` (Home — SSG)

```tsx
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import { RecipesSection } from "@/components/sections/RecipesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

// Static site generation — revalidates every 60s (ISR)
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedMenu />
      <RecipesSection />
      <TestimonialsSection />
    </>
  );
}
```

### `src/app/menu/page.tsx` (Menu — ISR)

```tsx
import { Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Food Menu" };
export const revalidate = 120;

export default function MenuPage() {
  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <SectionHeading eyebrow="Full Menu" title="Something for every craving." subtitle="From classic dumplings to seasonal specials — explore everything CTG Bites has to offer." />
      </div>
      <Suspense fallback={<div className="text-center py-24 font-sans text-brand-brownMid">Loading menu…</div>}>
        <FeaturedMenu />
      </Suspense>
    </div>
  );
}
```

### `src/app/recipes/page.tsx` (Recipes — SSG)

```tsx
import { RecipesSection } from "@/components/sections/RecipesSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recipes" };
export const revalidate = 300;

export default function RecipesPage() {
  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SectionHeading eyebrow="Recipes" title="Master the craft." subtitle="Every recipe is tested in our kitchen. Walk through it step by step." />
      </div>
      <RecipesSection />
    </div>
  );
}
```

### `src/app/recipes/[slug]/page.tsx` (Recipe detail — SSG with generateStaticParams)

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { recipes } from "@/lib/mock-data";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const recipe = recipes.find((r) => r.slug === params.slug);
  return { title: recipe?.title ?? "Recipe" };
}

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = recipes.find((r) => r.slug === params.slug);
  if (!recipe) notFound();

  return (
    <article className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <span className="font-sans text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4 block">{recipe.category}</span>
      <h1 className="font-serif text-5xl font-bold text-brand-brown mb-6">{recipe.title}</h1>
      <div className="relative h-80 rounded-2xl overflow-hidden mb-10">
        <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
      </div>
      <p className="font-sans text-brand-brownMid text-lg mb-10 leading-relaxed">{recipe.excerpt}</p>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-brown mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="font-sans text-sm text-brand-brownMid flex items-start gap-2">
                <span className="text-brand-orange mt-0.5">•</span>{ing}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-brown mb-4">Steps</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="font-sans text-sm text-brand-brownMid flex gap-3">
                <span className="font-serif font-bold text-brand-orange text-lg leading-none">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}
```

### `src/app/order/page.tsx` (Order — SSR)

```tsx
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";

export const metadata: Metadata = { title: "Order Now" };
// SSR for real-time stock/price (no cache)
export const dynamic = "force-dynamic";

export default function OrderPage() {
  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SectionHeading eyebrow="Order Online" title="Fresh to your door." subtitle="Select your items and we'll have them ready in 30 minutes." />
      </div>
      <FeaturedMenu />
    </div>
  );
}
```

### `src/app/api/menu/route.ts` (API Route — backend ready)

```ts
import { NextResponse } from "next/server";
import { menuItems } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const data = category && category !== "All"
    ? menuItems.filter((item) => item.category === category)
    : menuItems;

  return NextResponse.json({ success: true, data, count: data.length });
}
```

### `src/app/api/recipes/route.ts`

```ts
import { NextResponse } from "next/server";
import { recipes } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ success: true, data: recipes });
}
```

---

## PHASE 8 — MONGODB/MONGOOSE SCAFFOLD (wired later)

### `src/lib/db.ts`

```ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = (global as any).mongoose ?? { conn: null, promise: null };
(global as any).mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### `src/models/MenuItem.ts`

```ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  image: string;
  isVeg: boolean;
  isSpicy: boolean;
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
  name:        { type: String, required: true },
  category:    { type: String, required: true, enum: ["Dumplings","Soups","Sides","Drinks","Desserts"] },
  price:       { type: Number, required: true },
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviews:     { type: Number, default: 0 },
  badge:       { type: String },
  description: { type: String, required: true },
  image:       { type: String, required: true },
  isVeg:       { type: Boolean, default: false },
  isSpicy:     { type: Boolean, default: false },
}, { timestamps: true });

export const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
```

### `src/models/Recipe.ts`

```ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  slug: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  category: string;
  image: string;
  excerpt: string;
  ingredients: string[];
  steps: string[];
}

const RecipeSchema = new Schema<IRecipe>({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  time:        { type: String, required: true },
  difficulty:  { type: String, enum: ["Easy","Medium","Hard"], required: true },
  servings:    { type: Number, required: true },
  category:    { type: String, required: true },
  image:       { type: String, required: true },
  excerpt:     { type: String, required: true },
  ingredients: [{ type: String }],
  steps:       [{ type: String }],
}, { timestamps: true });

export const Recipe = mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);
```

### `src/models/Order.ts`

```ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  customerEmail: string;
  items: IOrderItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  customerName:  { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    name:       String,
    price:      Number,
    quantity:   { type: Number, min: 1 },
  }],
  total:  { type: Number, required: true },
  status: { type: String, enum: ["pending","confirmed","preparing","delivered","cancelled"], default: "pending" },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
```

---

## PHASE 9 — ENV & CONFIG FILES

### `.env.local`

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ctg-bites?retryWrites=true&w=majority
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
```

---

## PHASE 10 — PLACEHOLDER IMAGES SETUP

Since real food photography isn't included, do the following:

1. Create `public/images/` with subdirectories: `menu/`, `recipes/`, `ingredients/`, `team/`, `avatars/`
2. For the **hero dumpling image** and **floating ingredient PNGs**, use Unsplash URLs by updating `next.config.ts` or download free-use food PNGs
3. For quick prototyping, replace `src` props with: `https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600` (dumplings) and similar food photography

Or create a utility file `src/lib/image-placeholders.ts`:

```ts
export const PLACEHOLDER_IMAGES = {
  heroDumplings: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=700&q=80",
  spiceBowl:     "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80",
  porkDumpling:  "https://images.unsplash.com/photo-1541696490-8744a5dc0228?w=500&q=80",
  xlb:           "https://images.unsplash.com/photo-1609525313377-a2a0c5524c86?w=500&q=80",
  milkTea:       "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
};
```

---

## PHASE 11 — FINAL INSTALL & RUN

```bash
npm install mongoose
npm install tailwindcss-animate

# Start dev server
npm run dev

# Build for production (verifies SSG/SSR/ISR)
npm run build
npm start
```

---

## PAGES SUMMARY

| Route | Strategy | Description |
|-------|----------|-------------|
| `/` | ISR (60s) | Home: Hero, Stats, Menu preview, Recipes, Testimonials |
| `/menu` | ISR (120s) | Full menu with category filter tabs |
| `/recipes` | ISR (300s) | Recipe cards grid |
| `/recipes/[slug]` | SSG | Static recipe detail pages |
| `/order` | SSR | Order page (force-dynamic for real-time) |
| `/api/menu` | API Route | GET menu items, filter by category |
| `/api/recipes` | API Route | GET all recipes |

---

## NOTES FOR CLAUDE CODE

- All Framer Motion components are `"use client"` — keep server components clean
- When adding real DB: swap mock-data imports in API routes for `connectDB()` + Mongoose queries
- Aceternity UI components (SpotlightCard, BackgroundBeams, MovingBorders) can be added to hero/cards as enhancement
- The orange accent `#E8622A` is the brand's single strongest color — use it intentionally, not everywhere
- For the floating ingredient PNGs, use images with transparent backgrounds (PNG with no bg) for the drop-shadow effect to work correctly
