import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/orders/track/:orderNumber — public, rate-limited on backend
export async function GET(_req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const res = await fetch(apiUrl(`/api/orders/track/${encodeURIComponent(orderNumber)}`), {
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Order not found" }, { status: res.status });
  }

  return NextResponse.json({ success: true, order: data.order ?? data });
}
