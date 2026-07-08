"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not process request.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full bg-brand-green-herb/15 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-brand-green-herb" />
        </div>
        <p className="text-sm text-brand-cream/70">
          If an account exists for <strong className="text-white">{email}</strong>, a reset link has been sent.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-semibold tracking-widest uppercase text-brand-cream/50">
          Email
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30 group-focus-within:text-brand-orange transition-colors">
            <Mail className="w-4 h-4" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={cn(
              "w-full bg-white/5 border rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-brand-cream/20",
              "outline-none transition-all duration-200",
              "focus:bg-white/8 focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20",
              error ? "border-red-500/60 ring-2 ring-red-500/20" : "border-white/10 hover:border-white/20"
            )}
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all",
          "bg-brand-orange hover:bg-brand-orange-light text-white",
          "shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
      </motion.button>
    </form>
  );
}
