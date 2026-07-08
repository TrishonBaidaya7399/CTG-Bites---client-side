import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/orders/:idOrNumber/status — staff/rider
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/orders/${encodeURIComponent(id)}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update status" }, { status: res.status });
  }

  return NextResponse.json({ success: true, order: data.order ?? data });
}
