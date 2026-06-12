"use client";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingImage } from "@/components/ui/FloatingImage";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-cream pt-20">
      {/* Subtle dot pattern bg */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #C4B8A8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating ingredients — top left */}
      <FloatingImage
        src="/images/ingredients/spice-bowl.png"
        alt="Spice bowl"
        width={160}
        height={160}
        className="top-24 left-4 md:left-12 w-28 md:w-40"
        delay={0}
        amplitude={14}
      />
      <FloatingImage
        src="/images/ingredients/chopsticks.png"
        alt="Chopsticks"
        width={100}
        height={100}
        className="top-14 left-28 md:left-44 w-16 md:w-24"
        delay={0.6}
        amplitude={10}
      />

      {/* Floating ingredients — top right */}
      <FloatingImage
        src="/images/ingredients/tomato-herb.png"
        alt="Tomato with herbs"
        width={140}
        height={140}
        className="top-20 right-4 md:right-16 w-24 md:w-36"
        delay={0.3}
        amplitude={16}
      />

      {/* Floating ingredients — bottom scattered */}
      <FloatingImage
        src="/images/ingredients/pepper-dots.png"
        alt="Pepper"
        width={80}
        height={80}
        className="bottom-32 left-1/3 w-14"
        delay={0.9}
        amplitude={8}
      />
      <FloatingImage
        src="/images/ingredients/basil-sauce.png"
        alt="Basil sauce"
        width={100}
        height={100}
        className="bottom-24 right-1/4 w-20 md:w-28"
        delay={0.2}
        amplitude={12}
      />

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
          <motion.p variants={itemVariants} className="font-serif text-xl text-brand-brown-mid italic mb-3">
            Bold flavours. Real roots. CTG pride.
          </motion.p>
          <motion.p variants={itemVariants} className="font-sans text-sm text-brand-brown-mid leading-relaxed max-w-sm mb-8">
            From Karnafuli riverbanks to your table — we bring the bold, smoky, slow-cooked soul of Chittagong cuisine into every single bite.
          </motion.p>
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <Link href="/menu">
              <Button className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-8 py-6 text-sm font-semibold shadow-lg transition-all">
                Explore Now
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
              src="/images/hero-food.png"
              alt="Authentic Chittagong cuisine"
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
