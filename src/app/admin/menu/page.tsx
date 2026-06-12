"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Pencil, X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { menuItems as staticMenuItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type MenuItem = typeof staticMenuItems[0] & { available?: boolean };

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(
    staticMenuItems.map((i) => ({ ...i, available: true }))
  );
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<MenuItem | null>(null);
  // imagePreview holds a local object URL while the user has picked a file
  // but the real API hasn't been called yet — on save we'd upload the file
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openEdit(item: MenuItem) {
    setEditItem(item);
    setDraft({ ...item });
    setImagePreview(null);
    setImageFile(null);
  }

  function closeEdit() {
    setEditItem(null);
    setDraft(null);
    setImagePreview(null);
    setImageFile(null);
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    // When API is wired: upload file here → get back URL → setDraft image
    setDraft((d) => d ? { ...d, image: url } : d);
  }

  function saveEdit() {
    if (!draft) return;
    // When API is ready: if imageFile is set, POST to /api/upload first,
    // then PATCH /api/menu/[id] with returned image URL + other fields.
    setItems((prev) => prev.map((i) => i.id === draft.id ? { ...draft } : i));
    closeEdit();
  }

  function toggleAvailable(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, available: !i.available } : i));
  }

  const currentImage = imagePreview ?? draft?.image;

  return (
    <div className="space-y-5">
      {/* shadcn Dialog for editing */}
      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) closeEdit(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-brand-brown">Edit Menu Item</DialogTitle>
          </DialogHeader>

          {draft && (
            <div className="space-y-4 py-2">
              {/* ── Image upload ── */}
              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                  Item Image
                </label>

                {/* Preview */}
                <div
                  className={cn(
                    "relative w-full h-40 rounded-2xl overflow-hidden bg-brand-warm-gray border-2 border-dashed transition-colors cursor-pointer group",
                    imagePreview ? "border-brand-orange" : "border-brand-warm-gray hover:border-brand-orange/50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {currentImage ? (
                    <>
                      <Image
                        src={currentImage}
                        alt={draft.name}
                        fill
                        sizes="400px"
                        className="object-cover"
                        unoptimized={!!imagePreview}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="font-sans text-xs text-white font-semibold">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-brown-mid">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="font-sans text-xs">Click to upload image</span>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="hidden"
                  onChange={handleImagePick}
                />

                {/* File name + clear */}
                {imageFile && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-sans text-xs text-brand-brown-mid truncate flex-1">{imageFile.name}</span>
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setDraft((d) => d ? { ...d, image: editItem!.image } : d);
                      }}
                      className="text-brand-brown-mid hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="font-sans text-xs text-brand-brown-mid mt-1.5 opacity-70">
                  PNG, JPG, WebP or AVIF. Image will be saved when API is connected.
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
                    value={(draft as Record<string, unknown>)[key] as string ?? ""}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, [key]: type === "number" ? Number(e.target.value) : e.target.value } : d
                      )
                    }
                    className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
              ))}

              {/* Description */}
              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => d ? { ...d, description: e.target.value } : d)}
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
                      checked={(draft as Record<string, unknown>)[key] as boolean}
                      onChange={(e) => setDraft((d) => d ? { ...d, [key]: e.target.checked } : d)}
                      className="w-4 h-4 accent-brand-orange rounded"
                    />
                    <span className="font-sans text-sm text-brand-brown">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button onClick={closeEdit} variant="outline" className="flex-1 rounded-full">
              Cancel
            </Button>
            <Button onClick={saveEdit} className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Menu grid ── */}
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
            <div className="relative h-36 bg-brand-warm-gray">
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
                  onClick={() => toggleAvailable(item.id)}
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
    </div>
  );
}
