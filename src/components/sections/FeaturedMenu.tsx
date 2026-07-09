"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Flame, Leaf, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  badge?: string | null;
  description: string;
  image: string;
  isVeg?: boolean;
  isSpicy?: boolean;
}

// ── Scroll-driven dish card ────────────────────────────────────────────────────
function DishCard({ item, index }: { item: MenuItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // As card scrolls into/through view: rotate the dish image + float it up slightly
  const rawRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-25, 0, 25]);
  const rotate = useSpring(rawRotate, { stiffness: 60, damping: 18, mass: 0.5 });

  const rawY = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -20]);
  const y = useSpring(rawY, { stiffness: 70, damping: 20 });

  const rawScale = useTransform(scrollYProgress, [0, 0.4, 1], [0.82, 1, 0.92]);
  const scale = useSpring(rawScale, { stiffness: 80, damping: 22 });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: index * 0.12 }}
      className="flex flex-col items-center text-center group"
    >
      {/* Dish image — circular, scroll-driven rotate + scale + float */}
      <Link href={`/menu/${item.id}`} className="block mb-6 relative">
        <motion.div
          style={{ rotate, scale, y }}
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative"
        >
          {/* Plate glow */}
          <div className="absolute inset-4 rounded-full bg-brand-orange/8 blur-2xl" />

          {/* Circular image container */}
          <div
            className="relative rounded-full overflow-hidden border-4 border-white shadow-2xl
                       w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-72 lg:h-72
                       bg-brand-warm-gray group-hover:shadow-brand-orange/20 transition-shadow duration-500"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 288px"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          {/* Floating badge */}
          {item.badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 + 0.3, type: "spring" }}
              className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold
                         px-3 py-1 rounded-full shadow-lg"
            >
              {item.badge}
            </motion.span>
          )}

          {/* Diet icons */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            {item.isVeg && (
              <span className="bg-brand-green-herb text-white rounded-full p-1 shadow">
                <Leaf className="w-3 h-3" />
              </span>
            )}
            {item.isSpicy && (
              <span className="bg-red-500 text-white rounded-full p-1 shadow">
                <Flame className="w-3 h-3" />
              </span>
            )}
          </div>
        </motion.div>
      </Link>

      {/* Text content */}
      <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown mb-2 leading-tight">
        {item.name}
      </h3>
      <p className="font-sans text-sm text-brand-brown-mid leading-relaxed max-w-xs mx-auto mb-4 line-clamp-3">
        {item.description}
      </p>

      {/* Rating + price row */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5",
                i < Math.round(item.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"
              )}
            />
          ))}
          <span className="font-sans text-xs text-brand-brown-mid ml-1">({item.reviews})</span>
        </div>
        <span className="font-serif font-bold text-brand-orange text-lg">৳{item.price}</span>
      </div>

      <Button
        size="sm"
        onClick={handleAdd}
        className={cn(
          "rounded-full px-6 shadow-md active:scale-95 transition-all",
          added
            ? "bg-brand-green-herb hover:bg-brand-green-herb text-white"
            : "bg-brand-orange hover:bg-brand-orange-light text-white"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Added!
            </motion.span>
          ) : (
            <motion.span key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.article>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function FeaturedMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("All");

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        if (res.ok && data.success) {
          const items: MenuItem[] = (data.data ?? []).map((raw: Record<string, unknown>) => ({
            id: (raw._id ?? raw.id) as string,
            name: raw.name as string,
            category: raw.category as string,
            price: raw.price as number,
            rating: (raw.rating as number) ?? 0,
            reviews: (raw.reviews as number) ?? 0,
            badge: raw.badge as string | null | undefined,
            description: raw.description as string,
            image: raw.image as string,
            isVeg: raw.isVeg as boolean | undefined,
            isSpicy: raw.isSpicy as boolean | undefined,
          }));
          setMenuItems(items);
          const cats = Array.from(new Set(items.map((i) => i.category)));
          setMenuCategories(["All", ...cats]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filtered = active === "All" ? menuItems : menuItems.filter((i) => i.category === active);
  // Show max 6 on home page for clean layout; link to /menu for all
  const displayed = filtered.slice(0, 6);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Marble-style background */}
      <div className="absolute inset-0 bg-linear-to-b from-white via-brand-cream/60 to-white" />

      {/* Decorative floating food elements — edges */}
      <motion.div
        className="absolute -left-8 top-1/4 w-32 md:w-44 opacity-80 pointer-events-none hidden md:block"
        animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.12))" }}
      >
        <Image src="/images/ingredients/spice-bowl.webp" alt="" width={180} height={180} />
      </motion.div>

      <motion.div
        className="absolute -right-6 top-16 w-28 md:w-40 opacity-75 pointer-events-none hidden md:block"
        animate={{ y: [0, -20, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.14))" }}
      >
        <Image src="/images/ingredients/tomato-herb.png" alt="" width={160} height={160} />
      </motion.div>

      <motion.div
        className="absolute -right-4 bottom-24 w-24 md:w-36 opacity-70 pointer-events-none hidden md:block"
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.10))" }}
      >
        <Image src="/images/ingredients/basil-sauce.webp" alt="" width={140} height={140} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute left-4 bottom-16 w-20 md:w-28 opacity-65 pointer-events-none hidden md:block"
        animate={{ y: [0, -14, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.10))" }}
      >
        <Image src="/images/ingredients/pepper-dots.png" alt="" width={110} height={110} className="w-full h-auto" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-brand-orange mb-3">
            Our Menu
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-brown leading-tight mb-4">
            What&apos;s on our Plate
          </h2>
          <p className="font-sans text-brand-brown-mid text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Please serve yourself without any hesitate.
          </p>
        </motion.div>

        {/* Category tabs — underline style, horizontal scroll on mobile */}
        <div className="flex gap-0 justify-start md:justify-center mb-12 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "relative px-4 md:px-6 py-2.5 font-sans text-sm font-medium shrink-0 transition-colors whitespace-nowrap",
                active === cat
                  ? "text-brand-orange"
                  : "text-brand-brown-mid hover:text-brand-orange"
              )}
            >
              {cat}
              {active === cat && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Dish grid — 1 col mobile, 2 sm, 3 lg */}
        {loading ? (
          <p className="text-center font-sans text-brand-brown-mid py-12">Loading menu…</p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14"
          >
            {displayed.map((item, i) => (
              <DishCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        )}

        {/* View all link */}
        {menuItems.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-14"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-orange hover:text-brand-orange-light underline underline-offset-4 transition-colors"
            >
              View Full Menu →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
