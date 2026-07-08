import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthScene } from "@/components/auth/AuthScene";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your CTG Bites account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 md:py-16">
      <AuthScene />

      <AuthCard className="relative z-10 w-full max-w-md">
        <div className="px-5 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">
          {/* Brand mark */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo-wordmark.png"
                alt="CTG Bites"
                width={130}
                height={34}
                className="md:w-40 md:h-auto"
                priority
              />
            </Link>
            <p className="mt-1 text-xs font-semibold tracking-[0.2em] uppercase text-brand-orange">
              Est. 2015 — Chittagong
            </p>
            <div className="mt-6">
              <h1 className="font-serif text-2xl font-bold text-white">Reset your password</h1>
              <p className="mt-1 text-sm text-brand-cream/50">Choose a new password below</p>
            </div>
          </div>

          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              This reset link is missing or invalid. Please request a new one.
            </p>
          )}

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
          </div>

          <Link
            href="/forgot-password"
            className="block w-full text-center py-3 rounded-xl border border-white/10 text-sm text-brand-cream/60 hover:border-brand-orange/40 hover:text-brand-orange transition-all"
          >
            Request a new link →
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
