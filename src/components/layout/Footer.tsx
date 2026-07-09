import Link from "next/link";
import Image from "next/image";
import { NewsletterSection } from "@/components/layout/NewsletterSection";

const FOOTER_COLUMNS = [
  {
    title: "Get Cooking",
    links: [
      { label: "Full Menu", href: "/menu" },
      { label: "Recipes", href: "/recipes" },
      { label: "Order Online", href: "/order" },
      { label: "Dine In", href: "/table-order" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "About", href: "/#about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Follow Us",
    links: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" },
      { label: "Twitter", href: "https://twitter.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-brand-cream">
      <NewsletterSection />

      <div className="relative border-t border-brand-warm-gray/60 py-14 overflow-hidden">
        {/* Decorative onion + spice cluster, bottom-right, matches reference layout */}
        <div className="absolute right-6 bottom-2 w-32 md:w-40 opacity-90 pointer-events-none hidden sm:block">
          <Image
            src="/images/newsletter section/onion slice.webp"
            alt=""
            width={200}
            height={200}
            className="w-full h-auto"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-serif font-bold text-brand-brown mb-4 text-sm md:text-base">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-sans text-sm text-brand-brown-mid hover:text-brand-orange transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-brand-warm-gray/60 text-xs text-center text-brand-brown-mid">
          © {new Date().getFullYear()} CTG Bites Restaurant. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
