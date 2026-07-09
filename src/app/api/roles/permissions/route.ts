import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/roles/permissions — owner only, full role -> permissions matrix
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/roles/permissions"), {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load permissions" }, { status: res.status });
  }

  return NextResponse.json({ success: true, permissions: data.permissions ?? {} });
}
