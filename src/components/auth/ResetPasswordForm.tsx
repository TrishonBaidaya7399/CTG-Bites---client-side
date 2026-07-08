"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2: typeof errors = {};
    if (!password || password.length < 6) e2.password = "Password must be at least 6 characters";
    if (confirm !== password) e2.confirm = "Passwords do not match";
    if (!token) e2.form = "Missing or invalid reset token.";
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors({ form: data.error ?? "Could not reset password." });
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setErrors({ form: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full bg-brand-green-herb/15 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-brand-green-herb" />
        </div>
        <p className="text-sm text-brand-cream/70">Password reset! Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold tracking-widest uppercase text-brand-cream/50">
          New Password
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30 group-focus-within:text-brand-orange transition-colors">
            <Lock className="w-4 h-4" />
          </span>
          <input
            id="password"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={cn(
              "w-full bg-white/5 border rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-brand-cream/20",
              "outline-none transition-all duration-200",
              "focus:bg-white/8 focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20",
              errors.password ? "border-red-500/60 ring-2 ring-red-500/20" : "border-white/10 hover:border-white/20"
            )}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-cream/30 hover:text-brand-orange transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="block text-xs font-semibold tracking-widest uppercase text-brand-cream/50">
          Confirm Password
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30 group-focus-within:text-brand-orange transition-colors">
            <Lock className="w-4 h-4" />
          </span>
          <input
            id="confirm"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className={cn(
              "w-full bg-white/5 border rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-brand-cream/20",
              "outline-none transition-all duration-200",
              "focus:bg-white/8 focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20",
              errors.confirm ? "border-red-500/60 ring-2 ring-red-500/20" : "border-white/10 hover:border-white/20"
            )}
          />
        </div>
        {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
      </div>

      <AnimatePresence>
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center"
          >
            {errors.form}
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
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
      </motion.button>
    </form>
  );
}
