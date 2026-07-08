import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/orders/:idOrNumber/cancel — owner/manager/staff/customer(if pending)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/orders/${encodeURIComponent(id)}/cancel`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to cancel order" }, { status: res.status });
  }

  return NextResponse.json({ success: true, order: data.order ?? data });
}
