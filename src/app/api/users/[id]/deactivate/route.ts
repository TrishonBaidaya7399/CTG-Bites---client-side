import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// PATCH /api/users/:id/deactivate — owner/manager only, toggles isActive
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/users/${encodeURIComponent(id)}/deactivate`), {
    method: "PATCH",
    headers: { Authorization: authHeader },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to update staff member" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.user ?? data });
}
