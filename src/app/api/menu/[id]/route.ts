import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/menu/:id — public, returns item with populated appetizers array
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(apiUrl(`/api/menu/${encodeURIComponent(id)}`), {
    next: { revalidate: 120 },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Menu item not found" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.item ?? data });
}

// PATCH /api/menu/:id — owner/manager only
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/menu/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update menu item" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.item ?? data });
}

// DELETE /api/menu/:id — owner/manager only
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/menu/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to delete menu item" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
