import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/users/:id — owner/manager only, { name?, phone?, role? }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/users/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update staff member" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.user ?? data });
}

// DELETE /api/users/:id — owner only
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/users/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to delete staff member" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
