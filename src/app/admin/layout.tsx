"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Tablet, LogOut, Menu, X, ExternalLink, Bell, FolderTree, Soup, Users, ShieldCheck } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useAdminSound } from "@/hooks/useAdminSound";
import { AdminOrderSyncProvider } from "@/components/order/AdminOrderSyncProvider";
import { cn } from "@/lib/utils";

// Mounted only inside the authenticated shell — keeps sound away from login page and client site
function AdminSoundManager() {
  useAdminSound();
  return null;
}

// `roles` omitted = visible to every authenticated admin role. Mirrors the backend's
// requirePermission gates for users:manage (owner/manager) and the owner-only
// permissions endpoint — a role that can't call the API shouldn't see the nav item.
const navItems = [
  { label: "Dashboard",     href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Online Orders", href: "/admin/orders/online", icon: ShoppingBag },
  { label: "Table Orders",  href: "/admin/orders/table",  icon: Tablet },
  { label: "Menu Items",    href: "/admin/menu",          icon: UtensilsCrossed },
  { label: "Appetizers",    href: "/admin/appetizers",    icon: Soup },
  { label: "Categories",    href: "/admin/categories",    icon: FolderTree },
  { label: "Staff & Roles", href: "/admin/staff",         icon: Users,       roles: ["owner", "manager"] },
  { label: "Permissions",   href: "/admin/permissions",   icon: ShieldCheck, roles: ["owner"] },
  { label: "Settings",      href: "/admin/settings",      icon: Bell },
];

const noop = () => () => {};

// Routes reachable without an authenticated admin session
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/forgot-password"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, adminLogout, adminUser } = useOrderStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // localStorage-persisted state isn't available during SSR/first paint — this only tells us
  // the client has taken over, not that zustand's persist middleware has read localStorage yet.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  // Give the persist middleware's synchronous rehydration (it runs in a useLayoutEffect-like
  // microtask right after mount) one extra tick before trusting isAdminAuthenticated's value.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const isPublicRoute = PUBLIC_ADMIN_ROUTES.includes(pathname);
  const ready = mounted && hydrated;

  useEffect(() => {
    if (!ready) return;
    if (!isAdminAuthenticated && !isPublicRoute) {
      router.replace("/admin/login");
    }
  }, [ready, isAdminAuthenticated, isPublicRoute, router]);

  if (!ready) return null;
  if (!isAdminAuthenticated && !isPublicRoute) return null;
  if (isPublicRoute) return <>{children}</>;

  function handleLogout() {
    adminLogout();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-56 bg-brand-brown text-white flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Image src="/images/logo-icon.png" alt="CTG Bites" width={32} height={32} />
          <div>
            <p className="font-serif font-bold text-sm leading-tight">CTG Bites</p>
            <p className="font-sans text-xs text-brand-orange font-semibold">Admin Panel</p>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(adminUser?.role ?? ""))
            .map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors",
                  active ? "bg-brand-orange text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site + Logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-sans text-sm text-white/60 hover:bg-white/8 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            View Main Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-sans text-sm text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-brand-warm-gray px-4 py-0 flex items-center gap-3 h-14 shrink-0">
          {/* Mobile sidebar toggle */}
          <button className="md:hidden text-brand-brown p-1" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-sans text-xs text-brand-brown-mid hidden sm:block">Admin</span>
            <span className="font-sans text-xs text-brand-brown-mid hidden sm:block">/</span>
            <p className="font-serif font-bold text-brand-brown text-sm truncate">
              {navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Panel"}
            </p>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <span className="font-sans text-xs text-brand-brown-mid hidden md:block">
              {adminUser?.email ?? ""}
            </span>

            {/* Back to site button */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 font-sans text-xs font-semibold text-brand-orange border border-brand-orange/30 bg-brand-orange/5 hover:bg-brand-orange hover:text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Main Site</span>
            </Link>
          </div>
        </header>
        <AdminSoundManager />
        <AdminOrderSyncProvider />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
