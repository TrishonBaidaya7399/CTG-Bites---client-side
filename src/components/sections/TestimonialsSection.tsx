"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Review } from "@/types/review";

const AUTO_ADVANCE_MS = 6000;

interface ReviewGroup {
  groupId: string;
  customerName: string;
  customerAvatar?: string;
  comment?: string;
  createdAt: string;
  items: { itemName: string; itemImage: string; rating: number }[];
}

function groupReviews(reviews: Review[]): ReviewGroup[] {
  const byGroup = new Map<string, ReviewGroup>();
  for (const r of reviews) {
    const existing = byGroup.get(r.groupId);
    if (existing) {
      existing.items.push({ itemName: r.itemName, itemImage: r.itemImage, rating: r.rating });
    } else {
      byGroup.set(r.groupId, {
        groupId: r.groupId,
        customerName: r.customerName,
        customerAvatar: r.customerAvatar,
        comment: r.comment,
        createdAt: r.createdAt,
        items: [{ itemName: r.itemName, itemImage: r.itemImage, rating: r.rating }],
      });
    }
  }
  return Array.from(byGroup.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Dish image(s) for the active review — orbiting when a group has more than one item. */
function ReviewDishVisual({ items }: { items: ReviewGroup["items"] }) {
  const [main, ...rest] = items;

  return (
    <div className="relative w-full h-90 sm:h-100 md:h-130 lg:h-155 flex items-center justify-center">
      {/* Orbit rings — only when there's more than one dish to place on them */}
      {rest.length > 0 && (
        <>
          <div
            className="absolute rounded-full border border-dashed border-brand-orange/20 hidden sm:block"
            style={{ width: 460, height: 460 }}
          />
          <div
            className="absolute rounded-full border border-dashed border-brand-brown/10 hidden sm:block"
            style={{ width: 360, height: 360 }}
          />
          <div
            className="absolute rounded-full border border-dashed border-brand-orange/20 sm:hidden"
            style={{ width: 280, height: 280 }}
          />
          <div
            className="absolute rounded-full border border-dashed border-brand-brown/10 sm:hidden"
            style={{ width: 220, height: 220 }}
          />
        </>
      )}

      {rest.map((item, i) => {
        const angle = (360 / rest.length) * i;
        const duration = 20 + i * 3;
        return (
          <motion.div
            key={`${item.itemName}-${i}`}
            className="absolute"
            style={{ width: 72, height: 72, top: "50%", left: "50%", marginTop: -36, marginLeft: -36 }}
            animate={{ rotate: [angle, angle + 360] }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              animate={{ rotate: [-angle, -(angle + 360)] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", top: "50%", left: "50%", marginTop: -36, marginLeft: -36, translateX: 130 }}
              className="sm:hidden"
            >
              <div
                style={{ width: 72, height: 72 }}
                className="rounded-full overflow-hidden shadow-lg border-2 border-white bg-brand-warm-gray"
              >
                <Image src={item.itemImage} alt={item.itemName} width={72} height={72} className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div
              animate={{ rotate: [-angle, -(angle + 360)] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", top: "50%", left: "50%", marginTop: -55, marginLeft: -55, translateX: 230 }}
              className="hidden sm:block"
            >
              <div
                style={{ width: 110, height: 110 }}
                className="rounded-full overflow-hidden shadow-xl border-2 border-white bg-brand-warm-gray"
              >
                <Image src={item.itemImage} alt={item.itemName} width={110} height={110} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Central dish — gentle float, matches the hero's central plate sizing/animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <motion.div
          key={main.itemName}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-full overflow-hidden shadow-2xl border-4 border-white bg-brand-cream relative w-48 h-48 sm:w-60 sm:h-60 md:w-70 md:h-70 lg:w-80 lg:h-80"
        >
          <Image src={main.itemImage} alt={main.itemName} fill sizes="(max-width: 640px) 224px, (max-width: 768px) 320px, 420px" className="object-cover" priority />
        </motion.div>
      </motion.div>
    </div>
  );
}

export function TestimonialsSection() {
  const [groups, setGroups] = useState<ReviewGroup[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setGroups(groupReviews(data.reviews ?? []));
        }
      } catch {
        // no reviews yet — section renders nothing rather than stale mock data
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const goTo = useCallback((index: number, total: number) => {
    setActiveIndex(((index % total) + total) % total);
  }, []);

  const goPrev = useCallback(() => goTo(activeIndex - 1, groups.length), [activeIndex, groups.length, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1, groups.length), [activeIndex, groups.length, goTo]);

  // Auto-advance through reviews on a timer; pauses while hovered or an arrow/dot is
  // used, so it doesn't fight a customer actively browsing.
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (paused || groups.length <= 1) return;
    const id = setInterval(() => goTo(activeIndex + 1, groups.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, activeIndex, groups.length, goTo]);

  function pauseThenResume() {
    setPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setPaused(false), AUTO_ADVANCE_MS * 2);
  }

  useEffect(() => () => { if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current); }, []);

  const active = groups[activeIndex];

  const avatarDots = useMemo(() => groups.slice(0, 6), [groups]);

  if (groups.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Corner garnish — decorative, matches the reference layout's plated-ingredient framing */}
      <Image
        src="/images/review section/review_section_left_bottom_corner.png"
        alt=""
        aria-hidden
        width={220}
        height={220}
        className="pointer-events-none select-none absolute -left-6 bottom-0 w-28 sm:w-40 md:w-52 h-auto opacity-90 hidden sm:block"
      />
      <Image
        src="/images/review section/review_section_right_bottom_corner.png"
        alt=""
        aria-hidden
        width={220}
        height={220}
        className="pointer-events-none select-none absolute -right-4 bottom-0 w-24 sm:w-32 md:w-44 h-auto opacity-90 hidden sm:block"
      />
      <Image
        src="/images/review section/review_section_right_top__corner.png"
        alt=""
        aria-hidden
        width={260}
        height={260}
        className="pointer-events-none select-none absolute -right-6 top-0 w-32 sm:w-44 md:w-56 h-auto opacity-90 hidden sm:block"
      />

      <div
        className="relative max-w-7xl mx-auto px-4 md:px-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <SectionHeading
          eyebrow="Testimonials"
          title="Let's see what others say."
          subtitle="Please serve yourself without any hesitation."
        />

        <div className="relative">
          {groups.length > 1 && (
            <>
              <button
                onClick={() => { goPrev(); pauseThenResume(); }}
                aria-label="Previous review"
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-brand-warm-gray flex items-center justify-center text-brand-brown hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => { goNext(); pauseThenResume(); }}
                aria-label="Next review"
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-brand-warm-gray flex items-center justify-center text-brand-brown hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left — dish visual */}
            <AnimatePresence mode="wait">
              {active && <ReviewDishVisual key={active.groupId} items={active.items} />}
            </AnimatePresence>

            {/* Right — quote + reviewer row */}
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.groupId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <Quote className="w-8 h-8 text-brand-orange/40" />

                  {/* Dish names being reviewed */}
                  <p className="font-sans text-xs font-semibold tracking-widest uppercase text-brand-orange">
                    {active.items.map((i) => i.itemName).join(" · ")}
                  </p>

                  <p className="font-serif text-xl md:text-2xl text-brand-brown leading-relaxed">
                    &ldquo;{active.comment || "A wonderful experience — highly recommended!"}&rdquo;
                  </p>

                  {/* Per-item stars */}
                  <div className="space-y-1.5">
                    {active.items.map((item) => (
                      <div key={item.itemName} className="flex items-center gap-2">
                        <span className="font-sans text-xs text-brand-brown-mid w-32 truncate">{item.itemName}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={
                                idx < item.rating
                                  ? "w-3.5 h-3.5 fill-amber-400 text-amber-400"
                                  : "w-3.5 h-3.5 text-brand-warm-gray"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="font-sans text-sm font-semibold text-brand-brown">{active.customerName}</p>

                  {/* Avatar dot row — click to switch review */}
                  <div className="flex items-center gap-2 pt-2">
                    {avatarDots.map((g, i) => (
                      <button
                        key={g.groupId}
                        onClick={() => { setActiveIndex(i); pauseThenResume(); }}
                        className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                          i === activeIndex ? "border-brand-orange scale-110" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                        aria-label={`Show review from ${g.customerName}`}
                      >
                        {g.customerAvatar ? (
                          <Image src={g.customerAvatar} alt={g.customerName} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-brand-warm-gray flex items-center justify-center font-sans text-xs font-bold text-brand-brown-mid">
                            {g.customerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
