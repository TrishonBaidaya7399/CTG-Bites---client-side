import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-brown text-brand-cream/80 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <p className="font-serif text-3xl text-white mb-3">ctg-bites</p>
          <p className="text-sm leading-relaxed max-w-xs">
            Bold flavours. Real roots. CTG pride. Handcrafted Chittagong cuisine made with love and tradition.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">Menu</p>
          <ul className="space-y-2 text-sm">
            {["Dumplings", "Recipes", "Food Menu", "Order Now"].map((l) => (
              <li key={l}>
                <Link href="#" className="hover:text-brand-orange transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">Visit Us</p>
          <address className="not-italic text-sm space-y-2">
            <p>GEC Circle, Nasirabad</p>
            <p>Chittagong-4000, Bangladesh</p>
            <p className="mt-3">Mon–Sun: 11am – 10pm</p>
            <p>hello@ctgbites.com</p>
          </address>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 text-xs text-center text-brand-cream/40">
        © {new Date().getFullYear()} CTG Bites Restaurant. All rights reserved.
      </div>
    </footer>
  );
}
