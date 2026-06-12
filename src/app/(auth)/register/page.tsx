import type { Metadata } from "next";
import Link from "next/link";
import { AuthScene } from "@/components/auth/AuthScene";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a free CTG Bites account to order authentic Chittagong food online — Mezzban feasts, Kala Bhuna, Bhorta, Ilish Paturi, and more delivered to your door.",
  keywords: [
    "CTG Bites register",
    "create account Chittagong restaurant",
    "order Bengali food online account",
    "sign up food delivery Chittagong",
    "new account CTG Bites",
  ],
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-16">
      <AuthScene />

      <AuthCard className="relative z-10 w-full max-w-lg">
        <div className="px-8 pt-10 pb-8">
          {/* Brand mark */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block font-serif text-3xl font-bold text-white tracking-tight hover:text-brand-orange transition-colors">
              ctg-bites
            </Link>
            <p className="mt-1 text-xs font-semibold tracking-[0.2em] uppercase text-brand-orange">
              Est. 2015 — Chittagong
            </p>
            <div className="mt-6">
              <h1 className="font-serif text-2xl font-bold text-white">Create your account</h1>
              <p className="mt-1 text-sm text-brand-cream/50">Start ordering authentic Chittagong cuisine</p>
            </div>
          </div>

          <RegisterForm />

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-brand-cream/30">Already have an account?</span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-3 rounded-xl border border-white/10 text-sm text-brand-cream/60 hover:border-brand-orange/40 hover:text-brand-orange transition-all"
          >
            Sign in instead →
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
