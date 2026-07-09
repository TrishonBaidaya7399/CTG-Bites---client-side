"use client";
import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { googleLoginAction } from "@/app/(auth)/actions";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton() {
  const buttonId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scriptReady || !CLIENT_ID || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        setPending(true);
        setError("");
        const result = await googleLoginAction(response.credential);
        if (result?.error) {
          setError(result.error);
          setPending(false);
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: "320",
      shape: "pill",
      text: "continue_with",
    });
  }, [scriptReady]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className="flex items-center gap-3 text-xs text-brand-cream/30">
        <span className="flex-1 h-px bg-white/10" />
        or
        <span className="flex-1 h-px bg-white/10" />
      </div>
      <div className="flex justify-center min-h-10">
        {pending ? (
          <div className="flex items-center gap-2 text-brand-cream/60 text-sm py-2.5">
            <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
          </div>
        ) : (
          <div id={buttonId} ref={containerRef} />
        )}
      </div>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}
