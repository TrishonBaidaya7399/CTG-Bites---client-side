import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/appetizers/:id — owner/manager only
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/appetizers/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update appetizer" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.appetizer ?? data });
}

// DELETE /api/appetizers/:id — owner/manager only
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/appetizers/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to delete appetizer" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
