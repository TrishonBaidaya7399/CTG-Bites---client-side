import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiUrl } from "@/lib/api";
import { MenuItemDetailClient, type MenuItemDetail, type AppetizerOption } from "@/components/menu/MenuItemDetailClient";

export const revalidate = 120;

interface RawMenuItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  rating?: number;
  reviews?: number;
  badge?: string | null;
  description: string;
  image: string;
  isVeg?: boolean;
  isSpicy?: boolean;
  ingredients?: string[];
  appetizers?: RawAppetizer[];
}

interface RawAppetizer {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

async function getMenuItem(id: string): Promise<RawMenuItem | null> {
  const res = await fetch(apiUrl(`/api/menu/${encodeURIComponent(id)}`), { next: { revalidate: 120 } });
  if (!res.ok) return null;
  const body = await res.json();
  return body.item ?? body.data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getMenuItem(id);
  if (!item) return { title: "Menu Item Not Found" };

  return {
    title: `${item.name} — CTG Bites`,
    description: item.description,
    openGraph: {
      title: `${item.name} | CTG Bites`,
      description: item.description,
      images: [{ url: item.image, width: 1200, height: 630, alt: item.name }],
    },
  };
}

export default async function MenuItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await getMenuItem(id);
  if (!raw) notFound();

  const item: MenuItemDetail = {
    id: (raw._id ?? raw.id) as string,
    name: raw.name,
    category: raw.category,
    price: raw.price,
    rating: raw.rating,
    reviews: raw.reviews,
    badge: raw.badge,
    description: raw.description,
    image: raw.image,
    isVeg: raw.isVeg,
    isSpicy: raw.isSpicy,
    ingredients: raw.ingredients,
  };

  const appetizers: AppetizerOption[] = (raw.appetizers ?? []).map((a) => ({
    id: (a._id ?? a.id) as string,
    name: a.name,
    price: a.price,
    image: a.image,
    description: a.description,
  }));

  return <MenuItemDetailClient item={item} appetizers={appetizers} />;
}
