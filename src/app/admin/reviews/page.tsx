"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, Check, EyeOff, Trash2, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";
import type { Review, ReviewStatus } from "@/types/review";

const STATUS_TABS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "hidden", label: "Hidden" },
];

const STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  hidden: "bg-gray-100 text-gray-600 border-gray-200",
};

function ReviewCard({ review, onChanged }: { review: Review; onChanged: (r: Review | null) => void }) {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(review.comment ?? "");
  const [busy, setBusy] = useState(false);

  async function setStatus(status: ReviewStatus) {
    if (!adminAccessToken) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) onChanged(data.review);
    } finally {
      setBusy(false);
    }
  }

  async function saveComment() {
    if (!adminAccessToken) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ comment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onChanged(data.review);
        setEditing(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!adminAccessToken) return;
    if (!confirm(`Delete this review from ${review.customerName}? This can't be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      if (res.ok) onChanged(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="bg-white rounded-2xl shadow-sm border border-brand-warm-gray p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-brand-warm-gray relative">
          <Image src={review.itemImage} alt={review.itemName} fill sizes="56px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif font-bold text-brand-brown text-sm truncate">{review.itemName}</p>
            <span className={cn("font-sans text-xs font-semibold border rounded-full px-2 py-0.5", STATUS_BADGE[review.status])}>
              {review.status}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-brand-warm-gray")} />
            ))}
          </div>
          <p className="font-sans text-xs text-brand-brown-mid mt-1">
            {review.customerName} · Order {review.orderNumber}
          </p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2 outline-none focus:border-brand-orange transition-colors resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveComment} disabled={busy} className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-lg text-xs flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setComment(review.comment ?? ""); }} className="rounded-lg text-xs">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        review.comment && (
          <p className="font-sans text-sm text-brand-brown italic bg-brand-warm-gray/40 rounded-xl px-3 py-2">
            &ldquo;{review.comment}&rdquo;
          </p>
        )
      )}

      {!editing && (
        <div className="flex flex-wrap gap-2 pt-1">
          {review.status !== "approved" && (
            <Button size="sm" onClick={() => setStatus("approved")} disabled={busy} className="bg-brand-green-herb hover:bg-brand-green-herb/90 text-white rounded-lg text-xs flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Approve
            </Button>
          )}
          {review.status !== "hidden" && (
            <Button size="sm" variant="outline" onClick={() => setStatus("hidden")} disabled={busy} className="rounded-lg text-xs flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" /> Hide
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy} className="rounded-lg text-xs flex items-center gap-1">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button size="sm" variant="outline" onClick={remove} disabled={busy} className="border-red-300 text-red-500 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1 ml-auto">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminReviewsPage() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<ReviewStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const url = tab === "all" ? "/api/reviews/admin" : `/api/reviews/admin?status=${tab}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.success) {
          setReviews(data.reviews ?? []);
        } else {
          setError(data.error ?? "Failed to load reviews.");
        }
      } catch {
        if (!cancelled) setError("Network error loading reviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminAccessToken, tab]);

  function handleChanged(id: string, updated: Review | null) {
    setReviews((prev) => {
      if (!updated) return prev.filter((r) => r.id !== id);
      // If filtering by a specific status and the update moved it out of that bucket, drop it.
      if (tab !== "all" && updated.status !== tab) return prev.filter((r) => r.id !== id);
      return prev.map((r) => (r.id === id ? updated : r));
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-xl font-bold text-brand-brown">Reviews</h1>
        <p className="font-sans text-sm text-brand-brown-mid mt-1">
          Approve, edit, hide, or delete customer reviews. Approved reviews appear on the public site.
        </p>
      </div>

      <div className="flex gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 rounded-full font-sans text-sm font-semibold transition-colors",
              tab === t.value ? "bg-brand-orange text-white" : "bg-white border border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

      {loading ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">No reviews in this bucket yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onChanged={(updated) => handleChanged(review.id, updated)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
