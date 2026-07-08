import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/categories/:id — owner/manager only, { name }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/categories/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update category" }, { status: res.status });
  }

  return NextResponse.json({ success: true, category: data.category ?? data });
}

// DELETE /api/categories/:id — owner/manager only
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/categories/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to delete category" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
