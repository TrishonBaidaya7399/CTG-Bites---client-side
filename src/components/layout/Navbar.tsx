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
            {/* Icon logo on mobile, wordmark on desktop */}
            <span className="block md:hidden">
              <Image
                src="/images/logo-icon.png"
                alt="CTG Bites"
                width={38}
                height={38}
              />
            </span>
            <span className="hidden md:block">
              <Image
                src="/images/logo-wordmark.png"
                alt="CTG Bites"
                width={160}
                height={40}
              />
            </span>
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

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-cream/96 backdrop-blur-md border-t border-brand-warm-gray safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {bottomTabs.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-13",
                  active ? "text-brand-orange" : "text-brand-brown-mid"
                )}
              >
                <motion.div
                  animate={active ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                </motion.div>
                <span className={cn("text-xs font-medium leading-none", active && "font-semibold")}>
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
