import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthScene } from "@/components/auth/AuthScene";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to CTG Bites to place orders for authentic Chittagong cuisine — Mezzban, Kala Bhuna, Bhorta, and more. Fast delivery across Chittagong.",
  keywords: [
    "CTG Bites login",
    "sign in Chittagong restaurant",
    "order Bengali food online",
    "restaurant account login",
    "CTG Bites account",
    "food delivery login Chittagong",
  ],
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 md:py-16">
      <AuthScene />

      <AuthCard className="relative z-10 w-full max-w-md">
        <div className="px-5 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">
          {/* Brand mark */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image src="/images/logo-wordmark.png" alt="CTG Bites" width={140} height={36} />
            </Link>
            <p className="mt-1 text-xs font-semibold tracking-[0.2em] uppercase text-brand-orange">
              Est. 2015 — Chittagong
            </p>
            <div className="mt-6">
              <h1 className="font-serif text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-brand-cream/50">Sign in to place your order</p>
            </div>
          </div>

          <LoginForm />

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-brand-cream/30">New to CTG Bites?</span>
            </div>
          </div>

          <Link
            href="/register"
            className="block w-full text-center py-3 rounded-xl border border-white/10 text-sm text-brand-cream/60 hover:border-brand-orange/40 hover:text-brand-orange transition-all"
          >
            Create an account →
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
