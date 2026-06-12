"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TimerModal } from "@/components/order/TimerModal";
import { OrderSyncProvider } from "@/components/order/OrderSyncProvider";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="pb-28 md:pb-0">{children}</main>
      <Footer />
      <TimerModal />
      <OrderSyncProvider />
    </>
  );
}
