"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerAction } from "@/app/(auth)/actions";

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  toggle?: { show: boolean; onToggle: () => void };
  autoComplete?: string;
}

function AuthField({ id, label, type = "text", placeholder, icon, value, onChange, error, toggle, autoComplete }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold tracking-widest uppercase text-brand-cream/50">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30 group-focus-within:text-brand-orange transition-colors">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={toggle ? (toggle.show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={cn(
            "w-full bg-white/5 border rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-brand-cream/20",
            "outline-none transition-all duration-200",
            "focus:bg-white/8 focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20",
            error
              ? "border-red-500/60 ring-2 ring-red-500/20"
              : "border-white/10 hover:border-white/20"
          )}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle.onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-cream/30 hover:text-brand-orange transition-colors"
          >
            {toggle.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RegisterForm() {
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCo, setShowCo]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())            e.name     = "Full name is required";
    if (!email)                  e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password)               e.password = "Password is required";
    else if (password.length < 6)e.password = "At least 6 characters";
    if (confirm !== password)    e.confirm  = "Passwords don't match";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const data = new FormData();
    data.set("name", name);
    data.set("email", email);
    data.set("phone", phone);
    data.set("password", password);

    startTransition(async () => {
      const result = await registerAction(data);
      if (result?.error) setErrors({ form: result.error });
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AuthField
          id="name"
          label="Full Name"
          placeholder="Your name"
          icon={<User className="w-4 h-4" />}
          value={name}
          onChange={setName}
          error={errors.name}
          autoComplete="name"
        />
        <AuthField
          id="phone"
          label="Phone (optional)"
          type="tel"
          placeholder="+880 1xxx-xxxxxx"
          icon={<Phone className="w-4 h-4" />}
          value={phone}
          onChange={setPhone}
          error={errors.phone}
          autoComplete="tel"
        />
      </div>
      <AuthField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="w-4 h-4" />}
        value={email}
        onChange={setEmail}
        error={errors.email}
        autoComplete="email"
      />
      <AuthField
        id="password"
        label="Password"
        placeholder="Min. 6 characters"
        icon={<Lock className="w-4 h-4" />}
        value={password}
        onChange={setPassword}
        error={errors.password}
        toggle={{ show: showPw, onToggle: () => setShowPw(!showPw) }}
        autoComplete="new-password"
      />
      <AuthField
        id="confirm"
        label="Confirm Password"
        placeholder="Repeat password"
        icon={<Lock className="w-4 h-4" />}
        value={confirm}
        onChange={setConfirm}
        error={errors.confirm}
        toggle={{ show: showCo, onToggle: () => setShowCo(!showCo) }}
        autoComplete="new-password"
      />

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
        disabled={isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all",
          "bg-brand-orange hover:bg-brand-orange-light text-white",
          "shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>Create Account <ArrowRight className="w-4 h-4" /></>
        )}
      </motion.button>

      <p className="text-center text-xs text-brand-cream/30">
        By registering you agree to our{" "}
        <Link href="/terms" className="text-brand-orange hover:underline">Terms</Link>
        {" & "}
        <Link href="/privacy" className="text-brand-orange hover:underline">Privacy Policy</Link>
      </p>
    </form>
  );
}
