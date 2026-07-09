import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/reviews/:id — staff-only, edit comment
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl(`/api/reviews/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update review" }, { status: res.status });
  }

  return NextResponse.json({ success: true, review: data.review });
}

// DELETE /api/reviews/:id — staff-only
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/reviews/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to delete review" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
