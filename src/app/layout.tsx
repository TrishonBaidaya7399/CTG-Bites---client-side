import type { Metadata } from "next";
import { Playfair_Display, Inter, Italianno, Courgette } from "next/font/google";
import "./globals.css";
import { ConditionalShell } from "@/components/layout/ConditionalShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Client-site-only decorative fonts for section headings/subheadings — never used
// in the admin panel (SectionHeading, the only consumer, isn't rendered there).
const italianno = Italianno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italianno",
  display: "swap",
});

const courgette = Courgette({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-courgette",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ctgbites.com"),
  title: {
    default: "CTG Bites | Authentic Chittagong Cuisine — Mezzban, Kala Bhuna & More",
    template: "%s | CTG Bites",
  },
  description:
    "CTG Bites — Chittagong's home of authentic Bengali cuisine. Slow-cooked Kala Bhuna, legendary Mezzban feasts, Shutki Bhorta, Ilish Paturi & Mishti Doi. Order online or dine at GEC Circle, Nasirabad.",
  keywords: [
    "CTG Bites",
    "Chittagong restaurant",
    "Chattogram restaurant",
    "authentic Bengali cuisine",
    "Mezzban",
    "Kala Bhuna",
    "Shutki Bhorta",
    "Ilish Paturi",
    "Bangladeshi food",
    "Bengali restaurant",
    "food delivery Chittagong",
    "order food online Chittagong",
  ],
  authors: [{ name: "CTG Bites Restaurant" }],
  creator: "CTG Bites",
  publisher: "CTG Bites",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ctgbites.com",
    siteName: "CTG Bites",
    title: "CTG Bites | Authentic Chittagong Cuisine",
    description: "Slow-cooked Kala Bhuna, legendary Mezzban feasts & more. The real taste of Chittagong.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "CTG Bites Restaurant" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ctgbites",
    creator: "@ctgbites",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/images/logo-icon.png", sizes: "180x180" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${italianno.variable} ${courgette.variable}`}>
      <body>
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
