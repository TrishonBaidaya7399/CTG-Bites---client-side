"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating?: number;
  reviews?: number;
  badge?: string | null;
  description: string;
  image: string;
  imagePublicId?: string;
  isVeg?: boolean;
  isSpicy?: boolean;
  available: boolean;
  appetizers?: string[];
}

interface ApiAppetizer {
  id: string;
  name: string;
  category: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const EMPTY_DRAFT: MenuItem = {
  id: "",
  name: "",
  category: "",
  price: 0,
  badge: "",
  description: "",
  image: "",
  imagePublicId: undefined,
  isVeg: false,
  isSpicy: false,
  available: true,
  appetizers: [],
};

function normalizeMenuItem(raw: Record<string, unknown>): MenuItem {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    category: raw.category as string,
    price: raw.price as number,
    rating: raw.rating as number | undefined,
    reviews: raw.reviews as number | undefined,
    badge: (raw.badge as string | null) ?? null,
    description: (raw.description as string) ?? "",
    image: raw.image as string,
    imagePublicId: raw.imagePublicId as string | undefined,
    isVeg: raw.isVeg as boolean | undefined,
    isSpicy: raw.isSpicy as boolean | undefined,
    available: (raw.available as boolean) ?? true,
    appetizers: Array.isArray(raw.appetizers)
      ? (raw.appetizers as unknown[]).map((a) => (typeof a === "string" ? a : ((a as Record<string, unknown>)._id as string)))
      : [],
  };
}

export default function AdminMenuPage() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [appetizers, setAppetizers] = useState<ApiAppetizer[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuItem>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [menuRes, appetizerRes, catRes] = await Promise.all([
          fetch("/api/menu?includeUnavailable=true", {
            headers: { Authorization: `Bearer ${adminAccessToken}` },
            cache: "no-store",
          }),
          fetch("/api/appetizers?includeUnavailable=true", {
            headers: { Authorization: `Bearer ${adminAccessToken}` },
            cache: "no-store",
          }),
          fetch("/api/categories?kind=menu", { cache: "no-store" }),
        ]);
        const menuData = await menuRes.json();
        const appetizerData = await appetizerRes.json();
        const catData = await catRes.json();

        if (cancelled) return;

        if (menuRes.ok && menuData.success) {
          setItems((menuData.data ?? []).map(normalizeMenuItem));
        } else {
          setLoadError(menuData.error ?? "Failed to load menu items.");
        }

        if (appetizerRes.ok && appetizerData.success) {
          setAppetizers((appetizerData.data ?? []).map((raw: Record<string, unknown>) => ({
            id: (raw._id ?? raw.id) as string,
            name: raw.name as string,
            category: raw.category as string,
          })));
        }

        if (catRes.ok && catData.success) {
          setCategories((catData.categories ?? []).map((raw: Record<string, unknown>) => ({
            id: (raw._id ?? raw.id) as string,
            name: raw.name as string,
            slug: raw.slug as string,
          })));
        }
      } catch {
        if (!cancelled) setLoadError("Network error loading menu items.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminAccessToken]);

  function openCreate() {
    setEditId(null);
    setDraft(EMPTY_DRAFT);
    setSaveError("");
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditId(item.id);
    setDraft({ ...item });
    setSaveError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditId(null);
    setDraft(EMPTY_DRAFT);
    setSaveError("");
  }

  function toggleAppetizerLink(appetizerId: string) {
    setDraft((d) => {
      const current = d.appetizers ?? [];
      const next = current.includes(appetizerId)
        ? current.filter((id) => id !== appetizerId)
        : [...current, appetizerId];
      return { ...d, appetizers: next };
    });
  }

  async function handleSave() {
    if (!adminAccessToken) return;
    if (!draft.name.trim() || !draft.category) {
      setSaveError("Name and category are required.");
      return;
    }
    if (!draft.image) {
      setSaveError("Please upload an image.");
      return;
    }
    if (!draft.description.trim()) {
      setSaveError("Description is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const payload: Record<string, unknown> = {
        name: draft.name,
        category: draft.category,
        price: draft.price,
        badge: draft.badge || null,
        description: draft.description,
        image: draft.image,
        imagePublicId: draft.imagePublicId,
        isVeg: draft.isVeg,
        isSpicy: draft.isSpicy,
        appetizers: draft.appetizers ?? [],
      };

      const url = editId ? `/api/menu/${encodeURIComponent(editId)}` : "/api/menu";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.error ?? "Failed to save menu item.");
        setSaving(false);
        return;
      }
      const saved = normalizeMenuItem(data.data);
      setItems((prev) => (editId ? prev.map((i) => (i.id === editId ? saved : i)) : [saved, ...prev]));
      closeDialog();
    } catch {
      setSaveError("Network error — could not save menu item.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item: MenuItem) {
    if (!adminAccessToken) return;
    const nextAvailable = !item.available;
    // Optimistic
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: nextAvailable } : i)));
    try {
      const res = await fetch(`/api/menu/${encodeURIComponent(item.id)}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ available: nextAvailable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // revert on failure
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: item.available } : i)));
      }
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: item.available } : i)));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-brand-brown">Menu Items</h1>
        <Button onClick={openCreate} size="sm" className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Item
        </Button>
      </div>

      {/* shadcn Dialog for create + edit */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-brand-brown">{editId ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* ── Image upload ── */}
            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                Item Image
              </label>
              <FileUpload
                value={draft.image}
                folder="menu-items"
                onUploaded={({ url, publicId }) =>
                  setDraft((d) => ({ ...d, image: url, imagePublicId: publicId }))
                }
              />
              <p className="font-sans text-xs text-brand-brown-mid mt-1.5 opacity-70">
                PNG, JPG, WebP or AVIF, up to 10MB.
              </p>
            </div>

            {/* ── Text fields ── */}
            {[
              { label: "Name",       key: "name",  type: "text"   },
              { label: "Price (৳)",  key: "price", type: "number" },
              { label: "Badge",      key: "badge", type: "text"   },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={(draft as unknown as Record<string, unknown>)[key] as string ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [key]: type === "number" ? Number(e.target.value) : e.target.value }))
                  }
                  className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            ))}

            {/* Category */}
            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                disabled={!!editId}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {editId && (
                <p className="font-sans text-xs text-brand-brown-mid mt-1.5 opacity-70">
                  Category can&apos;t be changed after creation.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              {[
                { label: "Vegetarian", key: "isVeg"   },
                { label: "Spicy",      key: "isSpicy" },
              ].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(draft as unknown as Record<string, unknown>)[key] as boolean}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-brand-orange rounded"
                  />
                  <span className="font-sans text-sm text-brand-brown">{label}</span>
                </label>
              ))}
            </div>

            {/* Linked appetizers */}
            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                Linked Appetizers
              </label>
              {appetizers.length === 0 ? (
                <p className="font-sans text-xs text-brand-brown-mid opacity-70">No appetizers created yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {appetizers.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer bg-brand-warm-gray/30 rounded-lg px-2.5 py-2">
                      <input
                        type="checkbox"
                        checked={(draft.appetizers ?? []).includes(a.id)}
                        onChange={() => toggleAppetizerLink(a.id)}
                        className="w-3.5 h-3.5 accent-brand-orange rounded shrink-0"
                      />
                      <span className="font-sans text-xs text-brand-brown truncate">{a.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {saveError && (
              <p className="text-xs text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button onClick={closeDialog} variant="outline" className="flex-1 rounded-full">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full disabled:opacity-60">
              {saving ? "Saving..." : editId ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loadError && (
        <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{loadError}</p>
      )}

      {loading ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">Loading menu items…</p>
      ) : items.length === 0 ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">No menu items yet.</p>
      ) : (
        /* ── Menu grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={cn(
                "bg-white rounded-2xl shadow-sm border border-brand-warm-gray overflow-hidden",
                !item.available && "opacity-50"
              )}
            >
              <div className="relative aspect-square bg-brand-warm-gray">
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" unoptimized />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="font-sans font-bold text-white text-sm">Unavailable</span>
                  </div>
                )}
                {item.badge && (
                  <span className="absolute top-2 left-2 bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif font-bold text-brand-brown text-sm leading-tight">{item.name}</p>
                  <span className="font-sans font-bold text-brand-orange text-sm shrink-0">৳{item.price}</span>
                </div>
                <p className="font-sans text-xs text-brand-brown-mid line-clamp-2">{item.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEdit(item)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-brand-warm-gray text-brand-brown rounded-xl text-xs flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    onClick={() => toggleAvailable(item)}
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-xl text-xs",
                      item.available
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-brand-green-herb text-white hover:bg-brand-green-herb/90"
                    )}
                  >
                    {item.available ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
