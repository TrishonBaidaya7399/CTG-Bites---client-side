"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const adminLogin = useOrderStore((s) => s.adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function handleLogin() {
    const ok = adminLogin(email, password);
    if (ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid email or password.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-brand-brown flex items-center justify-center px-4">
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Top accent */}
          <div className="h-1.5 bg-linear-to-r from-brand-orange via-brand-orange-light to-brand-orange" />

          <div className="p-8 space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <Image src="/images/logo-icon.png" alt="CTG Bites" width={52} height={52} />
              <p className="font-serif text-xl font-bold text-brand-brown">Admin Panel</p>
              <p className="font-sans text-xs text-brand-brown-mid">CTG Bites Restaurant Management</p>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown-mid" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="admin@ctgbites.com"
                    className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown-mid" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••••"
                    className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-brand-orange transition-colors"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown-mid">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-sans">
                  {error}
                </motion.p>
              )}

              <Button onClick={handleLogin} className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-5 font-semibold shadow-lg">
                Login to Dashboard
              </Button>
            </div>

            <p className="text-center font-sans text-xs text-brand-brown-mid">
              Hint: admin@ctgbites.com / ctgbites2026
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
