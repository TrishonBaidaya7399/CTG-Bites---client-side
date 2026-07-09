"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "Missing unsubscribe link.");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/newsletter/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data.error ?? "Could not unsubscribe.");
          return;
        }
        setStatus("success");
        setMessage("You've been unsubscribed from CTG Bites emails.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error — could not unsubscribe.");
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {status === "loading" ? (
          <>
            <Loader2 className="w-10 h-10 text-brand-orange animate-spin mx-auto mb-5" />
            <p className="font-sans text-sm text-brand-brown-mid">Unsubscribing…</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="w-20 h-20 bg-brand-green-herb/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-brand-green-herb" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-brand-brown mb-2">Unsubscribed</h1>
            <p className="font-sans text-sm text-brand-brown-mid mb-6">{message}</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-brand-brown mb-2">Something went wrong</h1>
            <p className="font-sans text-sm text-brand-brown-mid mb-6">{message}</p>
          </>
        )}
        <Link href="/" className="font-sans text-sm font-semibold text-brand-orange hover:underline">
          Back to CTG Bites
        </Link>
      </div>
    </div>
  );
}
