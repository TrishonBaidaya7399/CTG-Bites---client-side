"use client";
import { useCartStore } from "@/store/cart";
import { MenuItemDetailView, type MenuItemDetail, type AppetizerOption } from "@/components/menu/MenuItemDetailView";

export type { MenuItemDetail, AppetizerOption };

export function MenuItemDetailClient({ item, appetizers }: { item: MenuItemDetail; appetizers: AppetizerOption[] }) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAddBundle(selected: AppetizerOption[]) {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    selected.forEach((a) => addItem({ id: a.id, name: a.name, price: a.price, image: a.image }));
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <MenuItemDetailView item={item} appetizers={appetizers} onAddBundle={handleAddBundle} />
      </div>
    </div>
  );
}
