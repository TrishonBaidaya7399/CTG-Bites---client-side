"use client";
import React from "react";
import { motion, type Variants, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

/** Items that orbit around the central hero food image */
const orbitItems = [
  { src: "/images/menu/kala-bhuna.png",    alt: "Kala Bhuna",     label: "Kala Bhuna",    size: 80, startAngle: 0   },
  { src: "/images/menu/mezbani-dal.png",   alt: "Mezbani Dal",    label: "Mezbani Dal",   size: 72, startAngle: 72  },
  { src: "/images/menu/shutki-bhorta.png", alt: "Shutki Bhorta",  label: "Shutki Bhorta", size: 72, startAngle: 144 },
  { src: "/images/menu/borhani.webp",      alt: "Borhani",        label: "Borhani",       size: 68, startAngle: 216 },
  { src: "/images/menu/mishti-doi.png",    alt: "Mishti Doi",     label: "Mishti Doi",    size: 70, startAngle: 288 },
];

export function HeroSection() {
  // Scroll-driven rotation: scrollY 0→1000px maps to 0→360deg (clockwise).
  // Scrolling back up naturally reverses direction because useTransform is bidirectional.
  const { scrollY } = useScroll();
  const rawRotate = useTransform(scrollY, [0, 1000], [0, 360]);
  // Spring smoothing so fast scrolls don't feel jerky
  const scrollRotate = useSpring(rawRotate, { stiffness: 60, damping: 20, mass: 0.5 });

  // Slight scale boost as the page loads (enters viewport from scroll = 0)
  const rawScale = useTransform(scrollY, [0, 300], [1, 0.88]);
  const scrollScale = useSpring(rawScale, { stiffness: 80, damping: 25 });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-cream pt-16 pb-16 md:pb-8">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle, #C4B8A8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Warm radial glow behind the food image */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-brand-orange/6 blur-3xl pointer-events-none hidden md:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="flex flex-col md:grid md:grid-cols-2 md:items-center md:gap-8 md:py-12">

          {/* ── Right: orbiting food visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="relative flex justify-center items-center order-1 md:order-2
                       w-full h-90 md:h-155 mb-2 md:mb-0 overflow-hidden md:overflow-visible"
          >
            {/* Orbit rings */}
            <div
              className="absolute rounded-full border border-dashed border-brand-orange/20 hidden sm:block"
              style={{ width: 460, height: 460 }}
            />
            <div
              className="absolute rounded-full border border-dashed border-brand-brown/10 hidden sm:block"
              style={{ width: 360, height: 360 }}
            />
            {/* Smaller orbit rings for mobile */}
            <div
              className="absolute rounded-full border border-dashed border-brand-orange/20 sm:hidden"
              style={{ width: 280, height: 280 }}
            />
            <div
              className="absolute rounded-full border border-dashed border-brand-brown/10 sm:hidden"
              style={{ width: 220, height: 220 }}
            />

            {/* Orbiting food items — smaller radius on mobile */}
            {orbitItems.map((item, i) => (
              <OrbitItem
                key={item.alt}
                src={item.src}
                alt={item.alt}
                label={item.label}
                size={110}
                orbitRadius={230}
                mobileOrbitRadius={130}
                mobileSize={72}
                startAngle={item.startAngle}
                duration={22 + i * 3}
                delay={i * 0.3}
              />
            ))}

            {/* Central hero plate — outer: float animation; inner: scroll-driven rotate+scale */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <motion.div
                style={{
                  rotate: scrollRotate,
                  scale: scrollScale,
                  filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.18))",
                }}
              >
                <Image
                  src="/images/hero-food.png"
                  alt="Authentic Chittagong cuisine"
                  width={420}
                  height={420}
                  className="w-36 sm:w-64 md:w-96 lg:w-105"
                  priority
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Left: copy ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 md:order-1 text-center md:text-left"
          >
            <motion.p
              variants={itemVariants}
              className="font-sans text-xs md:text-sm font-semibold tracking-widest uppercase text-brand-orange mb-3 md:mb-4"
            >
              Est. 2015 — Chittagong
            </motion.p>
            <motion.h1
              variants={itemVariants}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-brown leading-[1.05] mb-3 md:mb-4"
            >
              Take a taste<br />
              <span className="italic">Come join us.</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="font-serif text-lg md:text-xl text-brand-brown-mid italic mb-2 md:mb-3"
            >
              Bold flavours. Real roots. CTG pride.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="font-sans text-sm text-brand-brown-mid leading-relaxed max-w-sm mx-auto md:mx-0 mb-6 md:mb-8"
            >
              From Karnafuli riverbanks to your table — we bring the bold, smoky,
              slow-cooked soul of Chittagong cuisine into every single bite.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center md:justify-start gap-4"
            >
              <Link href="/menu">
                <Button className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-7 py-5 md:px-8 md:py-6 text-sm font-semibold shadow-lg transition-all active:scale-95">
                  Explore Menu
                </Button>
              </Link>
              <Link
                href="/recipes"
                className="font-sans text-sm text-brand-brown-mid hover:text-brand-orange transition-colors underline underline-offset-4"
              >
                View Recipes →
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ── Orbit item: rotates around center, counter-rotates image to stay upright ── */
interface OrbitItemProps {
  src: string;
  alt: string;
  label: string;
  size: number;
  orbitRadius: number;
  mobileOrbitRadius: number;
  mobileSize: number;
  startAngle: number;
  duration: number;
  delay: number;
}

function OrbitItem({ src, alt, label, size, orbitRadius, mobileOrbitRadius, mobileSize, startAngle, duration, delay }: OrbitItemProps) {
  // Use CSS custom properties passed via inline style to swap values at each breakpoint
  const halfSize = size / 2;
  const mobileHalfSize = mobileSize / 2;

  return (
    <motion.div
      className="absolute sm:[--orbit-r:0px]"
      style={{
        width: `var(--item-size, ${mobileSize}px)`,
        height: `var(--item-size, ${mobileSize}px)`,
        top: "50%",
        left: "50%",
        marginTop: `var(--item-half, -${mobileHalfSize}px)`,
        marginLeft: `var(--item-half, -${mobileHalfSize}px)`,
        transformOrigin: "center center",
      } as React.CSSProperties}
      animate={{ rotate: [startAngle, startAngle + 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        animate={{ rotate: [-startAngle, -(startAngle + 360)] }}
        transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        className="flex flex-col items-center gap-1"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          marginTop: -mobileHalfSize,
          marginLeft: -mobileHalfSize,
          translateX: mobileOrbitRadius,
        } as React.CSSProperties}
      >
        {/* Mobile sizing */}
        <div
          className="rounded-full overflow-hidden shadow-xl border-2 border-white sm:hidden"
          style={{ width: mobileSize, height: mobileSize }}
        >
          <Image src={src} alt={alt} width={mobileSize} height={mobileSize} className="w-full h-full object-cover" />
        </div>
        <span
          className="font-sans font-semibold text-brand-brown bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm whitespace-nowrap sm:hidden"
          style={{ fontSize: 8 }}
        >
          {label}
        </span>
      </motion.div>

      {/* Desktop sizing (sm+) */}
      <motion.div
        animate={{ rotate: [-startAngle, -(startAngle + 360)] }}
        transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        className="hidden sm:flex flex-col items-center gap-1"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          marginTop: -halfSize,
          marginLeft: -halfSize,
          translateX: orbitRadius,
        } as React.CSSProperties}
      >
        <div
          className="rounded-full overflow-hidden shadow-xl border-2 border-white"
          style={{ width: size, height: size }}
        >
          <Image src={src} alt={alt} width={size} height={size} className="w-full h-full object-cover" />
        </div>
        <span
          className="font-sans font-semibold text-brand-brown bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm whitespace-nowrap"
          style={{ fontSize: 9 }}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}
