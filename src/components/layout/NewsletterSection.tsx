"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.error ?? "Could not subscribe. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("You're subscribed! Check your inbox for your first recipe soon.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error — could not subscribe.");
    }
  }

  return (
    <section className="relative bg-white overflow-hidden py-20 md:py-28">
      {/* Decorative floating ingredients — hidden on mobile to avoid clutter, per reference layout */}
      <motion.div
        className="absolute left-6 top-8 w-20 md:w-28 opacity-90 pointer-events-none hidden sm:block"
        animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/images/newsletter section/onion.webp" alt="" width={120} height={120} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute left-24 md:left-40 top-24 w-16 md:w-20 opacity-80 pointer-events-none hidden md:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Image src="/images/newsletter section/red chili.png" alt="" width={80} height={80} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute right-8 top-10 w-14 md:w-20 opacity-90 pointer-events-none hidden sm:block"
        animate={{ y: [0, -14, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Image src="/images/newsletter section/lemon.webp" alt="" width={120} height={120} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute right-4 top-32 w-42 md:w-50 opacity-90 pointer-events-none hidden md:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <Image src="/images/newsletter section/pen with broccoli.webp" alt="" width={220} height={220} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute left-10 bottom-6 w-20 md:w-26 opacity-85 pointer-events-none hidden sm:block"
        animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <Image src="/images/newsletter section/letus pata.png" alt="" width={100} height={100} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute right-20 bottom-4 w-20 md:w-28 opacity-85 pointer-events-none hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <Image src="/images/newsletter section/onion slice.webp" alt="" width={100} height={100} className="w-full h-auto" />
      </motion.div>

      <motion.div
        className="absolute right-1/3 bottom-10 w-18 md:w-24 opacity-80 pointer-events-none hidden lg:block"
        animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <Image src="/images/newsletter section/red-chili-powder.webp" alt="" width={80} height={80} className="w-full h-auto" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 text-center">
        <h2 className="font-serif text-2xl md:text-4xl font-bold text-brand-brown leading-tight mb-3">
          Easy recipes will send to your inbox
        </h2>
        <p className="font-sans text-sm md:text-base text-brand-brown-mid mb-8">
          Get weekly updates on the newest Chittagong recipes in your mailbox!
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your email address"
            className="flex-1 font-sans text-sm bg-white border border-brand-warm-gray rounded-full px-5 py-3.5 outline-none focus:border-brand-orange transition-colors shadow-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-8 py-3.5 font-sans text-sm font-semibold shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
          >
            {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 font-sans text-sm ${status === "success" ? "text-brand-green-herb" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
