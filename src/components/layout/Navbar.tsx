"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, UtensilsCrossed, BookOpen, ShoppingBag, ConciergeBell, X, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { CartSheet } from "@/components/cart/CartSheet";
import { useOrderStore } from "@/store/orderStore";

const navLinks = [
  { label: "Menu", href: "/menu" },
  { label: "Recipes", href: "/recipes" },
  { label: "Dine In", href: "/table-order" },
  { label: "Order Now", href: "/order" },
];

const bottomTabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Dine In", href: "/table-order", icon: ConciergeBell },
  { label: "Order", href: "/order", icon: ShoppingBag },
  { label: "Recipes", href: "/recipes", icon: BookOpen },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const { activeTableOrder, timerModalMinimized, maximizeTimerModal } = useOrderStore();
  const hasActiveOrder = !!activeTableOrder && timerModalMinimized;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top header — visible on all sizes */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-brand-cream/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-4 md:py-5"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-wordmark.png"
              alt="CTG Bites"
              width={130}
              height={34}
              className="md:w-40 md:h-10"
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "font-sans text-sm transition-colors relative group",
                    pathname === link.href
                      ? "text-brand-orange"
                      : "text-brand-brown-mid hover:text-brand-orange"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-brand-orange transition-all",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Bell — shows when timer is minimized */}
            <button
              onClick={maximizeTimerModal}
              className="relative p-2 text-brand-brown-mid hover:text-brand-orange transition-colors"
              aria-label="Track order"
            >
              <motion.div animate={hasActiveOrder ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.5 }}>
                <Bell className="w-5 h-5" />
              </motion.div>
              {hasActiveOrder && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-orange rounded-full animate-ping" />
              )}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-brand-brown-mid hover:text-brand-orange transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white rounded-full px-6 transition-all"
              >
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger — only shows slide-down with cart & login */}
          <button
            className="md:hidden text-brand-brown p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile slide-down panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-brand-cream/98 backdrop-blur-md border-t border-brand-warm-gray overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col gap-3">
                <button onClick={() => { setMobileOpen(false); setCartOpen(true); }} className="w-full">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-brand-brown-mid">
                    <ShoppingBag className="w-4 h-4" />
                    Cart {itemCount > 0 && <span className="ml-auto bg-brand-orange text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>}
                  </Button>
                </button>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full w-full">
                    Login / Sign Up
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart slide-over */}
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile bottom tab bar — floating pill */}
      <nav className="md:hidden fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
        {/* Outer glow */}
        <div className="absolute inset-x-6 bottom-0 h-14 rounded-full bg-brand-orange/20 blur-xl" />

        {/* Pill container */}
        <div
          className="relative pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full border border-white/30"
          style={{
            background: "rgba(245, 240, 232, 0.55)",
            backdropFilter: "blur(20px) saturate(1.6)",
            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            boxShadow: "0 8px 32px rgba(44, 26, 14, 0.14), 0 2px 8px rgba(232, 98, 42, 0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          {bottomTabs.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-full transition-colors"
              >
                {/* Active/hover background pill */}
                {active && (
                  <motion.div
                    layoutId="tab-active-bg"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "rgba(232, 98, 42, 0.30)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      boxShadow: "0 0 12px rgba(232, 98, 42, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                      border: "2px solid rgba(232, 98, 42, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="relative z-10"
                >
                  <Icon
                    className={cn("w-5 h-5 transition-colors", active ? "text-brand-orange" : "text-brand-brown-mid")}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </motion.div>
                <span className={cn(
                  "relative z-10 text-[10px] font-medium leading-none transition-colors",
                  active ? "text-brand-orange font-semibold" : "text-brand-brown-mid"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
