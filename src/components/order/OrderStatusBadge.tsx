import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const CONFIG: Record<OrderStatus, { label: string; cls: string; pulse?: boolean }> = {
  pending:   { label: "Pending",   cls: "bg-gray-100 text-gray-600 border-gray-200" },
  accepted:  { label: "Accepted",  cls: "bg-blue-100 text-blue-700 border-blue-200" },
  preparing: { label: "Preparing", cls: "bg-brand-orange/15 text-brand-orange border-brand-orange/30", pulse: true },
  ready:     { label: "Ready! 🎉", cls: "bg-green-100 text-green-700 border-green-300", pulse: true },
  delivered: { label: "Delivered", cls: "bg-teal-100 text-teal-700 border-teal-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600 border-red-200" },
};

export function OrderStatusBadge({ status, size = "sm" }: { status: OrderStatus; size?: "sm" | "md" }) {
  const { label, cls, pulse } = CONFIG[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-sans font-semibold border rounded-full",
      size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5",
      cls,
    )}>
      {pulse && (
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-current" />
          <span className="relative inline-flex rounded-full w-2 h-2 bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}
