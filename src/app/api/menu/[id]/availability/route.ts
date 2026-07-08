import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/menu/:id/availability — owner/manager/staff
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/menu/${encodeURIComponent(id)}/availability`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update availability" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.item ?? data });
}
