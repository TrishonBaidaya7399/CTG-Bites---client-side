import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign In | CTG Bites",
    template: "%s | CTG Bites",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-brown flex items-center justify-center overflow-hidden">
      {children}
    </div>
  );
}
