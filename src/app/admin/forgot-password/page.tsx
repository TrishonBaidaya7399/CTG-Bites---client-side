"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
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
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-brown flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="h-1.5 bg-linear-to-r from-brand-orange via-brand-orange-light to-brand-orange" />

        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <Image src="/images/logo-icon.png" alt="CTG Bites" width={52} height={52} />
            <p className="font-serif text-xl font-bold text-brand-brown">Reset Admin Password</p>
            <p className="font-sans text-xs text-brand-brown-mid text-center">
              Enter your admin email and we&apos;ll send a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-full bg-brand-green-herb/15 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-brand-green-herb" />
              </div>
              <p className="font-sans text-sm text-brand-brown-mid">
                If an account exists for <strong className="text-brand-brown">{email}</strong>, a reset link has been sent.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown-mid" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="admin@ctgbites.com"
                    className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-sans">{error}</p>}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-5 font-semibold shadow-lg disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          )}

          <Link href="/admin/login" className="flex items-center justify-center gap-1.5 font-sans text-xs font-semibold text-brand-brown-mid hover:text-brand-orange transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
